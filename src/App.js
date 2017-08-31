import React, { Component } from 'react';
import VimGolf from './VimGolf.js'
import Header from './Header.js'
import './css/App.css';
import './css/bootstrap.min.css';

class App extends Component {
  render() {
    return (
      <div className="App">
				<Header title="Vim Golf" subtitle="Test your vim skills in an interactive playground"/>
				<VimGolf />
			</div>
    );
  }
}

export default App;
