import React from 'react';
import './App.css';
import Navigation from './Components/Navigation/Navigation';
import { Outlet } from 'react-router-dom';


function App() {
  return (
    <>
      <Navigation />
      <Outlet /> 
    </>
  );
}

export default App;
