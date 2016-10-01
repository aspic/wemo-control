import './index.css';
import React, {Component} from 'react';

import { postDeviceSetter } from '../../ajax';

export default class SocketDevice extends Component {
    constructor() {
        super();
        this.state = {device: {}};
        this.playNext = this.playNext.bind(this);
        this.playPrevious = this.playPrevious.bind(this);
    }

    componentWillMount() {
        var device = this.props.device;
        this.setState({device: device});
    }

    playNext() {
        var id = this.state.device.id;
        postDeviceSetter(id, 'playNext', 0, function (device) {
            this.setState({device: device});
        }.bind(this));
    }

    playPrevious() {
        var id = this.state.device.id;
        postDeviceSetter(id, 'playPrevious', 0, function (device) {
            this.setState({device: device});
        }.bind(this));
    }

    render() {
        var name = this.state.device.name;
        return (<div className="m-t-1">
            <h4>
                <i className="fa fa-music fa-lg"/> {name}
                <div className="row m-t-1">
                    <div className="col-md-1">
                        <a onClick={this.playPrevious}><i className="fa fa-step-backward fa-lg" aria-hidden="true"/></a>
                    </div>
                    <div className="col-md-1">
                        <a onClick={this.playNext}><i className="fa fa-step-forward fa-lg" aria-hidden="true"/></a>
                    </div>
                </div>
            </h4>
        </div>);
    }
}

SocketDevice.propTypes = {
    device: React.PropTypes.object.isRequired,
    valueControl: React.PropTypes.func.isRequired
};
