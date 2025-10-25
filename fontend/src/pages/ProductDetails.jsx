import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge, Tabs, Tab, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { getProduct } from '../services/productService';
import { getProductReviews, createReview } from '../services/reviewService';
import { toast } from 'react-hot-toast';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Review state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [reviewErrors, setReviewErrors] = useState({});
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product]);

  useEffect(() => {
    if (product && product.attributes && product.attributes.length > 0) {
      // Set the first attribute as default
      setSelectedAttribute(product.attributes[0]);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProduct(slug);
      setProduct(response.data.product || response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product details');
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!product) return;
    
    try {
      setReviewsLoading(true);
      const response = await getProductReviews(product.id);
      console.log('Reviews fetched:', response.data);
      
      // Handle different response structures
      if (response.data.reviews) {
        // Backend returns reviews with pagination
        setReviews(response.data.reviews.data || response.data.reviews);
      } else if (Array.isArray(response.data)) {
        // Direct array of reviews
        setReviews(response.data);
      } else {
        // Fallback to empty array
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Don't show error toast as reviews are optional
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const cartData = {
        product_id: product.id,
        quantity: quantity,
        attribute_id: selectedAttribute?.id || null
      };

      const response = await addToCart(cartData);
      if (response.success) {
        toast.success('Product added to cart successfully');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const cartData = {
        product_id: product.id,
        quantity: quantity,
        attribute_id: selectedAttribute?.id || null
      };

      const response = await addToCart(cartData);
      if (response.success) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await toggleWishlist(product.id);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateReviewForm = () => {
    const errors = {};
    
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
    
    if (!reviewForm.comment.trim()) {
      errors.comment = 'Comment is required';
    } else if (reviewForm.comment.trim().length < 10) {
      errors.comment = 'Comment must be at least 10 characters';
    }
    
    setReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateReviewForm()) {
      return;
    }
    
    try {
      setSubmittingReview(true);
      
      console.log('Submitting review with data:', {
        product_id: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        isAuthenticated,
        user
      });
      
      const reviewData = {
        product_id: product.id, // Make sure product_id is included
        rating: reviewForm.rating,
        comment: reviewForm.comment
      };
      
      const response = await createReview(reviewData);
      console.log('Review submission response:', response);
      toast.success(response.data.message || 'Review submitted successfully');
      
      // Refresh reviews
      fetchReviews();
      
      // Reset form and close modal
      setReviewForm({
        rating: 5,
        comment: ''
      });
      setReviewErrors({});
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
      
      // Set field-specific errors if provided by backend
      if (error.response?.data?.errors) {
        setReviewErrors(error.response.data.errors);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const calculateAverageRating = () => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return (
      <>
        {[1, 2, 3, 4, 5].map((star) => (
          <i 
            key={star} 
            className={`bi ${star <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
          ></i>
        ))}
      </>
    );
  };

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

  if (error || !product) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger" className="text-center">
              <h4>Product Not Found</h4>
              <p>{error || 'The product you are looking for does not exist or has been removed.'}</p>
              <Button variant="primary" onClick={() => navigate('/shop')}>
                Continue Shopping
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const isInCartCheck = isInCart(product.id, selectedAttribute?.id || null);
  const isInWishlistCheck = isInWishlist(product.id);

  // Determine which image to display
  const mainImage = product.gallery_urls && product.gallery_urls.length > 0 
    ? product.gallery_urls[selectedImage] 
    : product.image_url || '/assets/product-placeholder.jpg';

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/" className="text-decoration-none">Home</a>
          </li>
          <li className="breadcrumb-item">
            <a href="/shop" className="text-decoration-none">Shop</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <Row>
        {/* Product Images */}
        <Col lg={6}>
          <Card className="mb-3">
            <Card.Img 
              variant="top" 
              src={mainImage} 
              alt={product.name}
              className="product-main-image"
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Card>
          
          {product.gallery_urls && product.gallery_urls.length > 1 && (
            <div className="d-flex overflow-auto gap-2 pb-2">
              {product.gallery_urls.map((image, index) => (
                <div 
                  key={index} 
                  className={`border rounded ${selectedImage === index ? 'border-primary' : ''}`}
                  style={{ cursor: 'pointer', minWidth: '80px', height: '80px' }}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`Product ${index + 1}`}
                    className="img-fluid h-100 w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </Col>

        {/* Product Details */}
        <Col lg={6}>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h1 className="mb-2">{product.name}</h1>
              <div className="d-flex align-items-center mb-3">
                <div className="me-2">
                  {renderStars(calculateAverageRating())}
                </div>
                <span className="text-muted">
                  ({Array.isArray(reviews) ? reviews.length : 0} reviews)
                </span>
              </div>
            </div>
            <Button 
              variant={isInWishlistCheck ? "danger" : "outline-danger"}
              size="sm"
              onClick={handleWishlistToggle}
            >
              <i className={`bi ${isInWishlistCheck ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            </Button>
          </div>

          <div className="mb-3">
            <span className="h4 text-primary me-2">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-muted text-decoration-line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
            {product.compare_price && product.compare_price > product.price && (
              <Badge bg="success" className="ms-2">
                {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
              </Badge>
            )}
          </div>

          <p className="text-muted mb-4">
            {product.short_description || product.description?.substring(0, 150) + '...'}
          </p>

          {/* Product Attributes (Size/Color) */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-3">Available Options:</h6>
              <div className="d-flex flex-wrap gap-2">
                {product.attributes.map((attribute) => (
                  <Button
                    key={attribute.id}
                    variant={selectedAttribute?.id === attribute.id ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => setSelectedAttribute(attribute)}
                    className="d-flex align-items-center"
                  >
                    {attribute.size && <span className="me-1">Size: {attribute.size}</span>}
                    {attribute.color && (
                      <span className="d-flex align-items-center">
                        {attribute.size && ", "}
                        Color: {attribute.color}
                        <span 
                          className="ms-1 rounded-circle border" 
                          style={{ 
                            width: '15px', 
                            height: '15px', 
                            backgroundColor: attribute.color.toLowerCase() 
                          }}
                        ></span>
                      </span>
                    )}
                    {attribute.additional_price > 0 && (
                      <span className="ms-1">+{formatPrice(attribute.additional_price)}</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-4">
            <h6 className="mb-2">Quantity:</h6>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Form.Control
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="mx-2 text-center"
                style={{ width: '80px' }}
                min="1"
              />
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-grid gap-2 mb-4">
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleAddToCart}
              disabled={isInCartCheck}
            >
              {isInCartCheck ? (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Added to Cart
                </>
              ) : (
                <>
                  <i className="bi bi-cart me-2"></i>
                  Add to Cart
                </>
              )}
            </Button>
            <Button 
              variant="success" 
              size="lg"
              onClick={handleBuyNow}
            >
              <i className="bi bi-lightning me-2"></i>
              Buy Now
            </Button>
          </div>

          {/* Product Meta Info */}
          <div className="border-top pt-3">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">SKU:</span>
              <span>{product.sku || 'N/A'}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Category:</span>
              <span>{product.category?.name || 'N/A'}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Availability:</span>
              <span className={product.is_in_stock ? 'text-success' : 'text-danger'}>
                {product.is_in_stock ? `${product.quantity} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Product Description and Reviews */}
      <Row className="mt-5">
        <Col>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="description" title="Description">
              <Card>
                <Card.Body>
                  <div dangerouslySetInnerHTML={{ __html: product.description || 'No description available' }} />
                </Card.Body>
              </Card>
            </Tab>
            <Tab eventKey="reviews" title={`Reviews (${Array.isArray(reviews) ? reviews.length : 0})`}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="mb-1">Customer Reviews</h4>
                      <div className="d-flex align-items-center">
                        <div className="h2 mb-0 me-2">{calculateAverageRating()}</div>
                        <div>
                          {renderStars(calculateAverageRating())}
                          <div className="text-muted">
                            Based on {Array.isArray(reviews) ? reviews.length : 0} {Array.isArray(reviews) && reviews.length === 1 ? 'review' : 'reviews'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/login');
                          return;
                        }
                        setShowReviewModal(true);
                      }}
                    >
                      Write a Review
                    </Button>
                  </div>

                  {reviewsLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" />
                    </div>
                  ) : Array.isArray(reviews) && reviews.length > 0 ? (
                    <div className="reviews-list">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-bottom pb-3 mb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <div className="fw-bold">{review.user?.name || 'Anonymous'}</div>
                            <div className="text-muted small">
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="mb-2">
                            {renderStars(review.rating)}
                          </div>
                          <p className="mb-0">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert variant="info" className="text-center">
                      <h5>No reviews yet</h5>
                      <p>Be the first to review this product!</p>
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReviewSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Rating *</Form.Label>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="link"
                    className="p-0 me-1"
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                  >
                    <i 
                      className={`bi ${star <= reviewForm.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                      style={{ fontSize: '1.5rem' }}
                    ></i>
                  </Button>
                ))}
              </div>
              {reviewErrors.rating && (
                <div className="text-danger small mt-1">{reviewErrors.rating}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comment *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewInputChange}
                isInvalid={!!reviewErrors.comment}
                placeholder="Share your experience with this product..."
              />
              <Form.Control.Feedback type="invalid">
                {reviewErrors.comment}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={submittingReview}
            >
              {submittingReview ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductDetails;