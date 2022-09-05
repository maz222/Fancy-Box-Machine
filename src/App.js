import logo from './logo.svg';
import './App.css';

import React from 'react';

import ContextContainer from './AppData/AppContext';

class App extends React.Component {
  render() {
    return (
      <ContextContainer>
      </ContextContainer>
    );
  }
}

export default App;