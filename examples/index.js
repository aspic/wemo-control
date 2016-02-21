import './app.css';

import React, {Component} from 'react';
import {HelloWorld} from 'webpack-react-starter';

class App extends Component {
  render() {
    return (
      <div>
        <HelloWorld />
        <p><img src="homer.jpg" width="240" /></p>
      </div>
    );
  }
}

React.render(
  <App />,
  document.getElementById('app')
);