import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/orderService';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.data.data);
      setPagination(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      processing: { variant: 'info', text: 'Processing' },
      shipped: { variant: 'primary', text: 'Shipped' },
      delivered: { variant: 'success', text: 'Delivered' },
      cancelled: { variant: 'danger', text: 'Cancelled' },
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      paid: { variant: 'success', text: 'Paid' },
      failed: { variant: 'danger', text: 'Failed' },
      refunded: { variant: 'info', text: 'Refunded' },
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  // Function to get status timeline progress
  const getStatusProgress = (status) => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const currentIndex = statusOrder.indexOf(status);
    
    return (
      <div className="mt-2">
        <div className="d-flex justify-content-between small text-muted mb-1">
          <span>Pending</span>
          <span>Processing</span>
          <span>Shipped</span>
          <span>Delivered</span>
        </div>
        <div className="progress" style={{ height: '8px' }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ 
              width: `${(currentIndex / (statusOrder.length - 2)) * 100}%`,
              backgroundColor: status === 'cancelled' ? '#dc3545' : '#0d6efd'
            }}
          ></div>
        </div>
      </div>
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

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2 className="mb-4">My Orders</h2>

          {orders.length === 0 ? (
            <Alert variant="info" className="text-center">
              <h5>No orders found</h5>
              <p>You haven't placed any orders yet.</p>
              <Button as={Link} to="/shop" variant="primary">
                Start Shopping
              </Button>
            </Alert>
          ) : (
            <>
              {orders.map((order) => (
                <Card key={order.id} className="mb-3">
                  <Card.Header>
                    <Row className="align-items-center">
                      <Col md={3}>
                        <strong>Order #{order.order_number}</strong>
                      </Col>
                      <Col md={3}>
                        <small className="text-muted">
                          Placed on {formatDate(order.created_at)}
                        </small>
                      </Col>
                      <Col md={2}>
                        {getStatusBadge(order.order_status)}
                      </Col>
                      <Col md={2}>
                        {getPaymentStatusBadge(order.payment_status)}
                      </Col>
                      <Col md={2} className="text-end">
                        <Button
                          as={Link}
                          to={`/orders/${order.id}`}
                          variant="outline-primary"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <div className="d-flex flex-wrap">
                          {order.items?.slice(0, 3).map((item, index) => (
                            <div key={index} className="d-flex align-items-center me-3 mb-2">
                              <img
                                src={item.product?.image_url || '/images/product-placeholder.jpg'}
                                alt={item.product_name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                className="rounded me-2"
                              />
                              <div>
                                <small className="d-block">{item.product_name}</small>
                                <small className="text-muted">Qty: {item.quantity}</small>
                              </div>
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <small className="text-muted align-self-center">
                              +{order.items.length - 3} more items
                            </small>
                          )}
                        </div>
                      </Col>
                      <Col md={4} className="text-end">
                        <div>
                          <strong className="text-primary">
                            Total: {formatPrice(order.total)}
                          </strong>
                        </div>
                        <small className="text-muted">
                          Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </small>
                      </Col>
                    </Row>
                    
                    {/* Status Progress */}
                    <Row className="mt-3">
                      <Col>
                        {getStatusProgress(order.order_status)}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => fetchOrders(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {[...Array(pagination.last_page)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <li key={page} className={`page-item ${pagination.current_page === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => fetchOrders(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    
                    <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => fetchOrders(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Orders;