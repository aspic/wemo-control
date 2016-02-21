import './index.css';

import React, {Component} from 'react';

export default class Slider extends Component {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }
    onChange(event) {
        this.props.dimmer(event.target.value);
    }
    render() {
        return <input type="range" min="0" max="255" defaultValue={this.props.value} onMouseUp={this.onChange} onTouchEnd={this.onChange}></input>;
    }
}

Slider.propTypes = {
    dimmer: React.PropTypes.func.isRequired,
    value: React.PropTypes.string.isRequired
};
