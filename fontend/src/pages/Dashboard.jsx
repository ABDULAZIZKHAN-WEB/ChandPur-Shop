import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrders } from '../services/orderService';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await getOrders({ per_page: 5 });
      setRecentOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Welcome back, {user?.name}!</h2>
              <p className="text-muted mb-0">Manage your account and track your orders</p>
            </div>
            {user?.is_admin && (
              <Button as={Link} to="/admin" variant="primary">
                <i className="bi bi-gear me-2"></i>
                Admin Panel
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <Row>
        {/* Quick Actions */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/shop" variant="primary">
                  <i className="bi bi-shop me-2"></i>
                  Continue Shopping
                </Button>
                <Button as={Link} to="/orders" variant="outline-primary">
                  <i className="bi bi-bag me-2"></i>
                  View All Orders
                </Button>
                <Button as={Link} to="/wishlist" variant="outline-primary">
                  <i className="bi bi-heart me-2"></i>
                  My Wishlist
                </Button>
                <Button as={Link} to="/profile" variant="outline-primary">
                  <i className="bi bi-person me-2"></i>
                  Edit Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Account Info */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Account Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Name:</strong>
                <p className="mb-0">{user?.name}</p>
              </div>
              <div className="mb-3">
                <strong>Email:</strong>
                <p className="mb-0">{user?.email}</p>
              </div>
              {user?.phone && (
                <div className="mb-3">
                  <strong>Phone:</strong>
                  <p className="mb-0">{user.phone}</p>
                </div>
              )}
              <div className="mb-0">
                <strong>Member since:</strong>
                <p className="mb-0">{formatDate(user?.created_at)}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/orders" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : recentOrders.length > 0 ? (
                <div>
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border-bottom pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Link 
                            to={`/orders/${order.id}`}
                            className="text-decoration-none fw-medium"
                          >
                            #{order.order_number}
                          </Link>
                          <div className="small text-muted">
                            {formatDate(order.created_at)}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-medium">
                            {formatPrice(order.total)}
                          </div>
                          <div>
                            {getStatusBadge(order.order_status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-bag display-6 text-muted"></i>
                  <p className="text-muted mt-2 mb-0">No orders yet</p>
                  <Button as={Link} to="/shop" variant="primary" size="sm" className="mt-2">
                    Start Shopping
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;