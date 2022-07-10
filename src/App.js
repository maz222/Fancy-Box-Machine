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


const Banner = styled.div`
  width:100%;
  height:50px;
  background-color:rgb(80,80,80);
  display:flex;
  justify-content:center;
  align-items:center;
`;

const Editor = styled.div`
  width:100%;
  height:calc(100% - 50px - 40px);
  display:flex;
  justify-content:space-between;
  align-items:center;
`

class App extends React.Component {
  render() {
    return (
      <ContextContainer>
      </ContextContainer>
    );
  }
}

export default App;