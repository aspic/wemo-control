var enabledKey = "10006";
var dimKey = "10008";

var menu = ["home", "devices"];

class Container extends React.Component {
    constructor() {
        super();
        this.state = {section: menu[0]};
        this.sectionChooser = this.sectionChooser.bind(this);
    }
    sectionChooser(section) {
        this.setState({section: section});
    }
    render() {
        var chosen = this.state.section;
        var section;
        // TODO: map to components
        if(chosen === "devices") {
            section = <Devices />
        } else if(chosen === "home") {
            section = <Home />
        }
        return <div className="container">
                <Navbar menuSelect={this.sectionChooser} section={this.state.section}/>
                {section}
               </div>;
    }
}

class Navbar extends React.Component {
    constructor() {
        super();
        this.select = this.select.bind(this);
    }
    select(key) {
        this.props.menuSelect(key);
    }
    render() {
        var cmp = this;
        var sections = menu.map(function(item) {
            return <NavItem key={item} name={item} handler={cmp.select} chosen={cmp.props.section}/>;
        });
        return  <nav className="navbar navbar-dark bg-inverse">
                 <a className="navbar-brand" href="#">Wemo Control</a>
                 <ul className="nav navbar-nav">
                  {sections}
                 </ul>
                </nav>
    }
}

class NavItem extends React.Component {
    render() {
        var key = this.props.name;
        var classes = "nav-item" + (key === this.props.chosen ? " active" : "");

        return  <li className={classes}>
                 <a className="nav-link" onClick={this.props.handler.bind(this, key)}>{key}</a>
                </li>
    }
}
class Home extends React.Component {
    render() {
        return <div>home..</div>
    }
}

class Devices extends React.Component {

    constructor() {
        super();
        this.state = {devices: []};
    }

    componentWillMount() {
        var cmp = this;
        $.ajax("/api/devices").then(function(data) {
            cmp.setState({devices: data});
        });
    }

    render() {
        var test = this.state.devices.map(function(device) {
            return <Device key={device.deviceId} device={device} />;
        });
        return <div className="row col-md-12">{test}</div>;
    }
}

class Device extends React.Component {
    constructor() {
        super();
        this.state = {clicked: false};
        this.clicked = this.clicked.bind(this);
    }
    componentWillMount() {
        var enabled = this.props.device.capabilities[enabledKey];
        if(enabled == 1) {
            this.setState({clicked: true});
        }
    }
    clicked() {
        var nextState = !this.state.clicked;
        var id = this.props.device.deviceId;
        var action = nextState ? "on" : "off";
        var cmp = this;
        $.ajax("/api/device/" + id + "/" + action).then(function(data) {
            if(data) {
                var isEnabled = data.capabilities[enabledKey] == 1;
                cmp.setState({clicked: isEnabled});
            }
        });
    }
    render() {
        var name = this.props.device.friendlyName;
        var classes = "btn " + (this.state.clicked ? " btn-success active" : " btn-secondary");
        var text = this.state.clicked ? "Off" : "On";
        return <div>
             <i className="fa fa-lightbulb-o"></i> {name}
             <div>
              <button onClick={this.clicked} type="button" className={classes} data-toggle="button">
              {text}
              </button>
             </div>
            </div>;
    }
}

ReactDOM.render(
  <Container />,
  document.getElementById('app-container')
);
