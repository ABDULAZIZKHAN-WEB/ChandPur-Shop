import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState({});

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        setErrors({ profile: result.message });
      }
    } catch (error) {
      setErrors({ profile: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setErrors({ password: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const result = await updatePassword(passwordForm);
      if (result.success) {
        toast.success('Password updated successfully!');
        setPasswordForm({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
      } else {
        setErrors({ password: result.message });
      }
    } catch (error) {
      setErrors({ password: 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="mb-4">
            <h2>My Profile</h2>
            <p className="text-muted">Manage your account settings and preferences</p>
          </div>

          <Card>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                <Tab eventKey="profile" title="Profile Information">
                  <Form onSubmit={handleProfileSubmit}>
                    {errors.profile && (
                      <Alert variant="danger">{errors.profile}</Alert>
                    )}

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            placeholder="Enter your phone number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Account Type</Form.Label>
                          <Form.Control
                            type="text"
                            value={user?.is_admin ? 'Administrator' : 'Customer'}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </div>
                  </Form>
                </Tab>

                <Tab eventKey="password" title="Change Password">
                  <Form onSubmit={handlePasswordSubmit}>
                    {errors.password && (
                      <Alert variant="danger">{errors.password}</Alert>
                    )}

                    <Form.Group className="mb-3">
                      <Form.Label>Current Password *</Form.Label>
                      <Form.Control
                        type="password"
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>New Password *</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={passwordForm.password}
                            onChange={handlePasswordChange}
                            minLength="8"
                            required
                          />
                          <Form.Text className="text-muted">
                            Password must be at least 8 characters long.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm New Password *</Form.Label>
                          <Form.Control
                            type="password"
                            name="password_confirmation"
                            value={passwordForm.password_confirmation}
                            onChange={handlePasswordChange}
                            minLength="8"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </Form>
                </Tab>

                <Tab eventKey="account" title="Account Details">
                  <div className="py-3">
                    <h6>Account Information</h6>
                    <hr />
                    
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong>Member Since:</strong>
                          <p className="text-muted mb-0">
                            {new Date(user?.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong>Account Status:</strong>
                          <p className="mb-0">
                            <span className="badge bg-success">Active</span>
                          </p>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong>Email Verified:</strong>
                          <p className="mb-0">
                            <span className={`badge ${user?.email_verified_at ? 'bg-success' : 'bg-warning'}`}>
                              {user?.email_verified_at ? 'Verified' : 'Not Verified'}
                            </span>
                          </p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong>User ID:</strong>
                          <p className="text-muted mb-0">#{user?.id}</p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;