import React from 'react';
import { LightDevice, SocketDevice, SensorDevice} from './index.js';

export function mapDevices(devices, control) {
    return devices.map(function (device) {
        if (device.type === 'light') {
            return <LightDevice key={device.id} device={device} valueControl={control}/>;
        } else if(device.type === 'socket') {
            return <SocketDevice key={device.id} device={device} valueControl={control}/>;
        } else if(device.type === 'sensor') {
            return <SensorDevice key={device.id} device={device}/>;
        }
    });
}