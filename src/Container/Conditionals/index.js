import React, {Component} from 'react';

export default class Conditionals extends Component {
    constructor() {
        super();
        this.state = {conditionals: []};
    }

    render() {
        return (
            <div className="m-t-2">
                <div className="col-md-6 col-xs-12">
                    <div className="card card-block">
                        <h4 className="card-title">Conditionals</h4>
                        <p className="card-text">Add conditionals to control when a rule becomes active/inactive.</p>
                    </div>
                </div>
            </div>
        );
    }
}