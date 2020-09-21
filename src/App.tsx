import ky from 'ky';
import React from 'react';

import './App.css';

function App() {
  ky.get('/nodes');

  return (
    <div className="">
      hello Ada
    </div>
  );
}

export default App;
