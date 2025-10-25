import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Spinner, Alert, Badge, InputGroup, FormControl } from 'react-bootstrap';
import { getUsers, createUser, updateUser, deleteUser, updateUserStatus } from '../../services/admin/adminUserService';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Pass pagination and search parameters
      const params = {
        page: currentPage,
        per_page: perPage,
        search: searchTerm
      };
      
      const response = await getUsers(params);
      
      // Handle both paginated and non-paginated responses
      if (response.data.data) {
        setUsers(response.data.data);
        setTotalPages(response.data.last_page || 1);
        setPerPage(response.data.per_page || 10);
      } else {
        setUsers(response.data);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
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

  const handleShowModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'customer',
        status: user.status || 'active',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
        status: 'active',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'customer',
      status: 'active',
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!editingUser) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
    } else {
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password && formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
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
      setSaving(true);
      
      const submitData = { ...formData };
      
      // Remove password confirmation before submitting
      delete submitData.password_confirmation;
      
      // If not editing and password is empty, remove it
      if (!editingUser && !submitData.password) {
        delete submitData.password;
      }
      
      // If editing and password is empty, remove it
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }
      
      if (editingUser) {
        // Update existing user
        const response = await updateUser(editingUser.id, submitData);
        toast.success(response.data.message || 'User updated successfully');
      } else {
        // Create new user
        const response = await createUser(submitData);
        toast.success(response.data.message || 'User created successfully');
      }
      
      handleCloseModal();
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error saving user:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to save user';
      toast.error(message);
      
      // Set field-specific errors if provided by backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the user "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setDeletingId(id);
      const response = await deleteUser(id);
      toast.success(response.data.message || 'User deleted successfully');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error deleting user:', error);
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await updateUserStatus(userId, newStatus);
      toast.success(response.data.message || `User ${newStatus}d successfully`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user status:', error);
      const message = error.response?.data?.message || 'Failed to update user status';
      toast.error(message);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { variant: 'danger', text: 'Admin' },
      customer: { variant: 'primary', text: 'Customer' },
    };
    
    const config = roleConfig[role] || { variant: 'secondary', text: role };
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2>Users Management</h2>
          <p className="text-muted mb-0">Manage user accounts and permissions</p>
        </div>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="bi bi-plus-lg me-2"></i>Add User
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
                  placeholder="Search users by name or email..."
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
          {filteredUsers.length === 0 ? (
            <Alert variant="info" className="text-center">
              <h5>No users found</h5>
              <p>{searchTerm ? 'Try a different search term.' : 'Get started by creating your first user.'}</p>
              <Button variant="primary" onClick={() => handleShowModal()}>
                <i className="bi bi-plus-lg me-2"></i>Create User
              </Button>
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="fw-medium">{user.name}</div>
                        </td>
                        <td>{user.email}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(user)}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant={user.status === 'active' ? 'outline-secondary' : 'outline-success'}
                              size="sm"
                              onClick={() => handleStatusChange(user.id, user.status)}
                              disabled={deletingId === user.id}
                            >
                              {user.status === 'active' ? (
                                <i className="bi bi-x-circle"></i>
                              ) : (
                                <i className="bi bi-check-circle"></i>
                              )}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(user.id, user.name)}
                              disabled={deletingId === user.id}
                            >
                              {deletingId === user.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <i className="bi bi-trash"></i>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, users.length)} of {users.length} entries
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

      {/* User Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Edit User' : 'Create User'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    placeholder="Enter user name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    placeholder="Enter user email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password {!editingUser && '*'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password}
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {editingUser ? "Leave blank to keep current password" : "Minimum 8 characters"}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password {!editingUser && '*'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password_confirmation}
                    placeholder={editingUser ? "Confirm new password" : "Confirm password"}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password_confirmation}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    isInvalid={!!errors.role}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.role}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
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
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                editingUser ? 'Update User' : 'Create User'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers;