import './index.css';

import React, {Component} from 'react';

import {DeviceDropdown } from '../index.js';
import { mapDevices } from '../deviceMapping';
import { postUpdateRule, postToggleRule, postRemoveRule } from '../ajax';

export default class Rule extends Component {
    constructor() {
        super();
        this.valueControl = this.valueControl.bind(this);
        this.updateRule = this.updateRule.bind(this);
        this.addDevice = this.addDevice.bind(this);
        this.setName = this.setName.bind(this);
        this.edit = this.edit.bind(this);
        this.remove = this.remove.bind(this);
        this.toggleRule = this.toggleRule.bind(this);
        this.state = {rule: {devices: []}, edit: false, removed: false};
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
        if (!rule.devices) {
            rule.devices = [];
        }
        rule.devices.push(device);
        this.setState({rule: rule});
    }

    edit() {
        this.setState({edit: !this.state.edit});
    }

    remove() {
        postRemoveRule(this.state.rule.id, function (data) {
            this.props.updated(data);
        }.bind(this));
    }

    toggleRule() {
        postToggleRule(this.state.rule.name, function (data) {
            this.props.updated(data);
        }.bind(this));
    }

    valueControl(id, key, value) {
        var rule = this.state.rule;
        var devices = rule.devices;
        var mapped = devices.map(function (device) {
            if (device.id === id) {
                device[key] = value;
                return device;
            }
        });
        if (mapped.length === 0) {
            var device = {id: id};
            device[key] = value;
            devices.push(device);
        }
        this.setState({rule: rule});
        this.updateRule();
    }

    updateRule() {
        var stateRule = this.state.rule;
        postUpdateRule(stateRule, function (data) {
            this.props.updated(data);
        }.bind(this));
    }

    render() {
        var toggle = this.props.rule.active ? 'fa fa-toggle-on fa-lg' : 'fa fa-toggle-off fa-lg';
        var devices = this.state.rule.devices;
        var cmp = this;
        var activeDevices;
        var availableDevices;
        var devicesLength = 0;
        if (devices) {
            activeDevices = mapDevices(devices, cmp.valueControl);
            availableDevices = this.props.devices.filter(function (device) {
                return !devices.some(function (device2) {
                    return device.id === device2.id;
                });
            });
            devicesLength = activeDevices.length;
        } else {
            availableDevices = this.props.devices;
        }
        var detailClasses = (!this.state.edit ? 'hidden' : '');
        var dropdownClasses = (!availableDevices || availableDevices.length === 0) ? 'hidden' : 'col-md-2 col-xs-12';
        var name = <span>{this.state.rule.name} ({devicesLength})</span>;
        if (this.state.edit) {
            name = (
                <input
                    type="text"
                    name="name"
                    className="form-control"
                    defaultValue={this.state.name}
                    onChange={this.setName}/>);
        }
        if (this.state.removed) {
            return <div></div>;
        }
        return (<div>
            <div className="row m-t-2 ">
                <div className="col-md-10 col-xs-10 form-inline">
                    <h4><a onClick={this.toggleRule}><i className={toggle}/></a> {name} </h4>
                </div>
                <div className="col-md-2 col-xs-2">
                    <a><i className="fa fa-pencil-square-o fa-lg" onClick={this.edit}/></a>
                    <a className="pull-right"><i className="fa fa-times -o fa-lg" onClick={this.remove}/></a>
                </div>
            </div>
            <div className={detailClasses}>
                <div className="col-md-10 col-xs-10 rule-section">
                    <div className="form-group">
                        {activeDevices}
                    </div>
                </div>
                <div className={dropdownClasses}>
                    <DeviceDropdown devices={availableDevices} addDevice={this.addDevice}/>
                </div>
            </div>

        </div>);
    }
}

Rule.propTypes = {
    rule: React.PropTypes.object.isRequired,
    devices: React.PropTypes.array.isRequired,
    updated: React.PropTypes.func
};
