import React, {Component} from 'react';

// import $ from 'jquery';
import Item from './Item';
import { getLog } from '../ajax';

export default class Log extends Component {
    constructor() {
        super();
        this.state = {log: []};
    }

    componentDidMount() {
        getLog(function (log) {
            this.setState({log: log});
        }.bind(this));
    }

    render() {

        var items = this.state.log.map(function(item) {
            return <Item key={item.at} at={item.at} action={item.action} rule={item.rule}/>;
        });

        return (
            <div className="col-md-12 m-t-1">
                <ul className="list-unstyled">
                    {items}
                </ul>
            </div>
        );
    }
}
