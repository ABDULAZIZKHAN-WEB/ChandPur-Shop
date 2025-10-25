import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPublicSettings } from '../../services/settingService';
import { getCategories } from '../../services/productService';

const Footer = () => {
  const [settings, setSettings] = useState({
    site_name: 'ChandPur-Shop',
    site_description: 'Your one-stop destination for quality products at affordable prices. Shop with confidence and enjoy fast, reliable delivery.',
    contact_email: 'support@chandpur-shop.com',
    contact_phone: '+880 1907-717145',
    address: 'Mirpur 10, Dhaka, Bangladesh',
    facebook_url: 'https://facebook.com/chandpur-shop',
    twitter_url: 'https://twitter.com/chandpur-shop',
    instagram_url: 'https://instagram.com/chandpur-shop',
    linkedin_url: '#',
  });

  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getPublicSettings();
      const data = response.data;
      
      // Update settings with fetched data, keeping defaults for missing values
      setSettings(prevSettings => ({
        ...prevSettings,
        site_name: data.site_name || prevSettings.site_name,
        site_description: data.site_description || prevSettings.site_description,
        contact_email: data.contact_email || prevSettings.contact_email,
        contact_phone: data.contact_phone || prevSettings.contact_phone,
        address: data.address || prevSettings.address,
        facebook_url: data.facebook_url || prevSettings.facebook_url,
        twitter_url: data.twitter_url || prevSettings.twitter_url,
        instagram_url: data.instagram_url || prevSettings.instagram_url,
        linkedin_url: data.linkedin_url || prevSettings.linkedin_url,
      }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Keep default settings if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      // Get only top-level categories (without parent_id)
      const topLevelCategories = response.data.filter(category => !category.parent_id);
      setCategories(topLevelCategories.slice(0, 5)); // Limit to 5 categories
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Keep empty array if fetch fails
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this to your backend
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <Container>
        <Row>
          <Col lg={4} md={6} className="mb-4">
            <h5 className="text-primary mb-3">
              <i className="bi bi-shop me-2"></i>
              {settings.site_name}
            </h5>
            <p className="text-muted">
              {settings.site_description || 'Your one-stop destination for quality products at affordable prices. Shop with confidence and enjoy fast, reliable delivery.'}
            </p>
              
            
            <div className="d-flex gap-3 mb-3">
              {settings.facebook_url && settings.facebook_url !== '#' && (
                <a href={settings.facebook_url} className="text-light" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-facebook fs-5"></i>
                </a>
              )}
              {settings.twitter_url && settings.twitter_url !== '#' && (
                <a href={settings.twitter_url} className="text-light" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-twitter fs-5"></i>
                </a>
              )}
              {settings.instagram_url && settings.instagram_url !== '#' && (
                <a href={settings.instagram_url} className="text-light" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-instagram fs-5"></i>
                </a>
              )}
              {settings.linkedin_url && settings.linkedin_url !== '#' && (
                <a href={settings.linkedin_url} className="text-light" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-linkedin fs-5"></i>
                </a>
              )}
            </div>
            
            {/* Newsletter Signup */}
            <h6 className="mb-3">Stay Updated</h6>
            <Form onSubmit={handleNewsletterSubmit}>
              <InputGroup className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button variant="primary" type="submit">
                  Subscribe
                </Button>
              </InputGroup>
            </Form>
          </Col>

          <Col lg={2} md={6} className="mb-4">
            <h6 className="mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shop" className="text-muted text-decoration-none">
                  Shop
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-muted text-decoration-none">
                  Contact
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/faq" className="text-muted text-decoration-none">
                  FAQ
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={2} md={6} className="mb-4">
            <h6 className="mb-3">Categories</h6>
            <ul className="list-unstyled">
              {categories.length > 0 ? (
                categories.map(category => (
                  <li key={category.id} className="mb-2">
                    <Link to={`/category/${category.slug}`} className="text-muted text-decoration-none">
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li className="mb-2">
                    <Link to="/category/electronics" className="text-muted text-decoration-none">
                      Electronics
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/category/clothing" className="text-muted text-decoration-none">
                      Clothing
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/category/home-garden" className="text-muted text-decoration-none">
                      Home & Garden
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/category/sports" className="text-muted text-decoration-none">
                      Sports
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </Col>

          <Col lg={4} md={6} className="mb-4">
            <h6 className="mb-3">Contact Info</h6>
            <div className="text-muted mb-4">
              <p className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                {settings.address}
              </p>
              <p className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                {settings.contact_phone}
              </p>
              <p className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                <a href={`mailto:${settings.contact_email}`} className="text-muted text-decoration-none">
                  {settings.contact_email}
                </a>
              </p>
              <p className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Mon - Fri: 9:00 AM - 6:00 PM
              </p>
            </div>

            <h6 className="mb-3">Customer Service</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/help" className="text-muted text-decoration-none">
                  Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/returns" className="text-muted text-decoration-none">
                  Returns
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shipping" className="text-muted text-decoration-none">
                  Shipping Info
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/track-order" className="text-muted text-decoration-none">
                  Track Order
                </Link>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4" />

        <Row className="align-items-center">
          <Col md={6}>
            <p className="text-muted mb-0">
              &copy; {new Date().getFullYear()} {settings.site_name}. All rights reserved.
            </p>
            <p className="text-muted mb-0">
              <strong>ABDUL AZIZ KHAN</strong>
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="d-flex justify-content-md-end gap-3 flex-wrap">
              <Link to="/privacy" className="text-muted text-decoration-none">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted text-decoration-none">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-muted text-decoration-none">
                Cookie Policy
              </Link>
              <Link to="/sitemap" className="text-muted text-decoration-none">
                Sitemap
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;