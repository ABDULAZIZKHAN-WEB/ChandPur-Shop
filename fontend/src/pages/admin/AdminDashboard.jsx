import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Spinner, Alert, ButtonGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  getDashboardStatistics, 
  getRecentOrders, 
  getTopProducts, 
  getLowStockProducts,
  getSalesChart
} from '../../services/admin/adminDashboardService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchSalesChart();
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch statistics
      let statsData = null;
      try {
        const statsRes = await getDashboardStatistics();
        statsData = statsRes.data;
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Failed to load dashboard statistics');
      }
      
      // Fetch recent orders
      let ordersData = [];
      try {
        const ordersRes = await getRecentOrders();
        ordersData = ordersRes.data;
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        setError(prev => prev ? `${prev}, orders` : 'Failed to load recent orders');
      }
      
      // Fetch top products
      let productsData = [];
      try {
        const productsRes = await getTopProducts();
        productsData = productsRes.data || [];
      } catch (error) {
        console.error('Error fetching top products:', error);
        setError(prev => prev ? `${prev}, top products` : 'Failed to load top products');
      }
      
      // Fetch low stock products
      let lowStockData = [];
      try {
        const lowStockRes = await getLowStockProducts();
        lowStockData = lowStockRes.data || [];
      } catch (error) {
        console.error('Error fetching low stock products:', error);
        setError(prev => prev ? `${prev}, low stock products` : 'Failed to load low stock products');
      }
      
      setStatistics(statsData);
      setRecentOrders(ordersData);
      setTopProducts(productsData);
      setLowStockProducts(lowStockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesChart = async () => {
    try {
      setChartLoading(true);
      const response = await getSalesChart({ period: chartPeriod });
      // Format data for chart
      const formattedData = response.data.map(item => ({
        ...item,
        date: item.date || item.period,
        total: parseFloat(item.total)
      }));
      setSalesData(formattedData);
    } catch (error) {
      console.error('Error fetching sales chart data:', error);
      setError(prev => prev ? `${prev}, sales chart` : 'Failed to load sales chart');
    } finally {
      setChartLoading(false);
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

  const formatChartDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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

  // Prepare data for order status pie chart
  const getOrderStatusData = () => {
    if (!statistics) return [];
    
    return [
      { name: 'Pending', value: statistics.orders.pending, color: '#ffc107' },
      { name: 'Processing', value: statistics.orders.processing, color: '#17a2b8' },
      { name: 'Shipped', value: statistics.orders.shipped || 0, color: '#0d6efd' },
      { name: 'Delivered', value: statistics.orders.completed, color: '#28a745' },
      { name: 'Cancelled', value: statistics.orders.cancelled, color: '#dc3545' },
    ];
  };

  // Prepare data for product status pie chart
  const getProductStatusData = () => {
    if (!statistics) return [];
    
    return [
      { name: 'Active', value: statistics.products.active, color: '#28a745' },
      { name: 'Inactive', value: statistics.products.total - statistics.products.active, color: '#6c757d' },
      { name: 'Out of Stock', value: statistics.products.out_of_stock, color: '#dc3545' },
    ];
  };

  // Prepare data for performance metrics
  const getPerformanceMetrics = () => {
    if (!statistics) return [];
    
    const conversionRate = statistics.orders.total > 0 ? Math.round((statistics.orders.completed / statistics.orders.total) * 100) : 0;
    const customerRetention = statistics.users.total > 0 ? Math.round((statistics.users.active / statistics.users.total) * 100) : 0;
    const productAvailability = statistics.products.total > 0 ? Math.round((statistics.products.active / statistics.products.total) * 100) : 0;
    
    return [
      { name: 'Conversion', value: conversionRate, color: '#0d6efd' },
      { name: 'Customer Retention', value: customerRetention, color: '#28a745' },
      { name: 'Product Availability', value: productAvailability, color: '#ffc107' },
    ];
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
          <h2>Dashboard</h2>
          <p className="text-muted mb-0">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="text-end">
          <small className="text-muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
          <br />
          <small className="text-muted">Last updated: {new Date().toLocaleTimeString()}</small>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={fetchDashboardData}>
                Retry
              </Button>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Row className="mb-4">
          <Col xl={3} lg={6} md={6} className="mb-4">
            <Card className="h-100 border-start border-4 border-success shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Revenue</h6>
                    <h4 className="mb-0 text-success">
                      {formatPrice(statistics.revenue.total)}
                    </h4>
                    <small className="text-muted">
                      This month: {formatPrice(statistics.revenue.month)}
                      {statistics.revenue.growth_percentage !== 0 && (
                        <span className={`ms-2 ${statistics.revenue.growth_percentage > 0 ? 'text-success' : 'text-danger'}`}>
                          <i className={`bi bi-arrow-${statistics.revenue.growth_percentage > 0 ? 'up' : 'down'}`}></i>
                          {Math.abs(statistics.revenue.growth_percentage)}%
                        </span>
                      )}
                    </small>
                  </div>
                  <div className="text-success">
                    <i className="bi bi-currency-dollar fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} className="mb-4">
            <Card className="h-100 border-start border-4 border-primary shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Orders</h6>
                    <h4 className="mb-0 text-primary">
                      {statistics.orders.total}
                    </h4>
                    <small className="text-muted">
                      Pending: {statistics.orders.pending}
                    </small>
                  </div>
                  <div className="text-primary">
                    <i className="bi bi-cart-check fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} className="mb-4">
            <Card className="h-100 border-start border-4 border-info shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Products</h6>
                    <h4 className="mb-0 text-info">
                      {statistics.products.total}
                    </h4>
                    <small className="text-muted">
                      Active: {statistics.products.active}
                    </small>
                  </div>
                  <div className="text-info">
                    <i className="bi bi-box-seam fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} className="mb-4">
            <Card className="h-100 border-start border-4 border-warning shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Users</h6>
                    <h4 className="mb-0 text-warning">
                      {statistics.users.total}
                    </h4>
                    <small className="text-muted">
                      Active: {statistics.users.active}
                    </small>
                  </div>
                  <div className="text-warning">
                    <i className="bi bi-people fs-2"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        {/* Sales Chart */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Sales Overview</h5>
              <ButtonGroup size="sm">
                <Button 
                  variant={chartPeriod === 'day' ? 'primary' : 'outline-primary'}
                  onClick={() => setChartPeriod('day')}
                >
                  7 Days
                </Button>
                <Button 
                  variant={chartPeriod === 'week' ? 'primary' : 'outline-primary'}
                  onClick={() => setChartPeriod('week')}
                >
                  12 Weeks
                </Button>
                <Button 
                  variant={chartPeriod === 'month' ? 'primary' : 'outline-primary'}
                  onClick={() => setChartPeriod('month')}
                >
                  12 Months
                </Button>
              </ButtonGroup>
            </Card.Header>
            <Card.Body>
              {chartLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : salesData.length > 0 ? (
                <div style={{ height: '300px', width: '100%', minWidth: '0' }}>
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatChartDate}
                      />
                      <YAxis 
                        tickFormatter={(value) => `৳${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        formatter={(value) => [formatPrice(value), 'Revenue']}
                        labelFormatter={formatChartDate}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        name="Revenue" 
                        stroke="#0d6efd" 
                        fill="#0d6efd"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No sales data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Performance Metrics */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Performance Metrics</h5>
            </Card.Header>
            <Card.Body>
              {statistics && (
                <div style={{ height: '300px', width: '100%', minWidth: '0' }}>
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <BarChart data={getPerformanceMetrics()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Bar dataKey="value" name="Percentage">
                        {getPerformanceMetrics().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Order Status Distribution */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Order Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              {statistics && (
                <div style={{ height: '250px', width: '100%', minWidth: '0' }}>
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <PieChart>
                      <Pie
                        data={getOrderStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getOrderStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Orders']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Product Status Distribution */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Product Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              {statistics && (
                <div style={{ height: '250px', width: '100%', minWidth: '0' }}>
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <PieChart>
                      <Pie
                        data={getProductStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getProductStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Products']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* User Statistics */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">User Statistics</h5>
            </Card.Header>
            <Card.Body>
              {statistics && (
                <div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Total Users</span>
                    <strong>{statistics.users.total}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Active Users</span>
                    <strong className="text-success">{statistics.users.active}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>New This Month</span>
                    <strong className="text-primary">{statistics.users.new_this_month}</strong>
                  </div>
                  <div className="progress mt-3">
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${(statistics.users.active / statistics.users.total) * 100}%` }}
                      aria-valuenow={statistics.users.active}
                      aria-valuemin="0"
                      aria-valuemax={statistics.users.total}
                    >
                      {Math.round((statistics.users.active / statistics.users.total) * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Recent Orders */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {recentOrders.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <Link 
                              to={`/admin/orders/${order.id}`}
                              className="text-decoration-none"
                            >
                              #{order.order_number}
                            </Link>
                          </td>
                          <td>{order.user?.name || 'N/A'}</td>
                          <td>{formatPrice(order.total)}</td>
                          <td>{getStatusBadge(order.order_status)}</td>
                          <td>{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No recent orders</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Top Products */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top Selling Products</h5>
              <Link to="/admin/products" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {topProducts.length > 0 ? (
                <div>
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="d-flex align-items-center mb-3">
                      <div className="me-3">
                        <span className="badge bg-primary rounded-pill">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{product.name}</h6>
                        <small className="text-muted">
                          Sold: {product.total_sold || 0}
                        </small>
                      </div>
                      <div>
                        <small className="text-success">
                          {formatPrice(product.price)}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No product data</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Quick Actions */}
        <Col lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Link to="/admin/products/create" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>Add Product
                </Link>
                <Link to="/admin/orders" className="btn btn-outline-primary">
                  <i className="bi bi-cart me-2"></i>Manage Orders
                </Link>
                <Link to="/admin/users" className="btn btn-outline-primary">
                  <i className="bi bi-people me-2"></i>Manage Users
                </Link>
                <Link to="/admin/reports" className="btn btn-outline-primary">
                  <i className="bi bi-graph-up me-2"></i>View Reports
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Low Stock Products */}
        <Col lg={8} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Low Stock Products</h5>
              <Link to="/admin/products" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {lowStockProducts.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Current Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.slice(0, 5).map((product) => (
                        <tr key={product.id}>
                          <td>
                            <Link to={`/admin/products/${product.id}/edit`} className="text-decoration-none">
                              {product.name}
                            </Link>
                          </td>
                          <td>{product.sku || 'N/A'}</td>
                          <td>{product.category?.name || 'N/A'}</td>
                          <td>
                            <Badge bg={product.quantity <= 5 ? 'danger' : 'warning'}>
                              {product.quantity}
                            </Badge>
                          </td>
                          <td>
                            {product.quantity <= 0 ? (
                              <Badge bg="danger">Out of Stock</Badge>
                            ) : product.quantity <= 5 ? (
                              <Badge bg="danger">Critical</Badge>
                            ) : (
                              <Badge bg="warning">Low</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No low stock products</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Row>
          <Col>
            <Alert variant="warning">
              <Alert.Heading className="h6">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Low Stock Alert
              </Alert.Heading>
              <p className="mb-2">
                {lowStockProducts.length} products are running low on stock:
              </p>
              <div className="d-flex flex-wrap gap-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <Badge key={product.id} bg="warning" text="dark">
                    {product.name} ({product.quantity} left)
                  </Badge>
                ))}
                {lowStockProducts.length > 5 && (
                  <Badge bg="secondary">
                    +{lowStockProducts.length - 5} more
                  </Badge>
                )}
              </div>
            </Alert>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AdminDashboard;