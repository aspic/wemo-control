import React, {Component} from 'react';

import {Rule} from '../index.js';
import { getRules } from '../ajax';


export default class Rules extends Component {
    constructor() {
        super();
        this.add = this.add.bind(this);
        this.state = {rules: []};
    }

    componentWillMount() {
        getRules(function (rules) {
            this.setState({rules: rules});
        }.bind(this));
    }

    add() {
        var rules = this.state.rules;
        var newRule = {id: Date.now()};
        rules.push(newRule);
        this.setState({rules: rules});
    }

    updated(data) {
        this.setState({rules: data});
    }

    render() {
        var rules = this.state.rules;
        var i = 0;

        var available = rules.map(function(rule) {
            i++;
            return (
                <Rule
                    key={i}
                    rule={rule}
                    devices={this.props.devices}
                    updated={this.updated.bind(this)}/>
            );
        }.bind(this));
        return (<div className="col-md-12 m-t-2">
                 <div className="col-md-6 col-xs-10">
                  <a onClick={this.add}><i className="fa fa-plus fa-lg" /></a>
                  {available}
                 </div>
                 <div className="col-md-6 col-xs-2">
                 </div>
                </div>);
    }
}

Rules.propTypes = {
    devices: React.PropTypes.array.isRequired
};