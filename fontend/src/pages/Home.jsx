import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Carousel, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { getFeaturedProducts, getCategories } from '../services/productService';
import { getBanners } from '../services/bannerService';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse, bannersResponse] = await Promise.all([
        getFeaturedProducts(),
        getCategories(),
        getBanners('home_slider')
      ]);
      
      setFeaturedProducts(productsResponse.data);
      setCategories(categoriesResponse.data.slice(0, 6)); // Show only first 6 categories
      setBanners(bannersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Welcome to ChandPur-Shop
              </h1>
              <p className="lead mb-4">
                Discover amazing products at unbeatable prices. Shop with confidence 
                and enjoy fast, reliable delivery to your doorstep.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/shop" variant="light" size="lg">
                  Shop Now
                </Button>
                <Button as={Link} to="/shop?featured=true" variant="outline-light" size="lg">
                  Featured Products
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <img 
                src="/assets/hero_shopping.gif" 
                alt="Shopping" 
                className="img-fluid"
                style={{ maxHeight: '400px' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-4">
              <div className="p-4">
                <i className="bi bi-truck fs-1 text-primary mb-3"></i>
                <h5>Free Shipping</h5>
                <p className="text-muted">Free shipping on orders over BDT10000</p>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="p-4">
                <i className="bi bi-shield-check fs-1 text-primary mb-3"></i>
                <h5>Secure Payment</h5>
                <p className="text-muted">100% secure payment processing</p>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="p-4">
                <i className="bi bi-arrow-clockwise fs-1 text-primary mb-3"></i>
                <h5>Easy Returns</h5>
                <p className="text-muted">30-day return policy</p>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="p-4">
                <i className="bi bi-headset fs-1 text-primary mb-3"></i>
                <h5>24/7 Support</h5>
                <p className="text-muted">Round-the-clock customer support</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>


       {/* Banner Carousel */}
      {banners.length > 0 && (
        <section className="banner-section">
          <Carousel fade interval={5000} className="banner-carousel">
            {banners.map(banner => (
              <Carousel.Item key={banner.id}>
                <div className="banner-slide" style={{ height: '400px', position: 'relative' }}>
                  <img
                    className="d-block w-100 h-100"
                    src={banner.image_url}
                    alt={banner.title}
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="banner-overlay">
                    <Container>
                      <Row className="h-100 align-items-center">
                        <Col lg={6}>
                          <div className="banner-content text-white">
                            <h2 className="display-5 fw-bold mb-3">{banner.title}</h2>
                            {banner.link && (
                              <Button 
                                as={Link} 
                                to={banner.link} 
                                variant="light" 
                                size="lg"
                                className="mt-3"
                              >
                                Shop Now
                              </Button>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Container>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-5">
          <Container>
            <Row className="mb-5">
              <Col className="text-center">
                <h2 className="display-6 fw-bold mb-3">Shop by Category</h2>
                <p className="lead text-muted">
                  Explore our wide range of product categories
                </p>
              </Col>
            </Row>
            <Row>
              {categories.map(category => (
                <Col key={category.id} lg={2} md={4} sm={6} className="mb-4">
                  <Card 
                    as={Link} 
                    to={`/category/${category.slug}`}
                    className="category-card text-decoration-none h-100"
                  >
                    <Card.Img 
                      variant="top" 
                      src={category.image_url || '/assets/category-placeholder.jpg'}
                      alt={category.name}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                    <Card.Body className="text-center">
                      <Card.Title className="h6 text-dark">
                        {category.name}
                      </Card.Title>
                      <small className="text-muted">
                        {category.products_count || 0} products
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <Row>
              <Col className="text-center">
                <Button as={Link} to="/shop" variant="outline-primary" size="lg">
                  View All Categories
                </Button>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-5 bg-light">
          <Container>
            <Row className="mb-5">
              <Col className="text-center">
                <h2 className="display-6 fw-bold mb-3">Featured Products</h2>
                <p className="lead text-muted">
                  Check out our handpicked featured products
                </p>
              </Col>
            </Row>
            <Row>
              {featuredProducts.slice(0, 8).map(product => (
                <Col key={product.id} lg={3} md={4} sm={6} className="mb-4">
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
            <Row>
              <Col className="text-center">
                <Button as={Link} to="/shop?featured=true" variant="primary" size="lg">
                  View All Featured Products
                </Button>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h3 className="fw-bold mb-3">Stay Updated</h3>
              <p className="mb-0">
                Subscribe to our newsletter and get the latest deals and offers 
                delivered straight to your inbox.
              </p>
            </Col>
            <Col lg={6}>
              <div className="d-flex gap-2">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Enter your email"
                />
                <Button variant="light">
                  Subscribe
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;