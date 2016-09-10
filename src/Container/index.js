import './index.css';
import React, {Component} from 'react';

// Custom modules
import {Navbar, Rules, Devices, Globals, Log} from '../index.js';
import Conditionals from './Conditionals';
import { getDevices } from '../ajax';

export default class Container extends Component {
    constructor() {
        super();
        this.state = {section: Globals.menu[0], devices: []};
        this.sectionChooser = this.sectionChooser.bind(this);

        this.cmps = {
            devices: function () {
                return <Devices />;
            },
            modes: function () {
                return <Rules devices={this.state.devices}/>;
            }.bind(this),
            log: function () {
                return <Log />;
            },
            conditionals: function () {
                return <Conditionals />;
            }
        };
    }

    sectionChooser(section) {
        this.setState({section: section});
    }

    componentWillMount() {
        getDevices(function (data) {
            this.setState({devices: data});
        }.bind(this));
    }

    render() {
        var chosen = this.state.section;
        var section = this.cmps[chosen]();

        return (<div className="container">
            <Navbar menuSelect={this.sectionChooser} section={this.state.section}/>
            {section}
        </div>);
    }
}
