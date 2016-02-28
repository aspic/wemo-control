import './index.css';
import React, {Component} from 'react';
import $ from 'jquery';

import {Slider} from '../index.js';

export default class LightDevice extends Component {
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
        var dimValue = this.state.device.brightness.replace(":0", "");
        return (<div className="m-t-1">
                <h4>
                 <a className={classes} onClick={this.clicked}><i className="fa fa-lightbulb-o fa-lg"></i></a> {name}
                 <Slider value={dimValue} dimmer={this.dimmed} />
                </h4>
               </div>);
    }
}

LightDevice.propTypes = {
    device: React.PropTypes.object.isRequired,
    valueControl: React.PropTypes.func.isRequired
};
