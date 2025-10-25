import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Pagination, Spinner, Alert, Badge } from 'react-bootstrap';
import { 
  getBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner,
  reorderBanners
} from '../../services/admin/adminBannerService';
import { toast } from 'react-hot-toast';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    link: '',
    position: 'home_slider',
    status: 'active',
    sort_order: 0,
  });
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    status: '',
    page: 1,
    per_page: 10,
  });
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, [filters]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getBanners(filters);
      setBanners(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
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

  const handleShowModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        image: null,
        link: banner.link || '',
        position: banner.position || 'home_slider',
        status: banner.status || 'active',
        sort_order: banner.sort_order || 0,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        image: null,
        link: '',
        position: 'home_slider',
        status: 'active',
        sort_order: banners.length,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Banner title is required';
    }
    
    if (!editingBanner && !formData.image) {
      newErrors.image = 'Banner image is required';
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
      const bannerData = new FormData();
      bannerData.append('title', formData.title);
      bannerData.append('link', formData.link);
      bannerData.append('position', formData.position);
      bannerData.append('status', formData.status);
      bannerData.append('sort_order', formData.sort_order);
      
      if (formData.image) {
        bannerData.append('image', formData.image);
      }
      
      if (editingBanner) {
        // Update existing banner
        await updateBanner(editingBanner.id, bannerData);
        toast.success('Banner updated successfully');
      } else {
        // Create new banner
        await createBanner(bannerData);
        toast.success('Banner created successfully');
      }
      
      handleCloseModal();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      const message = error.response?.data?.message || 'Failed to save banner';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id);
        toast.success('Banner deleted successfully');
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        const message = error.response?.data?.message || 'Failed to delete banner';
        toast.error(message);
      }
    }
  };

  // Drag and drop functions for sorting
  const handleDragStart = (e, index) => {
    setDraggedItem(banners[index]);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const draggedIndex = banners.findIndex(banner => banner.id === draggedItem.id);
    
    if (draggedIndex === dropIndex) return;
    
    // Create a new array with the reordered items
    const newBanners = [...banners];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(dropIndex, 0, draggedItem);
    
    // Update sort orders
    const updatedBanners = newBanners.map((banner, index) => ({
      ...banner,
      sort_order: index
    }));
    
    setBanners(updatedBanners);
    
    // Save the new order to the server
    try {
      const reorderData = updatedBanners.map(banner => ({
        id: banner.id,
        sort_order: banner.sort_order
      }));
      
      await reorderBanners({ banners: reorderData });
      toast.success('Banner order updated successfully');
    } catch (error) {
      console.error('Error reordering banners:', error);
      toast.error('Failed to update banner order');
      // Revert to original order on error
      fetchBanners();
    }
    
    setDraggedItem(null);
  };

  const getPositionBadge = (position) => {
    const positionConfig = {
      home_slider: { variant: 'primary', text: 'Home Slider' },
      sidebar: { variant: 'success', text: 'Sidebar' },
      footer: { variant: 'info', text: 'Footer' },
    };

    const config = positionConfig[position] || { variant: 'secondary', text: position };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'secondary', text: 'Inactive' },
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
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
        <h2>Banners Management</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="bi bi-plus-lg me-1"></i> Add Banner
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
                  placeholder="Search by title"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Position</Form.Label>
                <Form.Select
                  value={filters.position}
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                >
                  <option value="">All Positions</option>
                  <option value="home_slider">Home Slider</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="footer">Footer</option>
                </Form.Select>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilters({
                  search: '',
                  position: '',
                  status: '',
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

      {/* Banners Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : banners.length === 0 ? (
            <Alert variant="info" className="text-center">
              <h5>No banners found</h5>
              <p>Try adjusting your filters or add a new banner.</p>
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Banner</th>
                      <th>Title</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Clicks</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner, index) => (
                      <tr 
                        key={banner.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{ cursor: 'move' }}
                      >
                        <td>
                          <i className="bi bi-grip-vertical text-muted me-2"></i>
                          {banner.sort_order}
                        </td>
                        <td>
                          {banner.image_url ? (
                            <img
                              src={banner.image_url}
                              alt={banner.title}
                              style={{ width: '80px', height: '40px', objectFit: 'cover' }}
                              className="rounded"
                            />
                          ) : (
                            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '80px', height: '40px' }}>
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{banner.title}</div>
                          {banner.link && (
                            <small className="text-muted">
                              <a href={banner.link} target="_blank" rel="noopener noreferrer">
                                {banner.link}
                              </a>
                            </small>
                          )}
                        </td>
                        <td>
                          {getPositionBadge(banner.position)}
                        </td>
                        <td>
                          {getStatusBadge(banner.status)}
                        </td>
                        <td>
                          {banner.clicks}
                        </td>
                        <td>
                          {formatDate(banner.created_at)}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(banner)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(banner.id)}
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
                    Showing {pagination.from} to {pagination.to} of {pagination.total} banners
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

      {/* Banner Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingBanner ? 'Edit Banner' : 'Add Banner'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    isInvalid={!!errors.title}
                    placeholder="Enter banner title"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Link</Form.Label>
                  <Form.Control
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Position *</Form.Label>
                      <Form.Select
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                      >
                        <option value="home_slider">Home Slider</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="footer">Footer</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status *</Form.Label>
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

                <Form.Group className="mb-3">
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Image {editingBanner ? '' : '*'}</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    isInvalid={!!errors.image}
                    accept="image/*"
                  />
                  <Form.Text className="text-muted">
                    Recommended size: 1200x400px for home slider, 300x250px for sidebar, 1200x200px for footer
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.image}
                  </Form.Control.Feedback>
                  
                  {(editingBanner && editingBanner.image_url) && (
                    <div className="mt-2">
                      <img
                        src={editingBanner.image_url}
                        alt="Current banner"
                        className="img-fluid rounded"
                      />
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingBanner ? 'Update Banner' : 'Create Banner'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminBanners;