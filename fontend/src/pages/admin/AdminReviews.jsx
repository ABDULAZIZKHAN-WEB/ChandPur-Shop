import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Pagination, Spinner, Alert, Badge } from 'react-bootstrap';
import { 
  getReviews, 
  approveReview, 
  rejectReview, 
  deleteReview 
} from '../../services/admin/adminReviewService';
import { toast } from 'react-hot-toast';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    rating: '',
    page: 1,
    per_page: 10,
  });

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getReviews(filters);
      setReviews(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
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

  const handleShowModal = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReview(null);
  };

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      toast.success('Review approved successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      const message = error.response?.data?.message || 'Failed to approve review';
      toast.error(message);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectReview(id);
      toast.success('Review rejected successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      const message = error.response?.data?.message || 'Failed to reject review';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await deleteReview(id);
        toast.success('Review deleted successfully');
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        const message = error.response?.data?.message || 'Failed to delete review';
        toast.error(message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      approved: { variant: 'success', text: 'Approved' },
      rejected: { variant: 'danger', text: 'Rejected' },
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const renderStars = (rating) => {
    return (
      <>
        {[...Array(5)].map((_, i) => (
          <i 
            key={i} 
            className={`bi ${i < rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
          ></i>
        ))}
      </>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reviews Management</h2>
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
                  placeholder="Search by product or user"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  rating: '',
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

      {/* Reviews Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : reviews.length === 0 ? (
            <Alert variant="info" className="text-center">
              <h5>No reviews found</h5>
              <p>Try adjusting your filters or check back later.</p>
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>User</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(review => (
                      <tr key={review.id}>
                        <td>
                          <div>{review.product?.name || 'N/A'}</div>
                        </td>
                        <td>
                          <div>{review.user?.name || 'Anonymous'}</div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {renderStars(review.rating)}
                            <span className="ms-1">{review.rating}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '200px' }} className="text-truncate">
                            {review.comment || 'No comment'}
                          </div>
                        </td>
                        <td>
                          {formatDate(review.created_at)}
                        </td>
                        <td>
                          {getStatusBadge(review.status)}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(review)}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                            {review.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleApprove(review.id)}
                                >
                                  <i className="bi bi-check"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleReject(review.id)}
                                >
                                  <i className="bi bi-x"></i>
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(review.id)}
                            >
                              <i className="bi bi-trash"></i>
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
                    Showing {pagination.from} to {pagination.to} of {pagination.total} reviews
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

      {/* Review Detail Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Review Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReview && (
            <Row>
              <Col md={8}>
                <div className="mb-3">
                  <h5>{selectedReview.product?.name || 'N/A'}</h5>
                  <div className="d-flex align-items-center mb-2">
                    {renderStars(selectedReview.rating)}
                    <span className="ms-2">{selectedReview.rating} out of 5 stars</span>
                  </div>
                  <p className="mb-2">{selectedReview.comment || 'No comment provided'}</p>
                  <small className="text-muted">
                    Reviewed by {selectedReview.user?.name || 'Anonymous'} on {formatDate(selectedReview.created_at)}
                  </small>
                </div>
              </Col>
              <Col md={4}>
                <Card>
                  <Card.Body>
                    <div className="text-center mb-3">
                      {selectedReview.product?.image_url ? (
                        <img
                          src={selectedReview.product.image_url}
                          alt={selectedReview.product.name}
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          className="rounded"
                        />
                      ) : (
                        <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                          <i className="bi bi-image text-muted"></i>
                        </div>
                      )}
                    </div>
                    <div className="mb-2">
                      <strong>Status:</strong> {getStatusBadge(selectedReview.status)}
                    </div>
                    <div className="mb-2">
                      <strong>Product:</strong> {selectedReview.product?.name || 'N/A'}
                    </div>
                    <div>
                      <strong>User:</strong> {selectedReview.user?.name || 'Anonymous'}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          {selectedReview && selectedReview.status === 'pending' && (
            <>
              <Button variant="success" onClick={() => {
                handleApprove(selectedReview.id);
                handleCloseModal();
              }}>
                Approve
              </Button>
              <Button variant="danger" onClick={() => {
                handleReject(selectedReview.id);
                handleCloseModal();
              }}>
                Reject
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminReviews;