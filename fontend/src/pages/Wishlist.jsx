import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Button, Spinner, Card, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/products/ProductCard';
import { toast } from 'react-hot-toast';

const Wishlist = () => {
  const { wishlistItems, loading, fetchWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_added');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to remove ${selectedItems.length} item(s) from your wishlist?`)) {
      return;
    }

    try {
      for (const itemId of selectedItems) {
        await removeFromWishlist(itemId);
      }
      setSelectedItems([]);
      toast.success(`${selectedItems.length} item(s) removed from wishlist`);
    } catch (error) {
      console.error('Error removing items:', error);
      toast.error('Failed to remove items from wishlist');
    }
  };

  const handleClearWishlist = async () => {
    if (wishlistItems.length === 0) return;
    
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      await clearWishlist();
      setSelectedItems([]);
      toast.success('Wishlist cleared successfully');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  const handleAddSelectedToCart = async () => {
    if (selectedItems.length === 0) return;
    
    setIsAddingToCart(true);
    try {
      let addedCount = 0;
      for (const itemId of selectedItems) {
        const wishlistItem = wishlistItems.find(item => item.id === itemId);
        if (wishlistItem) {
          const response = await addToCart({
            product_id: wishlistItem.product_id,
            quantity: 1,
          });
          if (response.success) {
            addedCount++;
          }
        }
      }
      toast.success(`${addedCount} item(s) added to cart`);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error adding items to cart:', error);
      toast.error('Failed to add items to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Filter and sort items
  const filteredItems = wishlistItems.filter(item => 
    item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return a.product?.name.localeCompare(b.product?.name);
      case 'name_desc':
        return b.product?.name.localeCompare(a.product?.name);
      case 'price_asc':
        return (a.product?.price || 0) - (b.product?.price || 0);
      case 'price_desc':
        return (b.product?.price || 0) - (a.product?.price || 0);
      case 'date_added':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

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

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <h2 className="mb-3 mb-md-0">My Wishlist ({wishlistItems.length} items)</h2>
            {wishlistItems.length > 0 && (
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={handleClearWishlist}
                  disabled={wishlistItems.length === 0}
                >
                  <i className="bi bi-trash me-1"></i>
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <Alert variant="info" className="text-center">
              <div className="py-5">
                <i className="bi bi-heart display-1 text-muted"></i>
                <h5 className="mt-3">Your wishlist is empty</h5>
                <p className="text-muted">
                  Save items you love to your wishlist and shop them later.
                </p>
                <Button as={Link} to="/shop" variant="primary" size="lg">
                  Continue Shopping
                </Button>
              </div>
            </Alert>
          ) : (
            <>
              {/* Search and Sort Controls */}
              <Card className="mb-4">
                <Card.Body>
                  <Row>
                    <Col md={6} className="mb-3 mb-md-0">
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search wishlist items..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-sort-down"></i>
                        </InputGroup.Text>
                        <Form.Select value={sortBy} onChange={handleSortChange}>
                          <option value="date_added">Date Added</option>
                          <option value="name_asc">Name (A-Z)</option>
                          <option value="name_desc">Name (Z-A)</option>
                          <option value="price_asc">Price (Low to High)</option>
                          <option value="price_desc">Price (High to Low)</option>
                        </Form.Select>
                      </InputGroup>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Bulk Actions */}
              {sortedItems.length > 0 && (
                <Card className="mb-4">
                  <Card.Body>
                    <div className="d-flex flex-wrap align-items-center justify-content-between">
                      <div className="d-flex align-items-center mb-2 mb-md-0">
                        <Form.Check
                          type="checkbox"
                          id="select-all"
                          checked={selectedItems.length === sortedItems.length && sortedItems.length > 0}
                          onChange={handleSelectAll}
                          className="me-2"
                        />
                        <label htmlFor="select-all" className="mb-0">
                          Select all ({sortedItems.length})
                        </label>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleAddSelectedToCart}
                          disabled={selectedItems.length === 0 || isAddingToCart}
                        >
                          {isAddingToCart ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-1" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cart-plus me-1"></i>
                              Add Selected to Cart
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={handleRemoveSelected}
                          disabled={selectedItems.length === 0}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Remove Selected
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Wishlist Items */}
              {sortedItems.length === 0 ? (
                <Alert variant="info">
                  <h5>No items found</h5>
                  <p>Try adjusting your search or filter criteria.</p>
                </Alert>
              ) : (
                <Row>
                  {sortedItems.map((item) => (
                    <Col key={item.id} lg={3} md={4} sm={6} className="mb-4">
                      <div className="position-relative">
                        <Form.Check
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="position-absolute top-0 start-0 m-2 z-1"
                          style={{ 
                            backgroundColor: 'white', 
                            borderRadius: '3px',
                            border: '2px solid #007bff',
                            width: '20px',
                            height: '20px'
                          }}
                        />
                        <div className={selectedItems.includes(item.id) ? 'border border-primary border-2 rounded' : ''}>
                          <ProductCard product={item.product} />
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Wishlist;