import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('loggedIn');
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
