import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Detection from './pages/Detection';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

function App() {
  // check login status once at start
  const isLoggedIn = !!localStorage.getItem('loggedIn');

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* root should take the user to either login (if not authenticated)
            or the protected home page. this makes the login screen the
            "landing" page of the app. */}
        <Route
          path="/"
          element={
            // always land on the login page
            <Navigate to="/login" replace />
          }
        />

        {/* protected pages live under their own paths */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/detection"
          element={
            <PrivateRoute>
              <Detection />
            </PrivateRoute>
          }
        />

        {/* authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* catch‑all: redirect everyone to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
