import './index.css';
import $ from 'jquery';
import React, {Component} from 'react';

// Custom modules
import {Navbar, Rules, Devices, Globals, Log} from '../index.js';

export default class Container extends Component {
    constructor() {
        super();
        this.state = {section: Globals.menu[0], devices: []};
        this.sectionChooser = this.sectionChooser.bind(this);
    }
    sectionChooser(section) {
        this.setState({section: section});
    }
    componentWillMount() {
        var cmp = this;
        $.ajax('/api/devices').then(function(data) {
            cmp.setState({devices: data});
        });
    }
    render() {
        var chosen = this.state.section;
        var section;
        // TODO: map to components
        if(chosen === "devices") {
            section = <Devices />;
        } else if(chosen === "modes") {
            section = <Rules devices={this.state.devices}/>;
        } else if(chosen === "log") {
            section = <Log />;
        }
        return (<div className="container">
                <Navbar menuSelect={this.sectionChooser} section={this.state.section}/>
                {section}
               </div>);
    }
}
