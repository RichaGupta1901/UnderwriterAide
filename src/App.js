import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ApplicantDashboard from './components/ApplicantDashboard';
import UnderwriterDashboard from './components/UnderwriterDashboard';
import Wireframes from './components/Wireframes';
// NEW: Import the renamed dashboard component
import RiskAnalysisDashboard from './components/RiskAnalysisDashboard';
import { useState, useEffect } from 'react';

function App() {
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock authentication function
  const handleLogin = (type) => {
    setUserType(type);
    setIsAuthenticated(true);
    localStorage.setItem('userType', type);
    localStorage.setItem('isAuthenticated', 'true');
  };

  // Check if user is already logged in
  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    const storedAuth = localStorage.getItem('isAuthenticated');

    if (storedAuth === 'true' && storedUserType) {
      setUserType(storedUserType);
      setIsAuthenticated(true);
    }
  }, []);

  // Mock logout function
  const handleLogout = () => {
    setUserType(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userType');
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={!isAuthenticated ? <Login onLogin={handleLogin} /> :
            <Navigate to={userType === 'applicant' ? '/applicant-dashboard' : '/underwriter-dashboard'} />} />

          <Route path="/applicant-dashboard" element={
            isAuthenticated && userType === 'applicant' ?
            <ApplicantDashboard onLogout={handleLogout} /> :
            <Navigate to="/" />
          } />

          {/* UPDATED: Path now ends with '/*' to allow for nested routes */}
          <Route path="/underwriter-dashboard/*" element={
            isAuthenticated && userType === 'underwriter' ?
            <UnderwriterDashboard onLogout={handleLogout} /> :
            <Navigate to="/" />
          } />

          {/* UPDATED: The element now uses the correctly imported component */}
          <Route path="/original-dashboard" element={<RiskAnalysisDashboard />} />

          {/* Wireframes and mockups */}
          <Route path="/wireframes" element={<Wireframes />} />

          {/* Redirect any other routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;