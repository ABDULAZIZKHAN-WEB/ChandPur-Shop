import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { validateCoupon } from '../services/couponService';

const Cart = () => {
  const { cartItems, cartSummary, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeItem(itemId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');
    
    // Temporary test coupons for development
    const testCoupons = {
      'SAVE10': { valid: true, discount_amount: 100, discount_type: 'fixed', discount_value: 100 },
      'SAVE20': { valid: true, discount_amount: 200, discount_type: 'fixed', discount_value: 200 },
      'WELCOME': { valid: true, discount_amount: 50, discount_type: 'fixed', discount_value: 50 }
    };
    
    // Check for test coupons first
    const upperCode = couponCode.toUpperCase();
    if (testCoupons[upperCode]) {
      setTimeout(() => {
        const couponData = {
          ...testCoupons[upperCode],
          code: upperCode,
          message: 'Coupon applied successfully'
        };
        
        setAppliedCoupon(couponData);
        setDiscountAmount(couponData.discount_amount);
        setCouponSuccess(`Coupon applied! You saved ${formatPrice(couponData.discount_amount)}`);
        setCouponLoading(false);
      }, 500);
      return;
    }
    
    try {
      const response = await validateCoupon(couponCode, cartSummary.subtotal);
      const couponData = response.data;
      
      if (couponData.valid) {
        // Handle the backend response structure
        const appliedCouponData = {
          valid: true,
          code: couponData.coupon?.code || couponCode,
          discount_amount: couponData.coupon?.discount_amount || 0,
          discount_type: couponData.coupon?.type || 'fixed',
          discount_value: couponData.coupon?.value || 0,
          message: couponData.message || 'Coupon applied successfully'
        };
        
        setAppliedCoupon(appliedCouponData);
        setDiscountAmount(appliedCouponData.discount_amount);
        setCouponSuccess(`Coupon applied! You saved ${formatPrice(appliedCouponData.discount_amount)}`);
      } else {
        setCouponError(couponData.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      // Provide more user-friendly error messages
      if (error.response?.status === 500) {
        setCouponError('Coupon validation service is temporarily unavailable. Please try again later.');
      } else if (error.response?.status === 404) {
        setCouponError('Coupon validation service not found.');
      } else {
        setCouponError(error.response?.data?.message || 'Failed to validate coupon code. Please try again.');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Calculate final total with discount
  const calculateFinalTotal = () => {
    const subtotal = cartSummary.subtotal || 0;
    const tax = cartSummary.tax || 0;
    const shipping = cartSummary.shipping || 0;
    return subtotal + tax + shipping - discountAmount;
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

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <div className="py-5">
              <i className="bi bi-cart-x display-1 text-muted"></i>
              <h3 className="mt-3">Your cart is empty</h3>
              <p className="text-muted">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button as={Link} to="/shop" variant="primary" size="lg">
                Continue Shopping
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Shopping Cart ({cartSummary.items_count} items)</h4>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={handleClearCart}
              >
                Clear Cart
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product?.image_url || item.product?.image || '/images/product-placeholder.jpg'}
                            alt={item.product?.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            className="rounded me-3"
                          />
                          <div>
                            <h6 className="mb-1">
                              <Link 
                                to={`/product/${item.product?.slug}`}
                                className="text-decoration-none"
                              >
                                {item.product?.name}
                              </Link>
                            </h6>
                            {item.attribute && (
                              <small className="text-muted">
                                Size: {item.attribute.size}, Color: {item.attribute.color}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        {formatPrice(item.price)}
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center" style={{ width: '120px' }}>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="mx-2 text-center"
                            style={{ width: '60px' }}
                            min="1"
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="align-middle">
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                      </td>
                      <td className="align-middle">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Continue Shopping */}
          <div className="mt-3">
            <Button as={Link} to="/shop" variant="outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Continue Shopping
            </Button>
          </div>
        </Col>

        <Col lg={4}>
          {/* Coupon Code */}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Coupon Code</h5>
            </Card.Header>
            <Card.Body>
              {couponSuccess && (
                <Alert variant="success" className="mb-3">
                  {couponSuccess}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 ms-2"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </Button>
                </Alert>
              )}
              
              {couponError && (
                <Alert variant="danger" className="mb-3">
                  {couponError}
                </Alert>
              )}
              
              {appliedCoupon ? (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{appliedCoupon.code}</strong>
                    <div className="text-success">
                      {appliedCoupon.discount_type === 'percentage' 
                        ? `${appliedCoupon.discount_value}% off` 
                        : `${formatPrice(appliedCoupon.discount_value)} off`}
                    </div>
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Form onSubmit={handleApplyCoupon}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError('');
                      }}
                      disabled={couponLoading}
                    />
                    <Form.Text className="text-muted">
                      Try test codes: SAVE10, SAVE20, WELCOME
                    </Form.Text>
                  </Form.Group>
                  <Button 
                    type="submit" 
                    variant="outline-primary" 
                    className="w-100"
                    disabled={!couponCode || couponLoading}
                  >
                    {couponLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Applying...
                      </>
                    ) : (
                      'Apply Coupon'
                    )}
                  </Button>
                </Form>
              )}

            </Card.Body>
          </Card>

          {/* Order Summary */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(cartSummary.subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>{formatPrice(cartSummary.tax)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{formatPrice(cartSummary.shipping)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">{formatPrice(calculateFinalTotal())}</strong>
              </div>
              
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  Secure checkout powered by SSL encryption
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;