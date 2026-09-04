import React, { useState } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import OptInForm from './pages/OptInForm';

function App() {
  const [currentPage, setCurrentPage] = useState(new URLSearchParams(window.location.search).get('page') || 'dashboard');

  return (
    <div className="App">
      {currentPage === 'form' ? (
        <OptInForm />
      ) : (
        <Dashboard setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
