import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Pagination, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  getOrders, 
  updateOrderStatus, 
  addOrderNote,
  exportOrders
} from '../../services/admin/adminOrderService';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    order_status: '',
    payment_status: '',
    page: 1,
    per_page: 10,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders(filters);
      setOrders(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleShowStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.order_status);
    setShowStatusModal(true);
  };

  const handleShowNoteModal = (order) => {
    setSelectedOrder(order);
    setNewNote('');
    setShowNoteModal(true);
  };

  const handleCloseModals = () => {
    setShowStatusModal(false);
    setShowNoteModal(false);
    setSelectedOrder(null);
    setNewStatus('');
    setNewNote('');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await updateOrderStatus(selectedOrder.id, { order_status: newStatus });
      toast.success('Order status updated successfully');
      handleCloseModals();
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error response:', error.response);
      
      // Provide more detailed error information
      let message = 'Failed to update order status';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 500) {
        message = 'Server error occurred while updating order status';
      } else if (error.response?.status === 422) {
        message = 'Invalid data provided';
      }
      
      toast.error(message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    
    try {
      await addOrderNote(selectedOrder.id, { note: newNote });
      toast.success('Note added successfully');
      handleCloseModals();
      fetchOrders();
    } catch (error) {
      console.error('Error adding note:', error);
      const message = error.response?.data?.message || 'Failed to add note';
      toast.error(message);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportOrders();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Orders Management</h2>
        <Button variant="outline-success" onClick={handleExport}>
          <i className="bi bi-download me-1"></i> Export Orders
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by order number or customer"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Order Status</Form.Label>
                <Form.Select
                  value={filters.order_status}
                  onChange={(e) => handleFilterChange('order_status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  value={filters.payment_status}
                  onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilters({
                  search: '',
                  order_status: '',
                  payment_status: '',
                  page: 1,
                  per_page: 10,
                })}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : orders.length === 0 ? (
            <Alert variant="info" className="text-center">
              <h5>No orders found</h5>
              <p>Try adjusting your filters or check back later.</p>
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Order Status</th>
                      <th>Payment Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <Link to={`/admin/orders/${order.id}`} className="text-decoration-none">
                            {order.order_number}
                          </Link>
                        </td>
                        <td>
                          <div>{order.user?.name || 'N/A'}</div>
                          <small className="text-muted">{order.user?.email || ''}</small>
                        </td>
                        <td>
                          {formatDate(order.created_at)}
                        </td>
                        <td>
                          {formatPrice(order.total)}
                        </td>
                        <td>
                          {getOrderStatusBadge(order.order_status)}
                        </td>
                        <td>
                          {getPaymentStatusBadge(order.payment_status)}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/admin/orders/${order.id}`}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleShowStatusModal(order)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleShowNoteModal(order)}
                            >
                              <i className="bi bi-sticky"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {pagination.from} to {pagination.to} of {pagination.total} orders
                  </div>
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={pagination.current_page === 1}
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                    />
                    
                    {[...Array(pagination.last_page)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === pagination.current_page}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next
                      disabled={pagination.current_page === pagination.last_page}
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStatusUpdate}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Order #{selectedOrder?.order_number}</Form.Label>
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
            <Button variant="secondary" onClick={handleCloseModals}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Status
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Note Modal */}
      <Modal show={showNoteModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>Add Note to Order #{selectedOrder?.order_number}</Modal.Title>
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
            <Button variant="secondary" onClick={handleCloseModals}>
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

export default AdminOrders;