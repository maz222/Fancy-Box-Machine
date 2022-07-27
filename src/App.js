import logo from './logo.svg';
import './App.css';

import React from 'react';
import styled from "styled-components";

import AppContextProvider from './AppContextProvider';
import ContextContainer from './AppData/AppContext';

import TopMenu from './TopBar/TopBar.js';
import ToolBar from './Tools/ToolBar.js';
import LayerBar from './LayersPane/LayerBar.js';
import MainEditor from './EditorCanvas/MainEditor';

class App extends React.Component {
  render() {
    return (
      <ContextContainer>
      </ContextContainer>
    );
  }
}

export default App;