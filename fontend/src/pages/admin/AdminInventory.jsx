import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Pagination, Spinner, Alert, Badge, InputGroup } from 'react-bootstrap';
import { 
  getLowStockProducts, 
  updateProductQuantity,
  getOutOfStockProducts,
  getInventoryReport
} from '../../services/admin/adminInventoryService';
import { toast } from 'react-hot-toast';

const AdminInventory = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [filters, setFilters] = useState({
    low_stock_page: 1,
    out_of_stock_page: 1,
    per_page: 10,
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [lowStockRes, outOfStockRes, reportRes] = await Promise.all([
        getLowStockProducts({ page: filters.low_stock_page, per_page: filters.per_page }),
        getOutOfStockProducts({ page: filters.out_of_stock_page, per_page: filters.per_page }),
        getInventoryReport()
      ]);

      setLowStockProducts({
        data: lowStockRes.data.data,
        pagination: {
          current_page: lowStockRes.data.current_page,
          last_page: lowStockRes.data.last_page,
          total: lowStockRes.data.total,
          from: lowStockRes.data.from,
          to: lowStockRes.data.to,
        }
      });

      setOutOfStockProducts({
        data: outOfStockRes.data.data,
        pagination: {
          current_page: outOfStockRes.data.current_page,
          last_page: outOfStockRes.data.last_page,
          total: outOfStockRes.data.total,
          from: outOfStockRes.data.from,
          to: outOfStockRes.data.to,
        }
      });

      setInventoryReport(reportRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (product) => {
    setSelectedProduct(product);
    setNewQuantity(product.quantity.toString());
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setNewQuantity('');
  };

  const handleUpdateQuantity = async (e) => {
    e.preventDefault();
    
    try {
      await updateProductQuantity(selectedProduct.id, { quantity: parseInt(newQuantity) });
      toast.success('Product quantity updated successfully');
      handleCloseModal();
      fetchInventoryData();
    } catch (error) {
      console.error('Error updating product quantity:', error);
      const message = error.response?.data?.message || 'Failed to update product quantity';
      toast.error(message);
    }
  };

  const handlePageChange = (type, page) => {
    setFilters(prev => ({
      ...prev,
      [`${type}_page`]: page
    }));
    
    // Refetch data for the specific section
    if (type === 'low_stock') {
      fetchLowStockProducts(page);
    } else if (type === 'out_of_stock') {
      fetchOutOfStockProducts(page);
    }
  };

  const fetchLowStockProducts = async (page) => {
    try {
      const response = await getLowStockProducts({ page, per_page: filters.per_page });
      setLowStockProducts({
        data: response.data.data,
        pagination: {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
          from: response.data.from,
          to: response.data.to,
        }
      });
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      toast.error('Failed to load low stock products');
    }
  };

  const fetchOutOfStockProducts = async (page) => {
    try {
      const response = await getOutOfStockProducts({ page, per_page: filters.per_page });
      setOutOfStockProducts({
        data: response.data.data,
        pagination: {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
          from: response.data.from,
          to: response.data.to,
        }
      });
    } catch (error) {
      console.error('Error fetching out of stock products:', error);
      toast.error('Failed to load out of stock products');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        <h2>Inventory Management</h2>
      </div>

      {/* Inventory Summary */}
      {inventoryReport && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Products</h6>
                    <h4 className="mb-0">{inventoryReport.total_products}</h4>
                  </div>
                  <div className="text-primary">
                    <i className="bi bi-box-seam fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Low Stock</h6>
                    <h4 className="mb-0 text-warning">{inventoryReport.low_stock_count}</h4>
                  </div>
                  <div className="text-warning">
                    <i className="bi bi-exclamation-triangle fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Out of Stock</h6>
                    <h4 className="mb-0 text-danger">{inventoryReport.out_of_stock_count}</h4>
                  </div>
                  <div className="text-danger">
                    <i className="bi bi-x-circle fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Tracked Items</h6>
                    <h4 className="mb-0 text-info">{inventoryReport.tracked_products}</h4>
                  </div>
                  <div className="text-info">
                    <i className="bi bi-check-circle fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        {/* Low Stock Products */}
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Low Stock Products</h5>
              <Badge bg="warning" text="dark">
                {lowStockProducts.pagination?.total || 0} items
              </Badge>
            </Card.Header>
            <Card.Body>
              {lowStockProducts.data?.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Current Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.data.map(product => (
                          <tr key={product.id}>
                            <td>
                              <div>{product.name}</div>
                              <small className="text-muted">{product.category?.name}</small>
                            </td>
                            <td>{product.sku}</td>
                            <td>
                              <Badge bg={product.quantity <= 0 ? 'danger' : product.quantity <= 5 ? 'warning' : 'info'}>
                                {product.quantity}
                              </Badge>
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleShowModal(product)}
                              >
                                <i className="bi bi-pencil"></i> Update
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {lowStockProducts.pagination?.last_page > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        Showing {lowStockProducts.pagination.from} to {lowStockProducts.pagination.to} of {lowStockProducts.pagination.total} products
                      </div>
                      <Pagination className="mb-0">
                        <Pagination.Prev
                          disabled={lowStockProducts.pagination.current_page === 1}
                          onClick={() => handlePageChange('low_stock', lowStockProducts.pagination.current_page - 1)}
                        />
                        
                        {[...Array(lowStockProducts.pagination.last_page)].map((_, index) => {
                          const page = index + 1;
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === lowStockProducts.pagination.current_page}
                              onClick={() => handlePageChange('low_stock', page)}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        })}
                        
                        <Pagination.Next
                          disabled={lowStockProducts.pagination.current_page === lowStockProducts.pagination.last_page}
                          onClick={() => handlePageChange('low_stock', lowStockProducts.pagination.current_page + 1)}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <Alert variant="info" className="text-center mb-0">
                  <h6>No low stock products</h6>
                  <p>All products have sufficient inventory levels.</p>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Out of Stock Products */}
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Out of Stock Products</h5>
              <Badge bg="danger">
                {outOfStockProducts.pagination?.total || 0} items
              </Badge>
            </Card.Header>
            <Card.Body>
              {outOfStockProducts.data?.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Category</th>
                          <th>Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {outOfStockProducts.data.map(product => (
                          <tr key={product.id}>
                            <td>
                              <div>{product.name}</div>
                            </td>
                            <td>{product.sku}</td>
                            <td>{product.category?.name || 'N/A'}</td>
                            <td>{formatDate(product.updated_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {outOfStockProducts.pagination?.last_page > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        Showing {outOfStockProducts.pagination.from} to {outOfStockProducts.pagination.to} of {outOfStockProducts.pagination.total} products
                      </div>
                      <Pagination className="mb-0">
                        <Pagination.Prev
                          disabled={outOfStockProducts.pagination.current_page === 1}
                          onClick={() => handlePageChange('out_of_stock', outOfStockProducts.pagination.current_page - 1)}
                        />
                        
                        {[...Array(outOfStockProducts.pagination.last_page)].map((_, index) => {
                          const page = index + 1;
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === outOfStockProducts.pagination.current_page}
                              onClick={() => handlePageChange('out_of_stock', page)}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        })}
                        
                        <Pagination.Next
                          disabled={outOfStockProducts.pagination.current_page === outOfStockProducts.pagination.last_page}
                          onClick={() => handlePageChange('out_of_stock', outOfStockProducts.pagination.current_page + 1)}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <Alert variant="info" className="text-center mb-0">
                  <h6>No out of stock products</h6>
                  <p>All products are currently in stock.</p>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Update Quantity Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Product Quantity</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateQuantity}>
          <Modal.Body>
            {selectedProduct && (
              <div className="mb-3">
                <h6>{selectedProduct.name}</h6>
                <p className="text-muted mb-3">SKU: {selectedProduct.sku}</p>
                
                <Form.Group>
                  <Form.Label>Current Quantity: <strong>{selectedProduct.quantity}</strong></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      min="0"
                      required
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setNewQuantity(parseInt(newQuantity) + 10)}
                    >
                      +10
                    </Button>
                  </InputGroup>
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Quantity
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminInventory;