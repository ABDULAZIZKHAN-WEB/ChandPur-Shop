import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import * as paymentService from '../services/paymentService';
import { toast } from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, cartSummary, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Shipping Address
    shipping_name: user?.name || '',
    shipping_phone: user?.phone || '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    
    // Billing Address
    same_as_shipping: true,
    billing_name: user?.name || '',
    billing_phone: user?.phone || '',
    billing_address: '',
    billing_city: '',
    billing_postal_code: '',
    
    // Payment
    payment_method: 'sslcommerz',
    notes: '',
  });

  console.log('Checkout component rendered:', { user, isAuthenticated });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Form submission started', { user, isAuthenticated });

    if (!isAuthenticated) {
      toast.error('You must be logged in to checkout');
      setLoading(false);
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        shipping_address: {
          name: formData.shipping_name,
          phone: formData.shipping_phone,
          address: formData.shipping_address,
          city: formData.shipping_city,
          postal_code: formData.shipping_postal_code,
        },
        billing_address: formData.same_as_shipping ? {
          name: formData.shipping_name,
          phone: formData.shipping_phone,
          address: formData.shipping_address,
          city: formData.shipping_city,
          postal_code: formData.shipping_postal_code,
        } : {
          name: formData.billing_name,
          phone: formData.billing_phone,
          address: formData.billing_address,
          city: formData.billing_city,
          postal_code: formData.billing_postal_code,
        },
        payment_method: formData.payment_method,
        notes: formData.notes,
      };

      console.log('Sending order data:', orderData);

      const response = await paymentService.initiatePayment(orderData);
      
      // Handle both successful responses and validation error responses
      if (response.data.success) {
        if (formData.payment_method === 'cod') {
          // Cash on Delivery - redirect to success page
          toast.success('Order placed successfully!');
          clearCart(); // Clear cart after successful COD order
          navigate(`/payment/success?order=${response.data.order_id}`);
        } else {
          // Online Payment - redirect to payment gateway
          toast.success('Redirecting to payment gateway...');
          if (response.data.payment_url) {
            window.location.href = response.data.payment_url;
          } else {
            navigate(`/payment/success?order=${response.data.order_id}`);
          }
        }
      } else {
        const message = response.data.message || 'Failed to place order';
        toast.error(message);
        // Display validation errors if they exist
        if (response.data.errors) {
          console.log('Validation errors:', response.data.errors);
          Object.keys(response.data.errors).forEach(key => {
            toast.error(`${key}: ${response.data.errors[key][0]}`);
          });
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
      
      // Display detailed error information
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
        Object.keys(error.response.data.errors).forEach(key => {
          toast.error(`${key}: ${error.response.data.errors[key][0]}`);
        });
      }
      
      // Log the full error response for debugging
      console.log('Full error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h5>Your cart is empty</h5>
          <p>Please add some items to your cart before checkout.</p>
          <Button href="/shop" variant="primary">Continue Shopping</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Checkout</h2>
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            {/* Shipping Address */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Shipping Address</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="shipping_name"
                        value={formData.shipping_name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="shipping_phone"
                        value={formData.shipping_phone}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    type="text"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    placeholder="Street address, apartment, suite, etc."
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        name="shipping_city"
                        value={formData.shipping_city}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Postal Code *</Form.Label>
                      <Form.Control
                        type="text"
                        name="shipping_postal_code"
                        value={formData.shipping_postal_code}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Billing Address */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Billing Address</h5>
              </Card.Header>
              <Card.Body>
                <Form.Check
                  type="checkbox"
                  name="same_as_shipping"
                  label="Same as shipping address"
                  checked={formData.same_as_shipping}
                  onChange={handleInputChange}
                  className="mb-3"
                />
                
                {!formData.same_as_shipping && (
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="billing_name"
                            value={formData.billing_name}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number *</Form.Label>
                          <Form.Control
                            type="tel"
                            name="billing_phone"
                            value={formData.billing_phone}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Address *</Form.Label>
                      <Form.Control
                        type="text"
                        name="billing_address"
                        value={formData.billing_address}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>City *</Form.Label>
                          <Form.Control
                            type="text"
                            name="billing_city"
                            value={formData.billing_city}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Postal Code *</Form.Label>
                          <Form.Control
                            type="text"
                            name="billing_postal_code"
                            value={formData.billing_postal_code}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}
              </Card.Body>
            </Card>

            {/* Payment Method */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Payment Method</h5>
              </Card.Header>
              <Card.Body>
                <Form.Check
                  type="radio"
                  name="payment_method"
                  value="sslcommerz"
                  label="Online Payment (SSLCommerz)"
                  checked={formData.payment_method === 'sslcommerz'}
                  onChange={handleInputChange}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  name="payment_method"
                  value="cod"
                  label="Cash on Delivery"
                  checked={formData.payment_method === 'cod'}
                  onChange={handleInputChange}
                />
              </Card.Body>
            </Card>

            {/* Order Notes */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Notes (Optional)</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Special instructions for your order..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Order Summary */}
            <Card className="sticky-top" style={{ top: '20px' }}>
              <Card.Header>
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                {/* Cart Items */}
                <div className="mb-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <img
                          src={item.product?.image_url || '/images/product-placeholder.jpg'}
                          alt={item.product?.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          className="rounded me-2"
                        />
                        <div>
                          <small className="d-block">{item.product?.name}</small>
                          <small className="text-muted">Qty: {item.quantity}</small>
                        </div>
                      </div>
                      <small>{formatPrice(item.price * item.quantity)}</small>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Totals */}
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cartSummary.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>{formatPrice(cartSummary.tax)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>{formatPrice(cartSummary.shipping)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong className="text-primary">{formatPrice(cartSummary.total)}</strong>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    By placing your order, you agree to our terms and conditions.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Checkout;