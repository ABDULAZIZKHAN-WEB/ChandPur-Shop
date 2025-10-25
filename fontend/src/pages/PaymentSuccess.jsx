import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../services/orderService';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order');
    if (orderId) {
      fetchOrder(orderId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrder = async (orderId) => {
    try {
      const response = await getOrder(orderId);
      setOrder(response.data);
      // Clear cart after successful payment
      clearCart();
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
        </div>
        <h1 className="display-5 fw-bold text-success">Payment Successful!</h1>
        <p className="lead">Thank you for your order. Your payment has been processed successfully.</p>
      </div>

      {order ? (
        <Card className="mx-auto" style={{ maxWidth: '600px' }}>
          <Card.Header className="text-center">
            <h4>Order Details</h4>
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="mb-0">Order #{order.order_number}</h6>
                <small className="text-muted">Placed on {formatDate(order.created_at)}</small>
              </div>
              <span className="badge bg-success">Paid</span>
            </div>

            <hr />

            <div className="mb-3">
              <h6>Items:</h6>
              {order.items?.map((item) => (
                <div key={item.id} className="d-flex justify-content-between mb-2">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>

            <hr />

            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Tax:</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Shipping:</span>
              <span>{formatPrice(order.shipping_cost)}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </Card.Body>
          <Card.Footer className="text-center">
            <Button variant="primary" onClick={() => navigate('/orders')}>
              View All Orders
            </Button>
            <Button variant="outline-primary" className="ms-2" onClick={() => navigate('/shop')}>
              Continue Shopping
            </Button>
          </Card.Footer>
        </Card>
      ) : (
        <Alert variant="info" className="text-center mx-auto" style={{ maxWidth: '500px' }}>
          <h5>Order Confirmed</h5>
          <p>Your payment has been processed successfully. You will receive an email confirmation shortly.</p>
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate('/orders')}>
              View Orders
            </Button>
            <Button variant="outline-primary" className="ms-2" onClick={() => navigate('/shop')}>
              Continue Shopping
            </Button>
          </div>
        </Alert>
      )}
    </Container>
  );
};

export default PaymentSuccess;