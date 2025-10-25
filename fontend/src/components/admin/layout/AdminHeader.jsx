import React from 'react';
import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Navbar bg="white" className="border-bottom px-4 py-3">
      <div className="d-flex justify-content-between align-items-center w-100">
        <div>
          <h5 className="mb-0 text-dark">Admin Dashboard</h5>
        </div>
        
        <Nav>
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="outline-primary" 
              id="admin-user-dropdown"
              className="d-flex align-items-center"
            >
              <i className="bi bi-person-circle me-2"></i>
              {user?.name}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate('/profile')}>
                <i className="bi bi-person me-2"></i>
                Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate('/')}>
                <i className="bi bi-shop me-2"></i>
                View Store
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </div>
    </Navbar>
  );
};

export default AdminHeader;