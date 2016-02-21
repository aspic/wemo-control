var menu = ["modes", "devices"];

class Container extends React.Component {
}

class Navbar extends React.Component {
}

class NavItem extends React.Component {
}
class Home extends React.Component {
}

class Rule extends React.Component {
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
