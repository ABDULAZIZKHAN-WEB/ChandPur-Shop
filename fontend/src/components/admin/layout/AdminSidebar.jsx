import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const menuItems = [
    { 
      path: '/admin', 
      icon: 'bi-speedometer2', 
      label: 'Dashboard', 
      end: true 
    },
    { 
      path: '/admin/categories', 
      icon: 'bi-folder', 
      label: 'Categories' 
    },
    { 
      path: '/admin/products', 
      icon: 'bi-box-seam', 
      label: 'Products' 
    },
    { 
      path: '/admin/orders', 
      icon: 'bi-cart-check', 
      label: 'Orders' 
    },
    { 
      path: '/admin/coupons', 
      icon: 'bi-ticket-perforated', 
      label: 'Coupons' 
    },
    { 
      path: '/admin/users', 
      icon: 'bi-people', 
      label: 'Users' 
    },
    { 
      path: '/admin/reviews', 
      icon: 'bi-star', 
      label: 'Reviews' 
    },
    { 
      path: '/admin/banners', 
      icon: 'bi-image', 
      label: 'Banners' 
    },
    { 
      path: '/admin/settings', 
      icon: 'bi-gear', 
      label: 'Settings' 
    },
    { 
      path: '/admin/reports', 
      icon: 'bi-graph-up', 
      label: 'Reports' 
    },
    { 
      path: '/admin/inventory', 
      icon: 'bi-archive', 
      label: 'Inventory' 
    },
  ];

  return (
    <div className="admin-sidebar bg-dark text-white p-3" style={{ minHeight: '100vh', width: '250px' }}>
      <div className="mb-4">
        <h4 className="text-center">
          <i className="bi bi-shield-check me-2"></i>
          Admin Panel
        </h4>
      </div>
      
      <Nav className="flex-column">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `nav-link text-white d-flex align-items-center py-2 px-3 rounded mb-1 ${
                isActive ? 'bg-primary' : ''
              }`
            }
            style={{ textDecoration: 'none' }}
          >
            <i className={`bi ${item.icon} me-3`}></i>
            {item.label}
          </NavLink>
        ))}
      </Nav>

      <hr className="my-4" />
      
      <Nav className="flex-column">
        <NavLink
          to="/"
          className="nav-link text-white d-flex align-items-center py-2 px-3 rounded"
          style={{ textDecoration: 'none' }}
        >
          <i className="bi bi-arrow-left me-3"></i>
          Back to Store
        </NavLink>
      </Nav>
    </div>
  );
};

export default AdminSidebar;