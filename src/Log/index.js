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
            return <Item key={item.log} log={item}/>;
        });

        return (
            <table className="table table-sm">
                <thead>
                    <tr>
                        <th>at</th>
                        <th>type</th>
                        <th>name</th>
                        <th>description</th>
                    </tr>
                </thead>
                <tbody>
                    {items}
                </tbody>
            </table>
        );
    }
}
