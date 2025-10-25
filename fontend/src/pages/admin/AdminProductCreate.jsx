import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert, Tab, Tabs, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createProduct, uploadGallery } from '../../services/admin/adminProductService';
import { getCategories } from '../../services/admin/adminCategoryService';
import { toast } from 'react-hot-toast';

const AdminProductCreate = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
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
  });
  const [errors, setErrors] = useState({});
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [createdProductId, setCreatedProductId] = useState(null);
  
  // Attribute management state
  const [attributes, setAttributes] = useState([]);
  const [attributeForm, setAttributeForm] = useState({
    size: '',
    color: '',
    additional_price: '',
    quantity: '',
  });
  const [attributeErrors, setAttributeErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
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
              {category.image_url && ' (has image)'}
            </option>
            {children.length > 0 && renderCategoryOptions(categories, category.id, level + 1)}
          </React.Fragment>
        );
      });
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
      setSaving(true);
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        quantity: parseInt(formData.quantity),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        track_quantity: Boolean(formData.track_quantity),
        featured: Boolean(formData.featured),
      };
      
      const response = await createProduct(productData);
      const newProductId = response.data.product.id;
      setCreatedProductId(newProductId);
      
      // If there are gallery images to upload, upload them now
      if (galleryFiles.length > 0 && newProductId) {
        await handleGalleryUpload(newProductId);
      }
      
      toast.success('Product created successfully');
      navigate('/admin/products/edit/' + newProductId);
    } catch (error) {
      console.error('Error creating product:', error);
      const message = error.response?.data?.message || 'Failed to create product';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryFileChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(files);
  };

  const handleGalleryUpload = async (productId) => {
    if (galleryFiles.length === 0) return;
    
    try {
      setGalleryUploading(true);
      
      // Create FormData with gallery files
      const formData = new FormData();
      galleryFiles.forEach(file => {
        formData.append('images[]', file);
      });
      
      await uploadGallery(productId, formData);
      toast.success('Gallery images uploaded successfully');
      
      // Clear file input
      setGalleryFiles([]);
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      const message = error.response?.data?.message || 'Failed to upload images';
      toast.error(message);
    } finally {
      setGalleryUploading(false);
    }
  };

  // Attribute management functions
  const handleAttributeInputChange = (e) => {
    const { name, value } = e.target;
    setAttributeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAttributeForm = () => {
    const newErrors = {};
    
    if (!attributeForm.size && !attributeForm.color) {
      newErrors.general = 'Either size or color is required';
    }
    
    if (attributeForm.additional_price && (isNaN(attributeForm.additional_price) || 
        parseFloat(attributeForm.additional_price) < -999999.99 || 
        parseFloat(attributeForm.additional_price) > 999999.99)) {
      newErrors.additional_price = 'Valid additional price is required';
    }
    
    if (attributeForm.quantity === '' || isNaN(attributeForm.quantity) || parseInt(attributeForm.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    
    setAttributeErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    
    if (!validateAttributeForm()) {
      return;
    }
    
    // For new products, we'll store attributes in state until the product is created
    const newAttribute = {
      id: Date.now(), // Temporary ID for new attributes
      ...attributeForm,
      additional_price: attributeForm.additional_price ? parseFloat(attributeForm.additional_price) : 0,
      quantity: parseInt(attributeForm.quantity),
    };
    
    setAttributes(prev => [...prev, newAttribute]);
    toast.success('Attribute added to list. Save the product to apply.');
    
    // Reset form
    setAttributeForm({
      size: '',
      color: '',
      additional_price: '',
      quantity: '',
    });
  };

  const handleDeleteAttribute = (attributeId) => {
    setAttributes(prev => prev.filter(attr => attr.id !== attributeId));
    toast.success('Attribute removed from list');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
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
        <h2>Create Product</h2>
        <div>
          <Button 
            variant="secondary" 
            className="me-2"
            onClick={() => navigate('/admin/products')}
          >
            <i className="bi bi-arrow-left me-1"></i> Back
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              <>
                <i className="bi bi-save me-1"></i> Create Product
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="basic" title="Basic Information">
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={8}>
                    <Row>
                      <Col md={6}>
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
                      </Col>
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
                        rows={6}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Detailed product description"
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                      <Button 
                        variant="secondary" 
                        className="me-2"
                        onClick={() => navigate('/admin/products')}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Creating...
                          </>
                        ) : (
                          'Create Product'
                        )}
                      </Button>
                    </div>
                  </Col>
                  <Col md={4}>
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">Product Preview</h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="text-center mb-3">
                          <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                            <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                          </div>
                        </div>
                        <h5>{formData.name || 'Product Name'}</h5>
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
                        <div className="mt-2">
                          {formData.category_id && (
                            <small className="text-muted">
                              Category: {categories.find(cat => cat.id == formData.category_id)?.name || 'Unknown'}
                            </small>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="gallery" title="Gallery" disabled={!createdProductId}>
          <Card>
            <Card.Body>
              <Alert variant="info">
                <h5>Gallery Management</h5>
                <p>You can upload gallery images after creating the product. Please save the product first to enable gallery management.</p>
                {!createdProductId && (
                  <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating Product...
                      </>
                    ) : (
                      'Save Product to Enable Gallery'
                    )}
                  </Button>
                )}
              </Alert>
              
              {createdProductId && (
                <div>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload Gallery Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryFileChange}
                      disabled={galleryUploading}
                    />
                    <Form.Text className="text-muted">
                      Select multiple images to upload. Max file size: 2MB each.
                    </Form.Text>
                  </Form.Group>
                  
                  {galleryFiles.length > 0 && (
                    <div className="mb-3">
                      <p>Selected {galleryFiles.length} file(s) for upload</p>
                      <Button
                        variant="primary"
                        onClick={() => handleGalleryUpload(createdProductId)}
                        disabled={galleryUploading}
                      >
                        {galleryUploading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Uploading...
                          </>
                        ) : (
                          'Upload Gallery Images'
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {galleryUploading && (
                    <div className="mt-2">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Uploading images...
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="attributes" title="Variants" disabled={!createdProductId}>
          <Card>
            <Card.Body>
              <Alert variant="info">
                <h5>Product Variants</h5>
                <p>You can manage product variants (size, color) after creating the product. Please save the product first to enable variant management.</p>
                {!createdProductId && (
                  <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating Product...
                      </>
                    ) : (
                      'Save Product to Enable Variants'
                    )}
                  </Button>
                )}
              </Alert>
              
              {createdProductId && (
                <div>
                  <h5>Add Product Variants</h5>
                  <p className="text-muted">Manage size and color variants for this product.</p>
                  
                  <Form onSubmit={handleAddAttribute}>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Size</Form.Label>
                          <Form.Control
                            type="text"
                            name="size"
                            value={attributeForm.size}
                            onChange={handleAttributeInputChange}
                            placeholder="e.g., S, M, L"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Color</Form.Label>
                          <Form.Control
                            type="text"
                            name="color"
                            value={attributeForm.color}
                            onChange={handleAttributeInputChange}
                            placeholder="e.g., Red, Blue"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Additional Price</Form.Label>
                          <Form.Control
                            type="number"
                            name="additional_price"
                            value={attributeForm.additional_price}
                            onChange={handleAttributeInputChange}
                            placeholder="0.00"
                            step="0.01"
                            min="-999999.99"
                            max="999999.99"
                          />
                          <Form.Text className="text-muted">
                            Price adjustment (can be negative)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Quantity</Form.Label>
                          <Form.Control
                            type="number"
                            name="quantity"
                            value={attributeForm.quantity}
                            onChange={handleAttributeInputChange}
                            placeholder="0"
                            min="0"
                            isInvalid={!!attributeErrors.quantity}
                          />
                          <Form.Control.Feedback type="invalid">
                            {attributeErrors.quantity}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={1} className="d-flex align-items-end">
                        <div className="mb-3">
                          <Button 
                            variant="primary" 
                            type="submit"
                          >
                            Add
                          </Button>
                        </div>
                      </Col>
                    </Row>
                    
                    {attributeErrors.general && (
                      <Alert variant="danger">{attributeErrors.general}</Alert>
                    )}
                  </Form>
                  
                  {attributes.length > 0 ? (
                    <Table striped bordered hover className="mt-4">
                      <thead>
                        <tr>
                          <th>Size</th>
                          <th>Color</th>
                          <th>Additional Price</th>
                          <th>Quantity</th>
                          <th>Total Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attributes.map(attribute => (
                          <tr key={attribute.id}>
                            <td>{attribute.size || '-'}</td>
                            <td>{attribute.color || '-'}</td>
                            <td>{formatPrice(attribute.additional_price || 0)}</td>
                            <td>{attribute.quantity}</td>
                            <td>{formatPrice((parseFloat(formData.price) + parseFloat(attribute.additional_price || 0)).toFixed(2))}</td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteAttribute(attribute.id)}
                              >
                                <i className="bi bi-trash"></i> Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info" className="mt-4">
                      <h6>No variants added</h6>
                      <p>Add size or color variants to create different options for this product.</p>
                    </Alert>
                  )}
                  
                  <div className="mt-3">
                    <Alert variant="warning">
                      <h6>Note</h6>
                      <p>After saving the product, you'll be redirected to the edit page where you can save these variants to the database.</p>
                    </Alert>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="seo" title="SEO">
          <Card>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Meta Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    placeholder="Enter meta title for SEO"
                    maxLength="255"
                  />
                  <Form.Text className="text-muted">
                    {formData.meta_title.length}/255 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Meta Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    placeholder="Enter meta description for SEO"
                    maxLength="500"
                  />
                  <Form.Text className="text-muted">
                    {formData.meta_description.length}/500 characters
                  </Form.Text>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminProductCreate;