import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { getCategories } from '../../services/productService';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const { getItemsCount } = useCart();
  const { getItemsCount: getWishlistCount } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Function to render nested categories with hover functionality
  const renderCategoryWithHover = (category) => {
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <div key={category.id} className="category-item">
        <Link to={`/category/${category.slug}`} className="category-link">
          {category.name}
          {hasChildren && <i className="bi bi-chevron-right ms-1"></i>}
        </Link>
        
        {hasChildren && (
          <div className="subcategory-dropdown">
            {category.children.map(child => (
              <div key={child.id} className="subcategory-item">
                <Link to={`/category/${child.slug}`} className="subcategory-link">
                  {child.name}
                  {child.products_count > 0 && (
                    <span className="product-count ms-2">({child.products_count})</span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Navbar expand="lg" className="navbar-light bg-white sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3">
          <i className="bi bi-shop text-primary me-2"></i>
          ChandPur-Shop
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Search Bar */}
          <Form className="d-flex mx-auto" style={{ width: '400px' }} onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary" type="submit">
                <i className="bi bi-search"></i>
              </Button>
            </InputGroup>
          </Form>

          <Nav className="ms-auto align-items-center">
            {/* Categories Dropdown with Hover */}
            <div className="categories-dropdown">
              <div className="categories-toggle nav-link">
                Categories <i className="bi bi-chevron-down ms-1"></i>
              </div>
              
              <div className="categories-menu">
                <div className="main-categories">
                  <Link to="/shop" className="all-products-link">
                    All Products
                  </Link>
                  {categories.map(category => renderCategoryWithHover(category))}
                </div>
              </div>
            </div>

            <Nav.Link as={Link} to="/shop" className="text-dark">
              Shop
            </Nav.Link>

            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <Nav.Link as={Link} to="/wishlist" className="text-dark position-relative">
                  <i className="bi bi-heart fs-5"></i>
                  {getWishlistCount() > 0 && (
                    <Badge bg="danger" className="cart-badge">
                      {getWishlistCount()}
                    </Badge>
                  )}
                </Nav.Link>

                {/* Cart */}
                <Nav.Link as={Link} to="/cart" className="text-dark position-relative me-3">
                  <i className="bi bi-cart fs-5"></i>
                  {getItemsCount() > 0 && (
                    <Badge bg="danger" className="cart-badge">
                      {getItemsCount()}
                    </Badge>
                  )}
                </Nav.Link>

                {/* User Dropdown */}
                <Dropdown as={Nav.Item}>
                  <Dropdown.Toggle as={Nav.Link} className="text-dark">
                    <i className="bi bi-person-circle fs-5 me-1"></i>
                    {user?.name}
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item as={Link} to="/dashboard">
                      <i className="bi bi-speedometer2 me-2"></i>
                      Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/orders">
                      <i className="bi bi-bag me-2"></i>
                      My Orders
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profile">
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Dropdown.Item>
                    {user?.is_admin && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to="/admin">
                          <i className="bi bi-gear me-2"></i>
                          Admin Panel
                        </Dropdown.Item>
                      </>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-dark">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;