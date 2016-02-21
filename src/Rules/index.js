import React, {Component} from 'react';
import $ from 'jquery';

export default class NavItem extends Component {
    constructor() {
        super();
        this.add = this.add.bind(this);
        this.state = {rules: []};
    }

    componentWillMount() {
        var cmp = this;
        $.ajax("/api/rules").then(function(rules) {
            cmp.setState({rules: rules});
        });
    }

    add() {
        var rules = this.state.rules;
        var newRule = {id: -1};
        rules.push(newRule);
        this.setState({rules: rules});
    }

    render() {
        var rules = this.state.rules;
        // var cmp = this;
        var i = 0;

        var available = rules.map(function() {
            i++;
            //return <Rule key={i} rule={rule} devices={cmp.props.devices}/>;
            return <span>foo</span>;
        });
        return (<div className="col-md-12 m-t-2">
                 <div className="col-md-6 col-xs-10">
                  <a onClick={this.add}><i className="fa fa-plus fa-lg"></i></a>
                  {available}
                 </div>
                 <div className="col-md-6 col-xs-2">
                 </div>
                </div>);
    }
}
