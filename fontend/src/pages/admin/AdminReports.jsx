import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Tab, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { 
  getSalesReport, 
  getProductsReport, 
  getCustomersReport,
  getInventoryReport
} from '../../services/admin/adminReportService';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { toast } from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [customersData, setCustomersData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end_date: new Date().toISOString().split('T')[0] // today
  });

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes, customersRes, inventoryRes] = await Promise.all([
        getSalesReport(dateRange),
        getProductsReport(dateRange),
        getCustomersReport(dateRange),
        getInventoryReport()
      ]);

      setSalesData(salesRes.data);
      setProductsData(productsRes.data);
      setCustomersData(customersRes.data);
      setInventoryData(inventoryRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilter = () => {
    fetchAllReports();
  };

  const exportReport = (type) => {
    // In a real implementation, this would call an export API endpoint
    toast.success(`Exporting ${type} report...`);
  };

  // Chart data configurations
  const salesChartData = salesData ? {
    labels: salesData.sales_data?.map(item => item.period) || [],
    datasets: [
      {
        label: 'Sales',
        data: salesData.sales_data?.map(item => item.total) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  } : null;

  const productsChartData = productsData ? {
    labels: productsData.products?.data?.slice(0, 10).map(item => item.name) || [],
    datasets: [
      {
        label: 'Units Sold',
        data: productsData.products?.data?.slice(0, 10).map(item => item.total_sold) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      }
    ]
  } : null;

  const customersChartData = customersData ? {
    labels: ['New Customers', 'Returning Customers'],
    datasets: [
      {
        data: [
          customersData.summary?.new_customers || 0,
          (customersData.summary?.total_customers || 0) - (customersData.summary?.new_customers || 0)
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1,
      }
    ]
  } : null;

  const inventoryChartData = inventoryData ? {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        data: [
          (inventoryData.total_products || 0) - (inventoryData.low_stock_count || 0) - (inventoryData.out_of_stock_count || 0),
          inventoryData.low_stock_count || 0,
          inventoryData.out_of_stock_count || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      }
    ]
  } : null;

  if (loading && !salesData) {
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
        <h2>Reports & Analytics</h2>
        <Button variant="outline-primary" onClick={() => exportReport(activeTab)}>
          <i className="bi bi-download me-2"></i>
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={dateRange.start_date}
                  onChange={handleDateRangeChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={dateRange.end_date}
                  onChange={handleDateRangeChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Button onClick={handleFilter}>Apply Filter</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="sales" title="Sales Report">
          {salesData && (
            <Row>
              <Col md={12} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5>Sales Overview</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <div className="text-center p-3 bg-primary text-white rounded">
                          <h4>{salesData.summary?.total_revenue?.toFixed(2) || '0.00'}</h4>
                          <p className="mb-0">Total Revenue</p>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center p-3 bg-success text-white rounded">
                          <h4>{salesData.summary?.total_orders || 0}</h4>
                          <p className="mb-0">Total Orders</p>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center p-3 bg-info text-white rounded">
                          <h4>{salesData.summary?.total_products_sold || 0}</h4>
                          <p className="mb-0">Products Sold</p>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center p-3 bg-warning text-white rounded">
                          <h4>{salesData.summary?.average_order_value?.toFixed(2) || '0.00'}</h4>
                          <p className="mb-0">Avg. Order Value</p>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={12}>
                <Card>
                  <Card.Header>
                    <h5>Sales Trend</h5>
                  </Card.Header>
                  <Card.Body>
                    {salesChartData && (
                      <Line data={salesChartData} options={{ responsive: true }} />
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>

        <Tab eventKey="products" title="Product Report">
          {productsData && (
            <Row>
              <Col md={12} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5>Top Selling Products</h5>
                  </Card.Header>
                  <Card.Body>
                    {productsChartData && (
                      <Bar data={productsChartData} options={{ responsive: true }} />
                    )}
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={12}>
                <Card>
                  <Card.Header>
                    <h5>Low Stock Products</h5>
                  </Card.Header>
                  <Card.Body>
                    {productsData.low_stock_products?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>SKU</th>
                              <th>Category</th>
                              <th>Current Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productsData.low_stock_products.map(product => (
                              <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.sku}</td>
                                <td>{product.category?.name || 'N/A'}</td>
                                <td>{product.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Alert variant="info">No low stock products found.</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>

        <Tab eventKey="customers" title="Customer Report">
          {customersData && (
            <Row>
              <Col md={12} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5>Customer Overview</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <div className="text-center p-3 bg-primary text-white rounded">
                          <h4>{customersData.summary?.total_customers || 0}</h4>
                          <p className="mb-0">Total Customers</p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center p-3 bg-success text-white rounded">
                          <h4>{customersData.summary?.new_customers || 0}</h4>
                          <p className="mb-0">New Customers</p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-center p-3 bg-info text-white rounded">
                          <h4>{customersData.top_customers?.length || 0}</h4>
                          <p className="mb-0">Top Customers</p>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h5>Customer Distribution</h5>
                  </Card.Header>
                  <Card.Body>
                    {customersChartData && (
                      <Pie data={customersChartData} options={{ responsive: true }} />
                    )}
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h5>Top Customers</h5>
                  </Card.Header>
                  <Card.Body>
                    {customersData.top_customers?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Customer Name</th>
                              <th>Email</th>
                              <th>Total Orders</th>
                              <th>Total Spent</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customersData.top_customers.slice(0, 5).map(customer => (
                              <tr key={customer.id}>
                                <td>{customer.name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.total_orders}</td>
                                <td>${customer.total_spent?.toFixed(2) || '0.00'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Alert variant="info">No customer data available.</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>

        <Tab eventKey="inventory" title="Inventory Report">
          {inventoryData && (
            <Row>
              <Col md={12} className="mb-4">
                <Card>
                  <Card.Header>
                    <h5>Inventory Overview</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <div className="text-center p-3 bg-primary text-white rounded">
                          <h4>{inventoryData.total_products || 0}</h4>
                          <p className="mb-0">Total Products</p>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center p-3 bg-success text-white rounded">
                          <h4>{inventoryData.tracked_products || 0}</h4>
                          <p className="mb-0">Tracked Products</p>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center p-3 bg-warning text-white rounded">
                          <h4>{inventoryData.low_stock_count || 0}</h4>
                          <p className="mb-0">Low Stock Items</p>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center p-3 bg-danger text-white rounded">
                          <h4>{inventoryData.out_of_stock_count || 0}</h4>
                          <p className="mb-0">Out of Stock Items</p>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={12}>
                <Card>
                  <Card.Header>
                    <h5>Inventory Status Distribution</h5>
                  </Card.Header>
                  <Card.Body>
                    {inventoryChartData && (
                      <Pie data={inventoryChartData} options={{ responsive: true }} />
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminReports;