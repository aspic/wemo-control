import React, {Component} from 'react';

export default class Item extends Component {

    constructor() {
        super();
    }

    render() {
        return (
            <li>
                <samp>
                    at:{this.props.at} action:{this.props.action} rule:{this.props.rule}
                </samp>
            </li>
        );
    }
}

Item.propTypes = {
    at: React.PropTypes.string.isRequired,
    action: React.PropTypes.string.isRequired,
    rule: React.PropTypes.string.isRequired
};