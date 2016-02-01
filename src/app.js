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
        this.valueControl = this.valueControl.bind(this);
        this.updateRule = this.updateRule.bind(this);
        this.state = {deviceRules: {}};
    }
    valueControl(id, key, value) {
        var deviceRules = this.state.deviceRules;
        if(!deviceRules[id]) {
            deviceRules[id] = {}
        }
        deviceRules[id][key] = value;
        this.setState({deviceRules: deviceRules});
        this.updateRule();
    }
    updateRule() {
        var key = this.props.rule.name;
        var rule = this.props.rule;
        rule["deviceRules"] = this.state.deviceRules;
        $.ajax({
            url: "/api/rule/" + key + "/update",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                console.log(data);
            },
            data: JSON.stringify(rule)
        });
    }
    render() {
        var toggle = this.props.rule.active ? "fa fa-toggle-on fa-lg" : "fa fa-toggle-off fa-lg";
        var devices = this.props.rule.devices.length;
        var cmp = this;
        var activeDevices = this.props.rule.devices.map(function(device) {
            return <Device key={device.id} device={device} valueControl={cmp.valueControl} />;
        });

        return  <div>
                 <a onClick={this.props.toggleRule.bind(this, this.props.rule.name)}> <i className={toggle}></i> </a>
                 {this.props.rule.name} ({devices} device(s))
                 <div className="form-group">
                  <input type="text" name="name" className="form-control" defaultValue={this.props.rule.name}></input>
                  {activeDevices}
                 </div>
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
        var devices = this.state.devices.map(function(device) {
            return <Device key={device.id} device={device} />;
        });
        return <div className="row col-md-12">{devices}</div>;
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
        if(device.enabled) {
            this.setState({clicked: true});
        }
        this.setState({device: device});
    }
    clicked() {
        var nextState = !this.state.clicked;
        var id = this.state.device.id;
        var action = nextState ? "on" : "off";

        if(this.props.valueControl) {
            this.props.valueControl(id, 'state', action);
            this.setState({clicked: nextState});
        } else {
            this.toggleDevice(id, action);
        }
    }
    toggleDevice(id, action) {
        var cmp = this;
        $.ajax("/api/device/" + id + "/toggle").then(function(data) {
            if(data) {
                var device = data;
                cmp.setState({clicked: device.enabled, device: device});
            }
        });
    }
    dimmed(value) {
        var id = this.state.device.id;
        if(this.props.valueControl) {
            this.props.valueControl(id, 'brightness', value);
        } else {
            this.dimDevice(id, value);
        }
    }
    dimDevice(id, value) {
        var cmp = this;
        $.ajax("/api/device/" + id + "/brightness/" + value).then(function(data) {
            if(data) {
                cmp.setState({device: data, clicked: data.enabled});
            }
        });
    }
    render() {
        var name = this.state.device.name;
        var classes = "icon-tinted" + (this.state.clicked ? " active" : "");
        var text = this.state.clicked ? "Off" : "On";
        var dimValue = this.state.device.brightness;
        return <div className="row col-md-12 m-t-1">
                <div className="row col-md-12">
                 <div>
                  <h4>
                   <a className={classes} onClick={this.clicked}><i className="fa fa-lightbulb-o fa-lg"></i></a> {name}
                  </h4>
                 </div>
                 <div>
                  <Slider value={dimValue} dimmer={this.dimmed} />
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
