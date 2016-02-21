import React, {Component} from 'react';

import {LightDevice} from '../index.js';

export default class Devices extends Component {
    render() {
        var devices = this.props.devices.map(function(device) {
            if(device.type === "light") {
                return <LightDevice key={device.id} device={device} />;
            }
        });
        return (<div className="m-t-2">
                <div className="col-md-6 col-xs-12">{devices}</div>
                <div className="col-md-6 col-xs-12">
                 <div className="card card-block">
                  <h4 className="card-title">Devices</h4>
                  <p className="card-text">These are all devices discovered on your network. These devices are directly controllable.</p>
                 </div>
                </div>
               </div>);
    }
}

Devices.propTypes = {
    devices: React.PropTypes.array.isRequired
};