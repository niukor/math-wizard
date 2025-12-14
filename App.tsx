import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { DivisionWizard } from './components/DivisionWizard';
import { LandingPage } from './components/LandingPage';
import { StudentLoginPage } from './components/StudentLoginPage';
import { TeacherLoginPage } from './components/TeacherLoginPage';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from './types';

// Updated View Types to include split login pages
type View = 'landing' | 'login-student' | 'login-teacher' | 'home' | 'division';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const handleNavigate = (page: string) => {
    if (page === 'division') {
      setCurrentView('division');
    } else {
      setCurrentView('home');
    }
  };

  return (
    <AnimatePresence mode="wait">
      
      {/* 1. Landing Page (Role Selection) */}
      {currentView === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <LandingPage 
            onSelectRole={(role) => setCurrentView(role === 'student' ? 'login-student' : 'login-teacher')} 
          />
        </motion.div>
      )}

      {/* 2a. Student Login */}
      {currentView === 'login-student' && (
        <motion.div
          key="login-student"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <StudentLoginPage 
            onLogin={handleLogin} 
            onBack={() => setCurrentView('landing')} 
          />
        </motion.div>
      )}

      {/* 2b. Teacher Login */}
      {currentView === 'login-teacher' && (
        <motion.div
          key="login-teacher"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <TeacherLoginPage 
            onLogin={handleLogin} 
            onBack={() => setCurrentView('landing')}
          />
        </motion.div>
      )}

      {/* 3. Home Page */}
      {currentView === 'home' && currentUser && (
        <motion.div
          key="home"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <HomePage 
            onNavigate={handleNavigate} 
            currentUser={currentUser} 
            onLogout={handleLogout}
          />
        </motion.div>
      )}
      
      {/* 4. Division Wizard */}
      {currentView === 'division' && (
        <motion.div
          key="division"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <DivisionWizard onBack={() => setCurrentView('home')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;