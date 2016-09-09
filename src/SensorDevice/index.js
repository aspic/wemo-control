import './index.css';
import React, {Component} from 'react';

export default class SocketDevice extends Component {
    constructor() {
        super();
        this.state = {active: false, device: {}};
    }

    componentWillMount() {
        var device = this.props.device;
        if (device.enabled) {
            this.setState({active: true});
        }
        this.setState({device: device});
    }

    render() {
        var name = this.state.device.name;
        var classes = "fa fa-lg" + (this.state.active ? " fa-eye" : " fa-low-vision");
        return (<div className="m-t-1">
            <h4>
                <i className={classes}/> {name}
            </h4>
        </div>);
    }
}

SocketDevice.propTypes = {
    device: React.PropTypes.object.isRequired
};
