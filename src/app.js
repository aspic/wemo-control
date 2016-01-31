var enabledKey = "10006";
var dimKey = "10008";

var menu = ["devices", "rules"];

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
        } else if(chosen === "rules") {
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
    constructor() {
        super();
        this.state = {};
        this.toggleRule = this.toggleRule.bind(this);
    }

    componentWillMount() {
        var cmp = this;
        $.ajax("/api/rules").then(function(data) {
            console.log(data);
            cmp.setState(data);
        });
    }

    toggleRule(ruleName) {
        var cmp = this;
        $.ajax("/api/rules/" + ruleName + "/toggle").then(function(data) {
            cmp.setState(data);
        });
    }

    render() {
        var available = [];
        var rules = this.state;
        var cmp = this;

        for(var key in rules) {
            if(rules.hasOwnProperty(key)) {
                var rule = rules[key];
                available.push(<Rule key={rule.name} rule={rule} toggleRule={this.toggleRule}/>);
            }
        }
        return  <div className="row col-md-12">
                 <h3>Configured rules</h3> 
                 {available}
                </div>;
    }
}

class Rule extends React.Component {
    constructor() {
        super();
    }
    render() {
        var toggle = this.props.rule.active ? "fa fa-toggle-on fa-lg" : "fa fa-toggle-off fa-lg";

        return  <div>
                 <a onClick={this.props.toggleRule.bind(this, this.props.rule.name)}> <i className={toggle}></i> </a>
                 {this.props.rule.name}
                </div>
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
        this.state = {clicked: false, device: {}};
        this.clicked = this.clicked.bind(this);
        this.dimmed = this.dimmed.bind(this);
    }
    componentWillMount() {
        var device = this.props.device;
        var enabled = device.capabilities[enabledKey]
        if(enabled == 1) {
            this.setState({clicked: true});
        }
        this.setState({device: device});
    }
    clicked() {
        var cmp = this;
        var nextState = !this.state.clicked;
        var id = this.state.device.deviceId;
        var action = nextState ? "on" : "off";
        $.ajax("/api/device/" + id + "/" + action).then(function(data) {
            if(data) {
                var device = data;
                var isEnabled = device.capabilities[enabledKey] == 1;
                cmp.setState({clicked: isEnabled, device: device});
            }
        });
    }
    dimmed(value) {
        var cmp = this;
        var id = this.state.device.deviceId;
        $.ajax("/api/device/" + id + "/level/" + value).then(function(data) {
            if(data) {
                cmp.setState({device: data});
            }
        });
    }
    render() {
        var name = this.state.device.friendlyName;
        var classes = "icon-tinted" + (this.state.clicked ? " active" : "");
        var text = this.state.clicked ? "Off" : "On";
        var dimValue = this.state.device.capabilities[dimKey].split(":")[0];
        return <div className="row col-md-12 m-t-1">
                <div className="row col-md-12">
                 <div>
                  <h4>
                   <a className={classes} onClick={this.clicked}><i className="fa fa-lightbulb-o fa-lg"></i></a> {name}
                  </h4>
                 </div>
                 <div>
                  <Slider value={dimValue} dimmer={this.dimmed}/>
                 </div>
                </div>
            </div>;
    }
}

class Slider extends React.Component {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }
    onChange(event) {
        this.props.dimmer(event.target.value);
    }
    render() {
        return <div>0 <input type="range" min="0" max="255" defaultValue={this.props.value} onMouseUp={this.onChange} onTouchEnd={this.onChange}></input> 100</div>
    }
}

ReactDOM.render(
  <Container />,
  document.getElementById('app-container')
);
