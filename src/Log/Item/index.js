import React, {Component} from 'react';

export default class Item extends Component {

    constructor() {
        super();
        this.renderers = {
            plugin: Item.plugin,
            state: Item.state,
            rule: Item.rule
        };
    }

    render() {

        var fn = this.renderers[this.props.log.type];
        var rendered = fn ? fn(this.props.log) : '';

        return (
            <tr>
                <td>{this.props.log.type}</td>
                <td>{this.props.log.name}</td>
                {rendered}
                <th scope="row">{this.props.log.at}</th>
            </tr>
        );
    }

    static plugin(log) {
        return (
            <td className={Item.classes(log)}>enabled: {log.enabled ? 'true' : 'false'}</td>
        );
    }
    static state(log) {
        return (
            <td className={Item.classes(log)}>state: {log.enabled ? 'on' : 'off'}</td>
        );
    }
    static rule(log) {
        return (
            <td>rule was: {log.action}</td>
        );
    }
    static classes(log) {
        return log.enabled ? 'table-success' : 'table-warning';
    }
}

Item.propTypes = {
    log: React.PropTypes.object.isRequired
};