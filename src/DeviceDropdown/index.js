import React, {Component} from 'react';

export default class DeviceDropdown extends Component {
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
            return <a className="dropdown-item" onClick={cmp.props.addDevice.bind(cmp, deviceInfo)}>{device.name}</a>;
        });
        var classes = 'dropdown' + (this.state.open ? ' open' : '');
        return (<div className={classes}>
                 <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" onClick={this.open}>
                  Devices
                 </button>
                 <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
                  {devices}
                 </div>
                </div>);
    }
}

DeviceDropdown.propTypes = {
    devices: React.PropTypes.array.isRequired
};
