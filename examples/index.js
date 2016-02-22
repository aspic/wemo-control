import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

import React, {Component} from 'react';
import {Container} from 'webpack-react-starter';

class App extends Component {
  render() {
    return (
      <div>
        <Container />
      </div>
    );
  }
}

React.render(
  <App />,
  document.getElementById('app')
);
