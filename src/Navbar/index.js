import './index.css';

import React, {Component} from 'react';
import {NavItem} from '../index.js';

var menu = ['modes', 'devices'];

export default class Navbar extends Component {
    constructor() {
        super();
        this.select = this.select.bind(this);
    }
    select(key) {
        this.props.menuSelect(key);
    }
    render() {
        var cmp = this;
        var sections = menu.map(function(item) {
            return <NavItem key={item} name={item} handler={cmp.select} chosen={cmp.props.section}/>;
        });
        return (<nav className="navbar navbar-dark bg-inverse">
                 <a className="navbar-brand" href="#">Wemo Control</a>
                 <ul className="nav navbar-nav">
                  {sections}
                 </ul>
                </nav>);
    }
}
Navbar.propTypes = {
    menuSelect: React.PropTypes.string.isRequired
};