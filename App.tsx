import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { DivisionWizard } from './components/DivisionWizard';
import { LandingPage } from './components/LandingPage';
import { StudentLoginPage } from './components/StudentLoginPage';
import { TeacherLoginPage } from './components/TeacherLoginPage';
import { AnimatePresence, motion } from 'framer-motion';
import type { User } from './types';

// Updated View Types to include split login pages
type View = 'landing' | 'login-student' | 'login-teacher' | 'home' | 'division';

const STORAGE_KEY = 'mathWizard_session';
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 Hours in milliseconds

interface SessionData {
  user: User;
  lastActive: number;
}

const App: React.FC = () => {
  // Helper to get valid session
  const getValidSession = (): User | null => {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) return null;

      const session: SessionData = JSON.parse(json);
      const now = Date.now();

      // Check if expired
      if (now - session.lastActive > SESSION_TIMEOUT) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return session.user;
    } catch (error) {
      return null;
    }
  };

  // Initialize state
  const [currentUser, setCurrentUser] = useState<User | null>(() => getValidSession());

  const [currentView, setCurrentView] = useState<View>(() => {
    return getValidSession() ? 'home' : 'landing';
  });

  // Function to handle login
  const handleLogin = (user: User) => {
    const session: SessionData = {
      user,
      lastActive: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setCurrentUser(user);
    setCurrentView('home');
  };

  // Function to handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setCurrentView('landing');
  }, []);

  // Update activity timestamp (Throttle this to avoid writing to storage on every pixel move)
  const updateActivity = useCallback(() => {
    if (!currentUser) return;

    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
      const session: SessionData = JSON.parse(json);
      // Only write if last update was more than 1 minute ago to save performance
      if (Date.now() - session.lastActive > 60 * 1000) {
        session.lastActive = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }
    }
  }, [currentUser]);

  // Effect 1: Listen for user activity to extend session
  useEffect(() => {
    if (!currentUser) return;

    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    
    // Simple throttle wrapper
    let timeoutId: number;
    const handleActivity = () => {
      if (!timeoutId) {
        timeoutId = window.setTimeout(() => {
          updateActivity();
          timeoutId = 0;
        }, 1000); // Throttle 1 second
      }
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentUser, updateActivity]);

  // Effect 2: Periodic check for expiration (e.g., if tab was left open overnight)
  useEffect(() => {
    if (!currentUser) return;

    const intervalId = setInterval(() => {
      const session = getValidSession(); // This function clears storage if expired
      if (!session) {
        handleLogout(); // Force UI update
        alert("由于长时间未操作，请重新登录");
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [currentUser, handleLogout]);

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