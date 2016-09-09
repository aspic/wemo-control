import React, {Component} from 'react';

import { getDevice } from '../ajax';

export default class SocketDevice extends Component {
    constructor() {
        super();
        this.state = {active: false, device: {}};
        this.poll = this.poll.bind(this);
    }

    componentWillMount() {
        var device = this.props.device;
        if (device.enabled) {
            this.setState({active: true});
        }
        this.setState({device: device});
    }

    componentDidMount() {
        setTimeout(this.poll, 3000);
    }

    poll() {
        getDevice(this.state.device.id, function(device) {
            this.setState({active: device.enabled, device: device});
            setTimeout(this.poll, 3000)
        }.bind(this));
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
