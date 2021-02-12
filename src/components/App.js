import React from 'react';
import './style/App.css';

import ControlledPiano from './ControlledPiano';

const App = () => {
  return (
    <div style={{ position: 'relative' }}>
      <h1 style={{ margin: `2rem auto`, textAlign: 'center' }}>
        Virtual Piano
      </h1>
      <ControlledPiano />
    </div>
  );
};

export default App;
