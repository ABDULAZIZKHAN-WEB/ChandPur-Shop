import React from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error');
  const orderId = searchParams.get('order');

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <div className="mb-4">
          <i className="bi bi-x-circle-fill text-warning" style={{ fontSize: '4rem' }}></i>
        </div>
        <h1 className="display-5 fw-bold text-warning">Payment Cancelled</h1>
        <p className="lead">Your payment process was cancelled.</p>
      </div>

      <Card className="mx-auto" style={{ maxWidth: '600px' }}>
        <Card.Body className="text-center">
          {error ? (
            <Alert variant="warning">
              <h5>Cancel Details</h5>
              <p className="mb-0">{error}</p>
            </Alert>
          ) : (
            <Alert variant="info">
              <h5>What happened?</h5>
              <p className="mb-0">
                You have cancelled the payment process. 
                {orderId && ` Order reference: ${orderId}`}
              </p>
            </Alert>
          )}

          <div className="mt-4">
            <Button variant="primary" onClick={() => navigate('/checkout')}>
              Try Again
            </Button>
            <Button variant="outline-primary" className="ms-2" onClick={() => navigate('/orders')}>
              View Orders
            </Button>
            <Button variant="outline-secondary" className="ms-2" onClick={() => navigate('/shop')}>
              Continue Shopping
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentCancel;