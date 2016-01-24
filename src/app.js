var enabledKey = "10006";
var dimKey = "10008";

class Container extends React.Component {
    render() {
        return <div className="container">
                <Devices />  
               </div>;
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
            return <Device device={device} />;
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
