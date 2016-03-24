const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const browserHistory = ReactRouter.browserHistory;
const Button = ReactBootstrap.Button;
const ButtonGroup = ReactBootstrap.ButtonGroup;
const DropdownButton = ReactBootstrap.DropdownButton;
const MenuItem = ReactBootstrap.MenuItem;

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: false,
  breaks: false,
  pedantic: true,
  sanitize: true,
  smartLists: false,
  smartypants: false
});

class FactTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      factoids: [],
      settings: false,
      sortKey: "Time",
      reverseSort: true,
      filterText: ""
    };
  }

  componentDidMount() {
    $.ajax({
      url: "factoids.php?json=" + this.props.params.factDB,
      dataType: "json",
      cache: true,
      success: function(data) {
        document.title = this.state.factDB + 'facts';
        this.setState({ factoids: data });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  handleSettingsClick(e) {
    e.preventDefault();
    let newState = ! this.state.settings;
    this.setState({ settings: newState });
  }

  onSortingChange(e) {
    if(e.target.text == this.state.sortKey) {
      let reverse = ! this.state.reverseSort;
      this.setState({ reverseSort: reverse });
    } else {
      this.setState({ sortKey: e.target.text });
    }
  }

  onFilterChange(e) {
    this.setState({ filterText: e.target.value });
  }

  render() {
    let rows = [];
    const re = new RegExp(this.state.filterText, "i");
    let facts = this.state.factoids.filter(f => re.test(f.name) || re.test(f.fact));

    facts = _.sortBy(facts, this.state.sortKey.toLowerCase());
    if(this.state.reverseSort) {
      facts = facts.reverse();
    }

    facts.forEach((f) =>
      rows.push(<Factoid
        name={f.name}
        fact={f.fact}
        nick={f.nick}
        time={f.time}
      />)
    );

    return(
      <table className="table table-striped table-condensed">
        <thead>
          <tr>
            <th className="col-sm-2">Factoid</th>
            <th colSpan="2">
              Response
              <div className="pull-right">
                <a href="#" onClick={this.handleSettingsClick.bind(this)}>
                  <i className="fa fa-gears fa-1g"></i>
                </a>
              </div>
            </th>
          </tr>
          {this.state.settings ? <Settings
            filterChange={this.onFilterChange.bind(this)}
            filterText={this.state.filterText}
            sortKey={this.state.sortKey}
            sortChange={this.onSortingChange.bind(this)}
            /> : null}
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

class Settings extends React.Component {
  render() {
    return (
      <tr>
        <td className="info text-right form-group form-inline" colSpan="3">
          <div className="settings-group">
            <div className="input-group pull-left">
              <div className="input-group-addon">filter by</div>
              <input
                id="filterInput"
                className="form-control"
                placeholder="filter"
                value={this.props.filterText}
                onChange={this.props.filterChange} />
            </div>
            <div>
              <label>sort by </label>
              <DropdownButton title={this.props.sortKey} pullRight onSelect={this.props.sortChange}>
                <MenuItem eventKey="time">Time</MenuItem>
                <MenuItem eventKey="name">Name</MenuItem>
                <MenuItem eventKey="nick">Nick</MenuItem>
              </DropdownButton>
            </div>
          </div>
        </td>
      </tr>
    )
  }
}

class Factoid extends React.Component {

  rawMarkup() {
    const rawMarkup = marked(this.props.fact);
    return { __html: rawMarkup };
  }

  render() {
    return(
      <tr>
        <td className="factName">!{this.props.name}</td>
        <td className="factoid" dangerouslySetInnerHTML={this.rawMarkup()} />
        <td className="factInfo">
          <div className="nick">{this.props.nick}</div>
          <div className="time">
            <a title={moment(this.props.time).format("ddd MMM Do YYYY h:mm:ss a")}>
              {moment(this.props.time).fromNow()}
            </a>
          </div>
        </td>
      </tr>
    );
  }
}

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/facts/" component={FactTable} />
    <Route path="/facts/:factDB" component={FactTable} />
  </Router>), document.getElementById("main"));
