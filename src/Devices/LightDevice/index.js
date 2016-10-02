import './index.css';
import React, {Component} from 'react';

import {Slider} from '../../index.js';
import { postDeviceSetter } from '../../ajax';

export default class LightDevice extends Component {
    constructor() {
        super();
        this.state = {clicked: false, device: {}};
        this.clicked = this.clicked.bind(this);
        this.dimmed = this.dimmed.bind(this);
    }

    componentWillMount() {
        var device = this.props.device;
        this.setState({device: device, clicked: device.enabled === "1"});
    }

    clicked() {
        var nextState = !this.state.clicked;
        var id = this.state.device.id;
        if (this.props.valueControl) {
            this.props.valueControl(id, 'enabled', nextState);
            this.setState({clicked: nextState});
        } else {
            this.toggle(id);
        }
    }

    toggle() {
        const {id, enabled} = this.state.device;
        postDeviceSetter(id, 'enabled', enabled === "1" ? 0 : 1, function(device) {
            this.setState({clicked: device.enabled === "1", device: device});
        }.bind(this));

    }

    dimmed(value) {
        var id = this.state.device.id;
        if (this.props.valueControl) {
            this.props.valueControl(id, 'brightness', value);
        } else {
            this.dim(id, value);
        }
    }

    dim(id, value) {
        postDeviceSetter(id, 'brightness', value, function(data) {
            this.setState({device: data, clicked: data.enabled});
        }.bind(this));
    }

    render() {

        var name = this.state.device.name;
        var classes = 'icon-tinted' + (this.state.clicked ? ' active' : '');
        var dimValue = 0;
        if (this.state.device.brightness) {
            dimValue = this.state.device.brightness.replace(':0', '');
        }
        return (<div className="m-t-1">
            <h4>
                <a className={classes} onClick={this.clicked}><i className="fa fa-lightbulb-o fa-lg"/></a> {name}
                <Slider value={dimValue} dimmer={this.dimmed}/>
            </h4>
        </div>);
    }
}

LightDevice.propTypes = {
    device: React.PropTypes.object.isRequired,
    valueControl: React.PropTypes.func.isRequired
};
