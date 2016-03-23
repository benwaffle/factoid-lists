<?php
function getDirtyFactoids($file, $returnjson=false) {
  if(! file_exists($file) || dirname($file) != '/home/dan/build/factoid') {
    return false;
  }

  $factoids = explode("\n", trim(file_get_contents($file)));
  $table = [];

  for($i = 0, $len = count($factoids); $i < $len; ++$i) {
    $json = json_decode($factoids[$i], true);
    $key = $json['key'];
    $message = isset($json['val']['message'])
      ? $json['val']['message']
      : '';

    if(empty($message) && isset($table[$key])) {
      unset($table[$key]);
      continue;
    }

    $table[$key] = [ 'nick' => $json['val']['editor']['nickname'], 'time' => strtotime($json['val']['time'])*1000 ];

    switch($json['val']['intent']) {
      case 'alias':
        $table[$key]['fact'] = "*alias for $message*";
        break;
      case 'act':
        $table[$key]['fact'] = "/me " . $message;
        break;
      case 'say':
        $table[$key]['fact'] = $message;
    }
  }

  if($returnjson == true) {
    $table = array_map(function($k, $v) {
      $a = array('name' => $k);
      foreach($v as $i => $j) {
        $a[$i] = $j;
      }
      return $a;
    }, array_keys($table), array_values($table));
  }
  return $table;
}

function jsonFacts($file) {
  $file = trim($file);
  $file = filter_var($file, FILTER_SANITIZE_STRING);
  echo json_encode(getDirtyFactoids("/path/to/$file-factoids.json", true));
}

if(isset($_GET['json'])) {
  header('Content-Type:application/json');
  jsonFacts($_GET['json']);
}
