import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Pagination, Spinner, Alert, Badge } from 'react-bootstrap';
import { 
  getCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon,
  getCouponUsage
} from '../../services/admin/adminCouponService';
import { toast } from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order_value: '',
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    per_page: 10,
  });
  const [usageData, setUsageData] = useState({});
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, [filters]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getCoupons(filters);
      setCoupons(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
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

  const handleShowModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code || '',
        type: coupon.type || 'percentage',
        value: coupon.value || '',
        min_order_value: coupon.min_order_value || '',
        max_discount: coupon.max_discount || '',
        usage_limit: coupon.usage_limit || '',
        start_date: coupon.start_date || '',
        end_date: coupon.end_date || '',
        status: coupon.status || 'active',
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        min_order_value: '',
        max_discount: '',
        usage_limit: '',
        start_date: '',
        end_date: '',
        status: 'active',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Coupon type is required';
    }
    
    if (!formData.value || isNaN(formData.value) || parseFloat(formData.value) < 0) {
      newErrors.value = 'Valid value is required';
    }
    
    if (formData.min_order_value && (isNaN(formData.min_order_value) || parseFloat(formData.min_order_value) < 0)) {
      newErrors.min_order_value = 'Valid minimum order value is required';
    }
    
    if (formData.max_discount && (isNaN(formData.max_discount) || parseFloat(formData.max_discount) < 0)) {
      newErrors.max_discount = 'Valid maximum discount is required';
    }
    
    if (formData.usage_limit && (isNaN(formData.usage_limit) || parseInt(formData.usage_limit) < 1)) {
      newErrors.usage_limit = 'Valid usage limit is required';
    }
    
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const couponData = {
        ...formData,
        value: parseFloat(formData.value),
        min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : null,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      };
      
      if (editingCoupon) {
        // Update existing coupon
        await updateCoupon(editingCoupon.id, couponData);
        toast.success('Coupon updated successfully');
      } else {
        // Create new coupon
        await createCoupon(couponData);
        toast.success('Coupon created successfully');
      }
      
      handleCloseModal();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to save coupon';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        const message = error.response?.data?.message || 'Failed to delete coupon';
        toast.error(message);
      }
    }
  };

  const handleViewUsage = async (coupon) => {
    try {
      const response = await getCouponUsage(coupon.id);
      setUsageData(response.data);
      setSelectedCoupon(coupon);
      setShowUsageModal(true);
    } catch (error) {
      console.error('Error fetching coupon usage:', error);
      const message = error.response?.data?.message || 'Failed to load coupon usage data';
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'secondary', text: 'Inactive' },
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      percentage: { variant: 'primary', text: 'Percentage' },
      fixed: { variant: 'info', text: 'Fixed Amount' },
    };

    const config = typeConfig[type] || { variant: 'secondary', text: type };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading && !coupons.length) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Coupons Management</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Coupon
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
                  placeholder="Search by code"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Coupons Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : coupons.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Min Order</th>
                      <th>Max Discount</th>
                      <th>Used/Limit</th>
                      <th>Validity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(coupon => (
                      <tr key={coupon.id}>
                        <td>
                          <strong>{coupon.code}</strong>
                        </td>
                        <td>{getTypeBadge(coupon.type)}</td>
                        <td>
                          {coupon.type === 'percentage' 
                            ? `${coupon.value}%` 
                            : formatPrice(coupon.value)}
                        </td>
                        <td>{coupon.min_order_value ? formatPrice(coupon.min_order_value) : 'N/A'}</td>
                        <td>{coupon.max_discount ? formatPrice(coupon.max_discount) : 'N/A'}</td>
                        <td>
                          {coupon.used_count || 0}
                          {coupon.usage_limit && (
                            <span> / {coupon.usage_limit}</span>
                          )}
                        </td>
                        <td>
                          {formatDate(coupon.start_date)} - {formatDate(coupon.end_date)}
                        </td>
                        <td>{getStatusBadge(coupon.status)}</td>
                        <td>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleViewUsage(coupon)}
                          >
                            <i className="bi bi-bar-chart"></i> Usage
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleShowModal(coupon)}
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(coupon.id)}
                          >
                            <i className="bi bi-trash"></i> Delete
                          </Button>
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
                    Showing {pagination.from} to {pagination.to} of {pagination.total} coupons
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
          ) : (
            <Alert variant="info">
              <h5>No coupons found</h5>
              <p>Get started by creating your first coupon.</p>
              <Button variant="primary" onClick={() => handleShowModal()}>
                <i className="bi bi-plus-lg me-2"></i>
                Add Coupon
              </Button>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Coupon Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coupon Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    isInvalid={!!errors.code}
                    placeholder="Enter coupon code"
                    maxLength="50"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.code}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    isInvalid={!!errors.type}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Value *</Form.Label>
                  <Form.Control
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    isInvalid={!!errors.value}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.value}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.type === 'percentage' 
                      ? 'Percentage discount (e.g., 10 for 10%)' 
                      : 'Fixed amount discount (e.g., 100 for ৳100)'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Order Value</Form.Label>
                  <Form.Control
                    type="number"
                    name="min_order_value"
                    value={formData.min_order_value}
                    onChange={handleInputChange}
                    isInvalid={!!errors.min_order_value}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.min_order_value}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Minimum order amount required to use this coupon
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Discount</Form.Label>
                  <Form.Control
                    type="number"
                    name="max_discount"
                    value={formData.max_discount}
                    onChange={handleInputChange}
                    isInvalid={!!errors.max_discount}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.max_discount}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Maximum discount amount (for percentage coupons)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Usage Limit</Form.Label>
                  <Form.Control
                    type="number"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleInputChange}
                    isInvalid={!!errors.usage_limit}
                    placeholder="Unlimited"
                    min="1"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.usage_limit}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Maximum number of times this coupon can be used
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    isInvalid={!!errors.end_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.end_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Usage Statistics Modal */}
      <Modal show={showUsageModal} onHide={() => setShowUsageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Coupon Usage Statistics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCoupon && (
            <div>
              <h5>{selectedCoupon.code}</h5>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Uses:</span>
                  <strong>{usageData.total_uses || 0}</strong>
                </div>
                {usageData.usage_limit && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Usage Limit:</span>
                    <strong>{usageData.usage_limit}</strong>
                  </div>
                )}
                {usageData.remaining_uses !== undefined && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Remaining Uses:</span>
                    <strong>{usageData.remaining_uses}</strong>
                  </div>
                )}
                <div className="mt-3">
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ 
                        width: usageData.usage_limit 
                          ? `${(usageData.total_uses / usageData.usage_limit) * 100}%` 
                          : '0%' 
                      }}
                      aria-valuenow={usageData.total_uses}
                      aria-valuemin="0"
                      aria-valuemax={usageData.usage_limit || 100}
                    >
                      {usageData.usage_limit 
                        ? `${Math.round((usageData.total_uses / usageData.usage_limit) * 100)}%` 
                        : '0%'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUsageModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminCoupons;