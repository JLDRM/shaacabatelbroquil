import React from 'react';
import './App.css';

import { MapContainer } from './components/spain-map/map-container.component';
import { BarchartContainer } from './components/barchart/barchart-container.component';

function App() {
  return (
    <div className="App">
      <h2>Rendering with d3:</h2>
      <BarchartContainer />
      <h2>Rendering with React:</h2>
      <MapContainer />
    </div>

  );
}

export default App;
