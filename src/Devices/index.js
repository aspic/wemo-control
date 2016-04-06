import React, {Component} from 'react';
import {LightDevice} from '../index.js';
import { getDevices } from '../ajax';

export default class Devices extends Component {
    constructor() {
        super();
        this.state = {devices: []};
    }

    componentWillMount() {
        getDevices(function(data) {
            this.setState({devices: data});
        }.bind(this));
    }

    render() {
        var devices = this.state.devices.map(function (device) {
            if (device.type === 'light') {
                return <LightDevice key={device.id} device={device}/>;
            }
        });
        return (<div className="m-t-2">
            <div className="col-md-6 col-xs-12">{devices}</div>
            <div className="col-md-6 col-xs-12">
                <div className="card card-block">
                    <h4 className="card-title">Devices</h4>
                    <p className="card-text">These are all devices discovered on your network. These devices are
                        directly controllable.</p>
                </div>
            </div>
        </div>);
    }
}
