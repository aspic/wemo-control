import './index.css';

import React, {Component} from 'react';
import {NavItem, Globals} from '../index.js';

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
        var sections = Globals.menu.map(function(item) {
            return <NavItem key={item} name={item} handler={cmp.select} chosen={cmp.props.section}/>;
        });
        return (<nav className="navbar navbar-dark bg-inverse">
                 <a className="navbar-brand" href="#">Home Control</a>
                 <ul className="nav navbar-nav">
                  {sections}
                 </ul>
                </nav>);
    }
}
Navbar.propTypes = {
    menuSelect: React.PropTypes.string.isRequired
};
