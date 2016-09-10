import React, {Component} from 'react';
import Conditional from './Conditional';

export default class Conditionals extends Component {
    constructor() {
        super();
        this.state = {conditionals: [
            {
                and: [
                    {
                        deviceId: "foo",
                        state: "enabled"
                    }
                ],
                then: [
                    {
                        ruleId: "fooo",
                        enabled: true
                    }
                ]
            }
        ]};
    }

    render() {

        var conds = this.state.conditionals.map(function (condition) {
            return <Conditional condition={condition}/>;
        });

        return (
            <div className="m-t-2">
                <div className="col-md-8 col-xs-12">
                    {conds}
                </div>
                <div className="col-md-4 col-xs-12">
                    <div className="card card-block">
                        <h4 className="card-title">Conditionals</h4>
                        <p className="card-text">Add conditionals to control when a rule becomes active/inactive.</p>
                    </div>
                </div>
            </div>
        );
    }
}