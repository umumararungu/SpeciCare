import React from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/common/Header';
import MainContent from './components/common/MainContent';
import LoadingSpinner from './components/common/LoadingSpinner';
import Notification from './components/common/Notification';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Header />
        <MainContent />
        <LoadingSpinner />
        <Notification />
      </div>
    </AppProvider>
  );
}

export default App;
