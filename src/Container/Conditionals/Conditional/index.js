import React, {Component} from 'react';

export default class Conditional extends Component {

    constructor() {
        super();
        this.state = {condition: {}};
    }

    componentWillMount() {
        this.setState({condition: this.props.condition});
    }

    render() {

        var ands = this.state.condition.and.map(function(device) {
            return (
                <div>device {device.deviceId} IS {device.state}</div>
            );
        });
        var thens = this.state.condition.then.map(function (rule) {
            return (
                <div>{rule.enabled ? 'enable' : 'disable'} rule {rule.ruleId}</div>
            );
        });

        return (
            <div className="card card-block">
                IF {ands}
                THEN {thens}
            </div>
        );
    }
}

Conditional.propTypes = {
    condition: React.PropTypes.object.isRequired
};
