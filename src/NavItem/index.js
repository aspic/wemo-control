import React, {Component} from 'react';

export default class NavItem extends Component {
    render() {
        var key = this.props.name;
        var classes = 'nav-item' + (key === this.props.chosen ? ' active' : '');

        return (<li className={classes}>
                 <a className="nav-link" onClick={this.props.handler.bind(this, key)}>{key}</a>
                </li>);
    }
}

NavItem.propTypes = {
    name: React.PropTypes.string.isRequired,
    handler: React.PropTypes.function,
    chosen: React.PropTypes.boolean
};
