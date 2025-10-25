import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, Badge, Modal, Form, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getOrder, 
  updateOrderStatus, 
  addOrderNote 
} from '../../services/admin/adminOrderService';
import { toast } from 'react-hot-toast';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrder(id);
      setOrder(response.data);
      setNewStatus(response.data.order_status);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await updateOrderStatus(id, { order_status: newStatus });
      toast.success('Order status updated successfully');
      setStatusModal(false);
      fetchOrder();
    } catch (error) {
      console.error('Error updating order status:', error);
      const message = error.response?.data?.message || 'Failed to update order status';
      toast.error(message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    
    try {
      await addOrderNote(id, { note: newNote });
      toast.success('Note added successfully');
      setNoteModal(false);
      setNewNote('');
      fetchOrder();
    } catch (error) {
      console.error('Error adding note:', error);
      const message = error.response?.data?.message || 'Failed to add note';
      toast.error(message);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderStatusBadge = (status) => {
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

  const getStatusHistory = () => {
    if (!order || !order.status_history) return [];
    
    // Sort by timestamp, newest first
    return [...order.status_history].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!order) {
    return (
      <Alert variant="danger">
        <h5>Order not found</h5>
        <p>The order you're looking for doesn't exist or has been deleted.</p>
        <Button variant="primary" onClick={() => navigate('/admin/orders')}>
          Back to Orders
        </Button>
      </Alert>
    );
  }

  const statusHistory = getStatusHistory();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details</h2>
        <div>
          <Button 
            variant="secondary" 
            className="me-2"
            onClick={() => navigate('/admin/orders')}
          >
            <i className="bi bi-arrow-left me-1"></i> Back
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setStatusModal(true)}
          >
            <i className="bi bi-pencil me-1"></i> Update Status
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* Order Items */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div>{item.product_name}</div>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatPrice(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                      <td><strong>{formatPrice(order.subtotal)}</strong></td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Tax:</strong></td>
                      <td><strong>{formatPrice(order.tax)}</strong></td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Shipping:</strong></td>
                      <td><strong>{formatPrice(order.shipping_cost)}</strong></td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                      <td><strong className="text-primary">{formatPrice(order.total)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card.Body>
          </Card>

          {/* Status History */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Status History</h5>
            </Card.Header>
            <Card.Body>
              {statusHistory.length > 0 ? (
                <ListGroup>
                  {statusHistory.map((entry, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                      <div>
                        {entry.type === 'note' ? (
                          <>
                            <div className="fw-bold text-info">
                              <i className="bi bi-sticky me-2"></i>
                              Note Added
                            </div>
                            <div className="mt-1">{entry.note}</div>
                          </>
                        ) : (
                          <>
                            <div className="fw-bold">
                              Status Updated: {getOrderStatusBadge(entry.status)}
                            </div>
                          </>
                        )}
                        <div className="text-muted small mt-1">
                          {formatDate(entry.timestamp)}
                          {entry.user_id && ` by User #${entry.user_id}`}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No status history available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Order Summary */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Order #:</span>
                <strong>{order.order_number}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Date:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Status:</span>
                <span>{getOrderStatusBadge(order.order_status)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Payment Status:</span>
                <span>{getPaymentStatusBadge(order.payment_status)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Payment Method:</span>
                <span className="text-capitalize">{order.payment_method}</span>
              </div>
              {order.transaction_id && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Transaction ID:</span>
                  <span>{order.transaction_id}</span>
                </div>
              )}
              
              <Button 
                variant="outline-primary" 
                className="w-100 mt-3"
                onClick={() => setStatusModal(true)}
              >
                <i className="bi bi-pencil me-1"></i> Update Status
              </Button>
              
              <Button 
                variant="outline-info" 
                className="w-100 mt-2"
                onClick={() => setNoteModal(true)}
              >
                <i className="bi bi-sticky me-1"></i> Add Note
              </Button>
            </Card.Body>
          </Card>

          {/* Customer Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Customer Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>{order.user?.name || 'N/A'}</strong>
              </div>
              <div className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                {order.user?.email || 'N/A'}
              </div>
              {order.user?.phone && (
                <div className="mb-2">
                  <i className="bi bi-telephone me-2"></i>
                  {order.user.phone}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Shipping Address */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Shipping Address</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>{order.shipping_address?.name || 'N/A'}</strong>
              </div>
              <div className="mb-2">
                {order.shipping_address?.address || 'N/A'}
              </div>
              <div className="mb-2">
                {order.shipping_address?.city || 'N/A'}
                {order.shipping_address?.postal_code && `, ${order.shipping_address.postal_code}`}
              </div>
              <div className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                {order.shipping_address?.phone || 'N/A'}
              </div>
            </Card.Body>
          </Card>

          {/* Billing Address */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Billing Address</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>{order.billing_address?.name || 'N/A'}</strong>
              </div>
              <div className="mb-2">
                {order.billing_address?.address || 'N/A'}
              </div>
              <div className="mb-2">
                {order.billing_address?.city || 'N/A'}
                {order.billing_address?.postal_code && `, ${order.billing_address.postal_code}`}
              </div>
              <div className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                {order.billing_address?.phone || 'N/A'}
              </div>
            </Card.Body>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Order Notes</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{order.notes}</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Status Update Modal */}
      <Modal show={statusModal} onHide={() => setStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStatusUpdate}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Current Status: {getOrderStatusBadge(order.order_status)}</Form.Label>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setStatusModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Status
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Note Modal */}
      <Modal show={noteModal} onHide={() => setNoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Note to Order</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddNote}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note here..."
                maxLength={1000}
              />
              <Form.Text>{newNote.length}/1000 characters</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setNoteModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!newNote.trim()}>
              Add Note
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminOrderDetails;