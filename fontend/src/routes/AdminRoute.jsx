import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Container, Alert } from 'react-bootstrap';

const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_admin) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h5>Access Denied</h5>
          <p>You don't have permission to access the admin panel.</p>
        </Alert>
      </Container>
    );
  }

  return <Outlet />;
};

export default AdminRoute;