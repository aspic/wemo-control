class HelloWorld extends React.Component {
    render() {
        return <span>test test!</span>;
    }
}

ReactDOM.render(
  <HelloWorld />,
  document.getElementById('app-container')
);
