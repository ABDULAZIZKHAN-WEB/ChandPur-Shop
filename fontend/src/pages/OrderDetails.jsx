import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../services/orderService';
import { toast } from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
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
      hour: '2-digit',
      minute: '2-digit',
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

  // Function to handle printing
  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Invoice - ${order.order_number}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .invoice-section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Function to get status timeline
  const getStatusTimeline = () => {
    const statusOrder = [
      { status: 'pending', label: 'Order Placed', description: 'We have received your order' },
      { status: 'processing', label: 'Processing', description: 'We are preparing your order' },
      { status: 'shipped', label: 'Shipped', description: 'Your order has been shipped' },
      { status: 'delivered', label: 'Delivered', description: 'Order delivered successfully' }
    ];
    
    const currentStatusIndex = statusOrder.findIndex(item => item.status === order.order_status);
    
    return (
      <div className="mt-3">
        <h6 className="mb-3">Order Progress</h6>
        <div className="position-relative">
          {/* Timeline line */}
          <div className="position-absolute start-0 top-50 translate-middle-y w-100" style={{ height: '2px', backgroundColor: '#dee2e6', zIndex: 1 }}></div>
          
          <div className="d-flex justify-content-between position-relative" style={{ zIndex: 2 }}>
            {statusOrder.map((item, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = item.status === order.order_status;
              
              return (
                <div key={item.status} className="text-center" style={{ flex: 1 }}>
                  <div 
                    className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${isCompleted ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                    style={{ width: '40px', height: '40px' }}
                  >
                    {isCompleted ? (
                      <i className="bi bi-check"></i>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className={`fw-medium small ${isCurrent ? 'text-primary' : isCompleted ? 'text-muted' : 'text-muted'}`}>
                    {item.label}
                  </div>
                  <div className="small text-muted">{item.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Function to get status history
  const getStatusHistory = () => {
    if (!order || !order.status_history) return [];
    
    // Sort by timestamp, newest first
    return [...order.status_history].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h5>Order not found</h5>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button as={Link} to="/orders" variant="primary">
            Back to Orders
          </Button>
        </Alert>
      </Container>
    );
  }

  const statusHistory = getStatusHistory();

  return (
    <Container className="py-4">
      {/* Hidden print content */}
      <div ref={printRef} style={{ display: 'none' }}>
        <div className="invoice-header">
          <div className="invoice-title">INVOICE</div>
          <div>ChandPur-Shop</div>
          <div>Order #{order.order_number}</div>
          <div>Date: {formatDate(order.created_at)}</div>
        </div>
        
        <div className="invoice-details">
          <div>
            <div className="section-title">Billing Address</div>
            <div>{order.billing_address?.name}</div>
            <div>{order.billing_address?.address}</div>
            <div>{order.billing_address?.city}, {order.billing_address?.postal_code}</div>
            <div>Phone: {order.billing_address?.phone}</div>
          </div>
          <div>
            <div className="section-title">Shipping Address</div>
            <div>{order.shipping_address?.name}</div>
            <div>{order.shipping_address?.address}</div>
            <div>{order.shipping_address?.city}, {order.shipping_address?.postal_code}</div>
            <div>Phone: {order.shipping_address?.phone}</div>
          </div>
        </div>
        
        <div className="invoice-section">
          <div className="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.product_name}
                    {item.attribute && (
                      <div>
                        <small>
                          Size: {item.attribute.size}, Color: {item.attribute.color}
                        </small>
                      </div>
                    )}
                  </td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="invoice-section">
          <table style={{ width: '50%', marginLeft: 'auto' }}>
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td className="text-right">{formatPrice(order.subtotal)}</td>
              </tr>
              {order.discount > 0 && (
                <tr>
                  <td>Discount:</td>
                  <td className="text-right">-{formatPrice(order.discount)}</td>
                </tr>
              )}
              <tr>
                <td>Tax:</td>
                <td className="text-right">{formatPrice(order.tax)}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td className="text-right">{formatPrice(order.shipping_cost)}</td>
              </tr>
              <tr className="total-row">
                <td>Total:</td>
                <td className="text-right">{formatPrice(order.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="invoice-section">
          <div className="section-title">Payment Information</div>
          <div>Payment Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
          <div>Payment Status: {order.payment_status}</div>
          {order.transaction_id && <div>Transaction ID: {order.transaction_id}</div>}
        </div>
        
        <div className="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/orders" className="text-decoration-none">Orders</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Order #{order.order_number}
          </li>
        </ol>
      </nav>

      {/* Order Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Order #{order.order_number}</h2>
              <p className="text-muted mb-0">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-end">
              <div className="mb-2">
                {getStatusBadge(order.order_status)}
              </div>
              <div>
                {getPaymentStatusBadge(order.payment_status)}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Order Items */}
        <Col lg={8}>
          {/* Status Timeline */}
          <Card className="mb-4">
            <Card.Body>
              {getStatusTimeline()}
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product?.image_url || '/images/product-placeholder.jpg'}
                            alt={item.product_name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            className="rounded me-3"
                          />
                          <div>
                            <h6 className="mb-1">{item.product_name}</h6>
                            {item.attribute && (
                              <small className="text-muted">
                                Size: {item.attribute.size}, Color: {item.attribute.color}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        {formatPrice(item.price)}
                      </td>
                      <td className="align-middle">
                        {item.quantity}
                      </td>
                      <td className="align-middle">
                        <strong>{formatPrice(item.total)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Status History */}
          {statusHistory.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Status History</h5>
              </Card.Header>
              <Card.Body>
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
                              Status Updated: {getStatusBadge(entry.status)}
                            </div>
                          </>
                        )}
                        <div className="text-muted small mt-1">
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {/* Order Notes */}
          {order.notes && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Notes</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{order.notes}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Order Summary & Details */}
        <Col lg={4}>
          {/* Order Summary */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="text-primary">{formatPrice(order.total)}</strong>
              </div>
            </Card.Body>
          </Card>

          {/* Payment Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Payment Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Payment Method:</strong>
                <p className="mb-0">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
              </div>
              <div className="mb-2">
                <strong>Payment Status:</strong>
                <p className="mb-0">
                  {getPaymentStatusBadge(order.payment_status)}
                </p>
              </div>
              {order.transaction_id && (
                <div>
                  <strong>Transaction ID:</strong>
                  <p className="mb-0 font-monospace">{order.transaction_id}</p>
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
              {order.shipping_address && (
                <address className="mb-0">
                  <strong>{order.shipping_address.name}</strong><br />
                  {order.shipping_address.address}<br />
                  {order.shipping_address.city}, {order.shipping_address.postal_code}<br />
                  <abbr title="Phone">P:</abbr> {order.shipping_address.phone}
                </address>
              )}
            </Card.Body>
          </Card>

          {/* Billing Address */}
          {order.billing_address && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Billing Address</h5>
              </Card.Header>
              <Card.Body>
                <address className="mb-0">
                  <strong>{order.billing_address.name}</strong><br />
                  {order.billing_address.address}<br />
                  {order.billing_address.city}, {order.billing_address.postal_code}<br />
                  <abbr title="Phone">P:</abbr> {order.billing_address.phone}
                </address>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Actions */}
      <Row className="mt-4">
        <Col>
          <div className="d-flex gap-2">
            <Button as={Link} to="/orders" variant="outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Orders
            </Button>
            <Button variant="outline-secondary" onClick={handlePrint}>
              <i className="bi bi-printer me-2"></i>
              Print Order
            </Button>
            {order.order_status === 'delivered' && (
              <Button as={Link} to={`/orders/${order.id}/review`} variant="primary">
                <i className="bi bi-star me-2"></i>
                Leave Review
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetails;