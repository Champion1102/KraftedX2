import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import Calculator from './Calculator';

function App() {
  return (
    <Router> 
      <div className="App">
        <Calculator />
      </div>
    </Router>
  );
}

export default App;
