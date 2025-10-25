import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Spinner, Alert, Badge, InputGroup, FormControl } from 'react-bootstrap';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../services/admin/adminCategoryService';
import { toast } from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    parent_id: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Pass pagination and search parameters
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm
      };
      
      const response = await getCategories(params);
      
      // Handle both paginated and non-paginated responses
      if (response.data.data) {
        setCategories(response.data.data);
        setTotalPages(response.data.last_page || 1);
        setPerPage(response.data.per_page || 10);
      } else {
        setCategories(response.data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Helper function to get all descendant category IDs
  const getDescendantIds = (categoryId) => {
    const descendants = [];
    const findDescendants = (id) => {
      const children = categories.filter(cat => cat.parent_id == id);
      children.forEach(child => {
        descendants.push(child.id);
        findDescendants(child.id);
      });
    };
    findDescendants(categoryId);
    return descendants;
  };

  // Function to handle creating a subcategory
  const handleCreateSubcategory = (parentCategory) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
      parent_id: parentCategory.id.toString(),
      image: null,
      imagePreview: null,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleShowModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'active',
        parent_id: category.parent_id || '',
        image: null,
        imagePreview: category.image_url || null,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        status: 'active',
        parent_id: '',
        image: null,
        imagePreview: null,
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
      parent_id: '',
      image: null,
      imagePreview: null,
    });
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      newErrors.name = 'Category name is required';
    }
    
    if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }
    
    // Prevent circular references when editing
    if (editingCategory && formData.parent_id) {
      const parentId = parseInt(formData.parent_id);
      if (parentId === editingCategory.id) {
        newErrors.parent_id = 'A category cannot be its own parent';
      }
      
      // Check if selected parent is a descendant of this category
      const descendantIds = getDescendantIds(editingCategory.id);
      if (descendantIds.includes(parentId)) {
        newErrors.parent_id = 'Cannot set a child category as parent (circular reference)';
      }
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
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('status', formData.status);
      submitData.append('parent_id', formData.parent_id || '');
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      
      if (editingCategory) {
        // Update existing category
        const response = await updateCategory(editingCategory.id, submitData);
        toast.success(response.data.message || 'Category updated successfully');
      } else {
        // Create new category
        const response = await createCategory(submitData);
        toast.success(response.data.message || 'Category created successfully');
      }
      
      handleCloseModal();
      fetchCategories(); // Refresh the category list
    } catch (error) {
      console.error('Error saving category:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to save category';
      toast.error(message);
      
      // Set field-specific errors if provided by backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setDeletingId(id);
      const response = await deleteCategory(id);
      toast.success(response.data.message || 'Category deleted successfully');
      fetchCategories(); // Refresh the category list
    } catch (error) {
      console.error('Error deleting category:', error);
      const message = error.response?.data?.message || 'Failed to delete category';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'secondary', text: 'Inactive' },
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const renderCategoryTree = (categories, parentId = null, level = 0) => {
    return categories
      .filter(category => (parentId ? category.parent_id == parentId : !category.parent_id))
      .map(category => {
        const children = categories.filter(cat => cat.parent_id == category.id);
        return (
          <React.Fragment key={category.id}>
            <tr>
              <td className="text-center">
                {category.image_url ? (
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
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
                <div style={{ paddingLeft: `${level * 20}px` }} className="d-flex align-items-center">
                  {level > 0 && <span className="me-2">↳</span>}
                  <div className="fw-medium">{category.name}</div>
                </div>
              </td>
              <td>
                {category.description ? (
                  <div className="text-muted">{category.description}</div>
                ) : (
                  <span className="text-muted">No description</span>
                )}
              </td>
              <td>
                {category.parent?.name || 'None'}
              </td>
              <td>
                {category.products_count || 0} products
              </td>
              <td>
                {getStatusBadge(category.status)}
              </td>
              <td>
                <div className="d-flex gap-1">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleCreateSubcategory(category)}
                    title="Add Subcategory"
                  >
                    <i className="bi bi-node-plus"></i>
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(category)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deletingId === category.id}
                  >
                    {deletingId === category.id ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <i className="bi bi-trash"></i>
                    )}
                  </Button>
                </div>
              </td>
            </tr>
            {children.length > 0 && renderCategoryTree(categories, category.id, level + 1)}
          </React.Fragment>
        );
      });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get available parent categories, excluding current category and its descendants when editing
  const getParentCategoryOptions = () => {
    if (!editingCategory) {
      return categories;
    }
    
    // Exclude current category and its descendants to prevent circular references
    const descendantIds = getDescendantIds(editingCategory.id);
    return categories.filter(cat => 
      cat.id !== editingCategory.id && !descendantIds.includes(cat.id)
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Categories Management</h2>
          <p className="text-muted mb-0">Manage product categories and subcategories</p>
        </div>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="bi bi-plus-lg me-2"></i>Add Category
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <FormControl
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {filteredCategories.length === 0 ? (
            <Alert variant="info" className="text-center">
              <h5>No categories found</h5>
              <p>{searchTerm ? 'Try a different search term.' : 'Get started by creating your first category.'}</p>
              <Button variant="primary" onClick={() => handleShowModal()}>
                <i className="bi bi-plus-lg me-2"></i>Create Category
              </Button>
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Image</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Parent Category</th>
                      <th>Products</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderCategoryTree(filteredCategories)}
                  </tbody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, categories.length)} of {categories.length} entries
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="me-1"
                    >
                      Previous
                    </Button>
                    <span className="mx-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ms-1"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Category Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? 'Edit Category' : formData.parent_id ? 'Create Subcategory' : 'Create Category'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    placeholder="Enter category name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    isInvalid={!!errors.description}
                    placeholder="Enter category description"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Parent Category</Form.Label>
                  <Form.Select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                    isInvalid={!!errors.parent_id}
                  >
                    <option value="">None (Top-level category)</option>
                    {getParentCategoryOptions().map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.parent_id}
                  </Form.Control.Feedback>
                  {editingCategory && (
                    <Form.Text className="text-muted">
                      Note: You cannot set this category or its subcategories as parent to prevent circular references.
                    </Form.Text>
                  )}
                  {formData.parent_id && (
                    <Form.Text className="text-muted">
                      This category will be created as a subcategory of the selected parent.
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    isInvalid={!!errors.status}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.status}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category Image</Form.Label>
                  
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
                          style={{ maxHeight: '150px', objectFit: 'cover', border: '2px solid #dee2e6' }}
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
                    Upload an image for this category (JPG, PNG, GIF, WebP - Max 2MB)
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.image}
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
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories;