var enabledKey = "10006";
var dimKey = "10008";

var menu = ["modes", "devices"];

class Container extends React.Component {
    constructor() {
        super();
        this.state = {section: menu[0], devices: []};
        this.sectionChooser = this.sectionChooser.bind(this);
    }
    sectionChooser(section) {
        this.setState({section: section});
    }
    componentWillMount() {
        var cmp = this;
        $.ajax("/api/devices").then(function(data) {
            cmp.setState({devices: data});
        });
    }
    render() {
        var chosen = this.state.section;
        var section;
        // TODO: map to components
        if(chosen === "devices") {
            section = <Devices devices={this.state.devices}/>
        } else if(chosen === "modes") {
            section = <Home devices={this.state.devices}/>
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
        this.add = this.add.bind(this);
        this.state = {rules: []};
    }

    componentWillMount() {
        var cmp = this;
        $.ajax("/api/rules").then(function(rules) {
            cmp.setState({rules: rules});
        });
    }


    add() {
        var rules = this.state.rules;
        var newRule = {id: -1};
        rules.push(newRule);
        this.setState({rules: rules});
    }

    render() {
        var rules = this.state.rules;
        var cmp = this;
        var i = 0;

        var available = rules.map(function(rule) {
            i++;
            return <Rule key={i} rule={rule} devices={cmp.props.devices}/>;
        });
        return  <div className="col-md-12 m-t-2">
                 <div className="col-md-6 col-xs-10">
                  <a onClick={this.add}><i className="fa fa-plus fa-lg"></i></a>
                  {available}
                 </div>
                 <div className="col-md-6 col-xs-2">
                 </div>
                </div>;
    }
}

class Rule extends React.Component {
    constructor() {
        super();
        this.valueControl = this.valueControl.bind(this);
        this.updateRule = this.updateRule.bind(this);
        this.addDevice = this.addDevice.bind(this);
        this.setName = this.setName.bind(this);
        this.edit = this.edit.bind(this);
        this.remove = this.remove.bind(this);
        this.toggleRule = this.toggleRule.bind(this);
        this.state = {rule: {devices: []}, edit: false};
    }
    componentWillMount() {
        this.setState({rule: this.props.rule, name: this.props.rule.name});
    }
    setName(event) {
        var rule = this.state.rule;
        rule.name = event.target.value;
        this.setState({rule: rule});
        this.updateRule();
    }
    addDevice(device) {
        var rule = this.state.rule;
        if(!rule.devices) {
            rule.devices = [];
        }
        rule.devices.push(device);
        this.setState({rule: rule});
    }
    edit() {
        this.setState({edit: !this.state.edit});
    }
    remove() {
        var rule = this.state.rule;
        rule.removed = true;
        this.setState({rule: rule});
        this.updateRule();
    }
    toggleRule(name) {
        var cmp = this;
        var name = this.state.rule.name;
        $.ajax("/api/rule/" + name + "/toggle").then(function(rule) {
            console.log(rule);
            cmp.setState({rule: rule});
        });
    }
    valueControl(id, key, value) {
        var rule = this.state.rule;
        var devices = rule.devices;
        var mapped = devices.map(function(device) {
            if(device.id === id) {
                device[key] = value;
                return device;
            }
        });
        if(mapped.length === 0) {
            var device = {id: id};
            device[key] = value;
            devices.push(device);
        }
        this.setState({rule: rule});
        this.updateRule();
    }
    updateRule() {
        var cmp = this;
        var rule = this.state.rule;
        var id = rule.id;
        rule["devices"] = rule.devices;
        $.ajax({
            url: "/api/rule/" + id + "/update",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            success: function (rule) {
                cmp.setState({rule: rule, name: rule.name});
            },
            data: JSON.stringify(rule)
        });
    }
    render() {
        var toggle = this.state.rule.active ? "fa fa-toggle-on fa-lg" : "fa fa-toggle-off fa-lg";
        var devices = this.state.rule.devices;
        var cmp = this;
        var activeDevices; 
        var availableDevices; 
        var devicesLength = 0;
        if(devices) {
            activeDevices = devices.map(function(device) {
                return <LightDevice key={device.id} device={device} valueControl={cmp.valueControl} />;
            });
            availableDevices = this.props.devices.filter(function(device) {
                return !devices.some(function(device2) {
                    return device.id == device2.id;
                });
            });
            devicesLength = activeDevices.length;
        } else {
            availableDevices = this.props.devices;
        }
        var detailClasses = (!this.state.edit ? "hidden" : "");
        var dropdownClasses = (!availableDevices || availableDevices.length == 0) ? "hidden" : "col-md-2 col-xs-12";
        var name = <span>{this.state.rule.name} ({devicesLength})</span>
        if(this.state.edit) {
            name = <input type="text" name="name" className="form-control" defaultValue={this.state.name} onChange={this.setName}></input>
        }
        
        return  <div>
                 <div className="row m-t-2">
                  <div className="col-md-10 col-xs-10 form-inline">
                   <h4><a onClick={this.toggleRule}><i className={toggle}></i></a> {name} </h4>
                  </div>
                  <div className="col-md-2 col-xs-2">
                   <a><i className="fa fa-pencil-square-o fa-lg" onClick={this.edit}></i></a>
                   <a className="pull-right"><i className="fa fa-times -o fa-lg" onClick={this.remove}></i></a>
                  </div>
                 </div>
                 <div className={detailClasses}>
                  <div className="col-md-10 col-xs-10">
                  <div className="form-group">
                   {activeDevices}
                  </div>
                 </div>
                 <div className={dropdownClasses}>
                  <DeviceDropdown devices={availableDevices} addDevice={this.addDevice}/>
                 </div>
                </div>
                </div>
    }
}

class Devices extends React.Component {

    render() {
        var devices = this.props.devices.map(function(device) {
            if(device.type === "light") {
                return <LightDevice key={device.id} device={device} />;
            }
        });
        return <div className="m-t-2">
                <div className="col-md-6 col-xs-12">{devices}</div>
                <div className="col-md-6 col-xs-12">
                 <div className="card card-block">
                  <h4 className="card-title">Devices</h4>
                  <p className="card-text">These are all devices discovered on your network. These devices are directly controllable.</p>
                 </div> 
                </div>
               </div>
    }
}

class LightDevice extends React.Component {
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
        if(this.props.valueControl) {
            this.props.valueControl(id, 'enabled', nextState);
            this.setState({clicked: nextState});
        } else {
            this.toggle(id);
        }
    }
    toggle() {
        var cmp = this;
        var id = this.state.device.id;
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
            this.dim(id, value);
        }
    }
    dim(id, value) {
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
        return <div className="m-t-1">
                <h4>
                 <a className={classes} onClick={this.clicked}><i className="fa fa-lightbulb-o fa-lg"></i></a> {name}
                 <Slider value={dimValue} dimmer={this.dimmed} />
                </h4>
               </div>;
    }
}

class DeviceDropdown extends React.Component {
    constructor() {
        super();
        this.open = this.open.bind(this);
        this.state = {open: false};
    }
    open() {
        this.setState({open: !this.state.open});
    }
    render() {
        var cmp = this;
        var devices = this.props.devices.map(function(device) {
            var deviceInfo = {id: device.id, name: device.name, type: device.type};
            return <a className="dropdown-item" onClick={cmp.props.addDevice.bind(cmp, deviceInfo)}>{device.name}</a>
        });
        var classes = "dropdown" + (this.state.open ? " open" : "");
        return  <div className={classes}> 
                 <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" onClick={this.open}>
                  Devices
                 </button>
                 <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
                  {devices}
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
        return <input type="range" min="0" max="255" defaultValue={this.props.value} onMouseUp={this.onChange} onTouchEnd={this.onChange}></input>
    }
}

ReactDOM.render(
  <Container />,
  document.getElementById('app-container')
);