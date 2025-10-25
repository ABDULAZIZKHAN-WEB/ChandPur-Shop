import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Tab, Tabs, Spinner, Alert } from 'react-bootstrap';
import { getSettings, updateSettings } from '../../services/admin/adminSettingService';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    general: {},
    shipping: {},
    payment: {},
    email: {},
    tax: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      const groupedSettings = response.data;
      
      // Convert settings to a more usable format
      const formattedSettings = {
        general: {},
        shipping: {},
        payment: {},
        email: {},
        tax: {}
      };
      
      Object.keys(groupedSettings).forEach(group => {
        if (formattedSettings[group]) {
          groupedSettings[group].forEach(setting => {
            formattedSettings[group][setting.key] = setting.value;
          });
        }
      });
      
      setSettings(formattedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (group, key, value) => {
    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Prepare settings data for submission
      const settingsData = [];
      
      Object.keys(settings).forEach(group => {
        Object.keys(settings[group]).forEach(key => {
          settingsData.push({
            key: key,
            value: settings[group][key],
            group: group
          });
        });
      });
      
      console.log('Sending settings data:', { settings: settingsData });
      const response = await updateSettings({ settings: settingsData });
      console.log('Settings update response:', response);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      console.error('Error response:', error.response);
      
      // Provide more detailed error information
      let message = 'Failed to update settings';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 500) {
        message = 'Server error occurred while updating settings';
      } else if (error.response?.status === 422) {
        message = 'Invalid data provided';
      }
      
      toast.error(message);
    } finally {
      setSaving(false);
    }
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
        <h2>Settings</h2>
        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-save me-2"></i>
              Save Settings
            </>
          )}
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          {/* General Settings */}
          <Tab eventKey="general" title="General">
            <Card>
              <Card.Body>
                <h5 className="mb-4">General Settings</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Site Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={settings.general.site_name || ''}
                    onChange={(e) => handleInputChange('general', 'site_name', e.target.value)}
                    placeholder="Enter site name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Site Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={settings.general.site_description || ''}
                    onChange={(e) => handleInputChange('general', 'site_description', e.target.value)}
                    placeholder="Enter site description"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={settings.general.contact_email || ''}
                        onChange={(e) => handleInputChange('general', 'contact_email', e.target.value)}
                        placeholder="Enter contact email"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Phone</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.general.contact_phone || ''}
                        onChange={(e) => handleInputChange('general', 'contact_phone', e.target.value)}
                        placeholder="Enter contact phone"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={settings.general.address || ''}
                    onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                    placeholder="Enter business address"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Tab>

          {/* Shipping Settings */}
          <Tab eventKey="shipping" title="Shipping">
            <Card>
              <Card.Body>
                <h5 className="mb-4">Shipping Settings</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Default Shipping Cost</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.shipping.default_cost || ''}
                    onChange={(e) => handleInputChange('shipping', 'default_cost', e.target.value)}
                    placeholder="Enter default shipping cost"
                    min="0"
                    step="0.01"
                  />
                  <Form.Text className="text-muted">
                    Default shipping cost for orders (in BDT)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Free Shipping Threshold</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.shipping.free_threshold || ''}
                    onChange={(e) => handleInputChange('shipping', 'free_threshold', e.target.value)}
                    placeholder="Enter free shipping threshold"
                    min="0"
                    step="0.01"
                  />
                  <Form.Text className="text-muted">
                    Order total amount required for free shipping (in BDT)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Enable Shipping"
                    checked={settings.shipping.enabled === '1' || settings.shipping.enabled === true}
                    onChange={(e) => handleInputChange('shipping', 'enabled', e.target.checked ? '1' : '0')}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Tab>

          {/* Payment Settings */}
          <Tab eventKey="payment" title="Payment">
            <Card>
              <Card.Body>
                <h5 className="mb-4">Payment Settings</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Payment Methods</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Cash on Delivery"
                    checked={settings.payment.cod_enabled === '1' || settings.payment.cod_enabled === true}
                    onChange={(e) => handleInputChange('payment', 'cod_enabled', e.target.checked ? '1' : '0')}
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    label="Online Payment (SSLCommerz)"
                    checked={settings.payment.online_enabled === '1' || settings.payment.online_enabled === true}
                    onChange={(e) => handleInputChange('payment', 'online_enabled', e.target.checked ? '1' : '0')}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tax Rate (%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.payment.tax_rate || ''}
                    onChange={(e) => handleInputChange('payment', 'tax_rate', e.target.value)}
                    placeholder="Enter tax rate"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Tab>

          {/* Email Settings */}
          <Tab eventKey="email" title="Email">
            <Card>
              <Card.Body>
                <h5 className="mb-4">Email Settings</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>SMTP Host</Form.Label>
                  <Form.Control
                    type="text"
                    value={settings.email.smtp_host || ''}
                    onChange={(e) => handleInputChange('email', 'smtp_host', e.target.value)}
                    placeholder="Enter SMTP host"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Port</Form.Label>
                      <Form.Control
                        type="number"
                        value={settings.email.smtp_port || ''}
                        onChange={(e) => handleInputChange('email', 'smtp_port', e.target.value)}
                        placeholder="Enter SMTP port"
                        min="1"
                        max="65535"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Encryption</Form.Label>
                      <Form.Select
                        value={settings.email.smtp_encryption || ''}
                        onChange={(e) => handleInputChange('email', 'smtp_encryption', e.target.value)}
                      >
                        <option value="">None</option>
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>SMTP Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={settings.email.smtp_username || ''}
                    onChange={(e) => handleInputChange('email', 'smtp_username', e.target.value)}
                    placeholder="Enter SMTP username"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>SMTP Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={settings.email.smtp_password || ''}
                    onChange={(e) => handleInputChange('email', 'smtp_password', e.target.value)}
                    placeholder="Enter SMTP password"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Sender Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={settings.email.from_address || ''}
                    onChange={(e) => handleInputChange('email', 'from_address', e.target.value)}
                    placeholder="Enter sender email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Sender Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={settings.email.from_name || ''}
                    onChange={(e) => handleInputChange('email', 'from_name', e.target.value)}
                    placeholder="Enter sender name"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Tab>

          {/* Tax Settings */}
          <Tab eventKey="tax" title="Tax">
            <Card>
              <Card.Body>
                <h5 className="mb-4">Tax Settings</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Default Tax Rate (%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.tax.default_rate || ''}
                    onChange={(e) => handleInputChange('tax', 'default_rate', e.target.value)}
                    placeholder="Enter default tax rate"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Enable Tax"
                    checked={settings.tax.enabled === '1' || settings.tax.enabled === true}
                    onChange={(e) => handleInputChange('tax', 'enabled', e.target.checked ? '1' : '0')}
                  />
                </Form.Group>

                <Alert variant="info">
                  <h6>Tax Configuration</h6>
                  <p className="mb-0">
                    Configure tax rates for different product categories or regions if needed.
                    Currently using a flat tax rate for all products.
                  </p>
                </Alert>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        <div className="d-flex justify-content-end mt-4">
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Save Settings
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AdminSettings;