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

        console.log(this.props.log);
        var fn = this.renderers[this.props.log.type];
        var rendered = fn ? fn(this.props.log) : "";

        return (
            <tr>
                <td>{this.props.log.at}</td>
                <td>{this.props.log.type}</td>
                <td>{this.props.log.name}</td>
                {rendered}
            </tr>
        );
    }

    static plugin(log) {
        return (
            <td>enabled: {log.enabled ? "true":"false"}</td>
        );
    }
    static state(log) {
        return (
            <td>enabled: {log.enabled ? "true":"false"}</td>
        );
    }
    static rule(log) {
        return (
            <td>rule was: {log.action}</td>
        );
    }
}

Item.propTypes = {
    log: React.PropTypes.object.isRequired
};