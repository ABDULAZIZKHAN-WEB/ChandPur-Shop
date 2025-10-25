import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Pagination, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories,
  exportProducts,
  importProducts
} from '../../services/admin/adminProductService';
import { toast } from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    cost_price: '',
    sku: '',
    barcode: '',
    quantity: '',
    track_quantity: true,
    weight: '',
    status: 'active',
    featured: false,
    meta_title: '',
    meta_description: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    status: '',
    featured: '',
    page: 1,
    per_page: 10,
  });
  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      const response = await exportProducts();
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products-${new Date().toISOString().slice(0, 10)}.csv`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Products exported successfully');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Failed to export products');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setImportLoading(true);
      const response = await importProducts(importFile);
      
      toast.success(response.data.message || 'Products imported successfully');
      setImportModal(false);
      setImportFile(null);
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error('Error importing products:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to import products';
      toast.error(message);
    } finally {
      setImportLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(filters);
      setProducts(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      // Extract categories array from paginated response
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Helper function to render categories in a hierarchical structure
  const renderCategoryOptions = (categories, parentId = null, level = 0) => {
    return categories
      .filter(category => (parentId ? category.parent_id == parentId : !category.parent_id))
      .map(category => {
        const children = categories.filter(cat => cat.parent_id == category.id);
        return (
          <React.Fragment key={category.id}>
            <option value={category.id}>
              {level > 0 && '↳ '.repeat(level)}
              {category.name}
            </option>
            {children.length > 0 && renderCategoryOptions(categories, category.id, level + 1)}
          </React.Fragment>
        );
      });
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

  const handleShowModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category_id: product.category_id || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price || '',
        compare_price: product.compare_price || '',
        cost_price: product.cost_price || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        quantity: product.quantity || '',
        track_quantity: product.track_quantity ?? true,
        weight: product.weight || '',
        status: product.status || 'active',
        featured: product.featured ?? false,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        image: null,
        imagePreview: product.image_url || null,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category_id: '',
        description: '',
        short_description: '',
        price: '',
        compare_price: '',
        cost_price: '',
        sku: '',
        barcode: '',
        quantity: '',
        track_quantity: true,
        weight: '',
        status: 'active',
        featured: false,
        meta_title: '',
        meta_description: '',
        image: null,
        imagePreview: null,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setErrors({});
    
    // Reset form data completely
    setFormData({
      name: '',
      category_id: '',
      description: '',
      short_description: '',
      price: '',
      compare_price: '',
      cost_price: '',
      sku: '',
      barcode: '',
      quantity: '',
      track_quantity: true,
      weight: '',
      status: 'active',
      featured: false,
      meta_title: '',
      meta_description: '',
      image: null,
      imagePreview: null,
    });
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
      
      toast.success('Image selected successfully');
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast.success('Image removed');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    
    if (formData.quantity === '' || isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
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
      const submitData = new FormData();
      
      // Add all form data to FormData
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && key !== 'imagePreview') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add image if provided
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      
      // Convert numeric and boolean values
      submitData.set('price', parseFloat(formData.price));
      submitData.set('compare_price', formData.compare_price ? parseFloat(formData.compare_price) : '');
      submitData.set('cost_price', formData.cost_price ? parseFloat(formData.cost_price) : '');
      submitData.set('quantity', parseInt(formData.quantity));
      submitData.set('weight', formData.weight ? parseFloat(formData.weight) : '');
      submitData.set('track_quantity', Boolean(formData.track_quantity));
      submitData.set('featured', Boolean(formData.featured));
      
      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, submitData);
        toast.success('Product updated successfully');
      } else {
        // Create new product
        await createProduct(submitData);
        toast.success('Product created successfully');
      }
      
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      const message = error.response?.data?.message || 'Failed to save product';
      toast.error(message);
      
      // Set field-specific errors if provided by backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        const message = error.response?.data?.message || 'Failed to delete product';
        toast.error(message);
      }
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'secondary', text: 'Inactive' },
      draft: { variant: 'warning', text: 'Draft' },
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products Management</h2>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={() => setImportModal(true)}>
            <i className="bi bi-upload me-1"></i> Import
          </Button>
          <Button variant="outline-success" className="me-2" onClick={handleExport}>
            <i className="bi bi-download me-1"></i> Export
          </Button>
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-lg me-1"></i> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name or SKU"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {Array.isArray(categories) && renderCategoryOptions(categories)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Featured</Form.Label>
                <Form.Select
                  value={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="1">Featured</option>
                  <option value="0">Not Featured</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilters({
                  search: '',
                  category_id: '',
                  status: '',
                  featured: '',
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

      {/* Products Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : products.length === 0 ? (
            <Alert variant="info" className="text-center">
              <h5>No products found</h5>
              <p>Try adjusting your filters or add a new product.</p>
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Image</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Featured</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td className="text-center">
                          {product.image ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              className="rounded border"
                            />
                          ) : (
                            <div 
                              className="d-flex align-items-center justify-content-center bg-light rounded border"
                              style={{ width: '50px', height: '50px' }}
                            >
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{product.name}</div>
                            <small className="text-muted">SKU: {product.sku}</small>
                          </div>
                        </td>
                        <td>
                          {product.category?.name || 'N/A'}
                        </td>
                        <td>
                          <div>{formatPrice(product.price)}</div>
                          {product.compare_price && product.compare_price > product.price && (
                            <small className="text-muted text-decoration-line-through">
                              {formatPrice(product.compare_price)}
                            </small>
                          )}
                        </td>
                        <td>
                          {product.track_quantity ? (
                            <span className={product.quantity > 10 ? 'text-success' : product.quantity > 0 ? 'text-warning' : 'text-danger'}>
                              {product.quantity} in stock
                            </span>
                          ) : (
                            <span className="text-muted">Untracked</span>
                          )}
                        </td>
                        <td>
                          {getStatusBadge(product.status)}
                        </td>
                        <td>
                          {product.featured ? (
                            <Badge bg="warning">Featured</Badge>
                          ) : (
                            <span className="text-muted">No</span>
                          )}
                        </td>
                        <td>
                          {formatDate(product.created_at)}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/admin/products/edit/${product.id}`}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
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
                    Showing {pagination.from} to {pagination.to} of {pagination.total} products
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

      {/* Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    placeholder="Enter product name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SKU *</Form.Label>
                      <Form.Control
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        isInvalid={!!errors.sku}
                        placeholder="Enter SKU"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.sku}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Barcode</Form.Label>
                      <Form.Control
                        type="text"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        placeholder="Enter barcode"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        isInvalid={!!errors.category_id}
                      >
                        <option value="">Select category</option>
                        {renderCategoryOptions(categories)}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category_id}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Select a category or subcategory for this product. Subcategories are shown with ↳ symbols.
                      </Form.Text>
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
                        <option value="draft">Draft</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price *</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        isInvalid={!!errors.price}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.price}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Compare Price</Form.Label>
                      <Form.Control
                        type="number"
                        name="compare_price"
                        value={formData.compare_price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cost Price</Form.Label>
                      <Form.Control
                        type="number"
                        name="cost_price"
                        value={formData.cost_price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity *</Form.Label>
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        isInvalid={!!errors.quantity}
                        placeholder="0"
                        min="0"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.quantity}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Weight (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="track_quantity"
                    label="Track Quantity"
                    checked={formData.track_quantity}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="featured"
                    label="Featured Product"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Short Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    placeholder="Brief product description"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed product description"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  
                  {/* Image Preview Section */}
                  {formData.imagePreview && (
                    <div className="mb-3 p-3 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Image Preview:</small>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={handleRemoveImage}
                        >
                          <i className="bi bi-trash"></i> Remove
                        </Button>
                      </div>
                      <div className="text-center">
                        <img 
                          src={formData.imagePreview} 
                          alt="Preview" 
                          className="img-fluid rounded"
                          style={{ maxHeight: '200px', objectFit: 'cover', border: '2px solid #dee2e6' }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* File Input */}
                  <Form.Control
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    isInvalid={!!errors.image}
                    accept="image/*"
                  />
                  <Form.Text className="text-muted">
                    Upload an image for this product (JPG, PNG, GIF, WebP - Max 2MB)
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.image}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Card className="mt-3">
                  <Card.Header>
                    <h6 className="mb-0">Product Preview</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center mb-3">
                      {formData.imagePreview ? (
                        <img 
                          src={formData.imagePreview} 
                          alt="Preview" 
                          className="img-fluid rounded"
                          style={{ maxHeight: '150px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
                          <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                        </div>
                      )}
                    </div>
                    <h6>{formData.name || 'Product Name'}</h6>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 text-primary">
                        {formData.price ? `৳${parseFloat(formData.price).toFixed(2)}` : 'Price'}
                      </span>
                      {formData.compare_price && parseFloat(formData.compare_price) > 0 && (
                        <span className="text-muted text-decoration-line-through">
                          ৳{parseFloat(formData.compare_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">SKU: {formData.sku || 'SKU'}</small>
                    </div>
                    <div className="mt-2">
                      <span className="text-muted">
                        {formData.quantity || 0} in stock
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal show={importModal} onHide={() => setImportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Import Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Upload CSV File</Form.Label>
            <Form.Control
              type="file"
              accept=".csv,.txt"
              onChange={(e) => setImportFile(e.target.files[0])}
            />
            <Form.Text className="text-muted">
              CSV file should contain columns: Name, SKU, Price, Compare Price, Cost Price, Quantity, Category, Status, Featured
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setImportModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleImport}
            disabled={importLoading || !importFile}
          >
            {importLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Importing...
              </>
            ) : (
              'Import Products'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProducts;