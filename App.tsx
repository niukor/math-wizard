import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { DivisionWizard } from './components/DivisionWizard';

type View = 'home' | 'division';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');

  const handleNavigate = (page: string) => {
    if (page === 'division') {
      setCurrentView('division');
    } else {
      setCurrentView('home');
    }
  };

  return (
    <>
      {currentView === 'home' && (
        <HomePage onNavigate={handleNavigate} />
      )}
      
      {currentView === 'division' && (
        <DivisionWizard onBack={() => setCurrentView('home')} />
      )}
    </>
  );
};

export default App;