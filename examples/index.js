import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, {Component} from 'react';
import {HelloWorld} from 'webpack-react-starter';

class App extends Component {
  render() {
    return (
      <div>
        <HelloWorld />
      </div>
    );
  }
}

React.render(
  <App />,
  document.getElementById('app')
);
