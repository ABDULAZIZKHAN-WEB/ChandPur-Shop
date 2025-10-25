import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../common/StarRating';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    await addToCart({
      product_id: product.id,
      quantity: 1,
    });
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    await toggleWishlist(product.id);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="product-card h-100 shadow-sm">
      <div className="position-relative">
        <Link to={`/product/${product.slug}`}>
          <Card.Img 
            variant="top" 
            src={product.image_url || product.image || '/assets/product-placeholder.jpg'}
            alt={product.name}
            style={{ height: '200px', objectFit: 'cover' }}
          />
        </Link>
        
        {/* Badges */}
        <div className="position-absolute top-0 start-0 m-2">
          {product.featured && (
            <Badge bg="warning" className="me-1">Featured</Badge>
          )}
          {product.compare_price && product.compare_price > product.price && (
            <Badge bg="danger">
              {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="light"
          size="sm"
          className="position-absolute top-0 end-0 m-2 rounded-circle"
          onClick={handleWishlistToggle}
          style={{ width: '35px', height: '35px' }}
        >
          <i className={`bi ${isInWishlist(product.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
        </Button>

        {/* Stock Status */}
        {!product.is_in_stock && (
          <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white text-center py-2">
            <small>Out of Stock</small>
          </div>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <Link to={`/product/${product.slug}`} className="text-decoration-none">
          <Card.Title className="h6 text-dark mb-2" style={{ minHeight: '2.5rem' }}>
            {product.name}
          </Card.Title>
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <StarRating 
            rating={product.average_rating || 0} 
            size="sm"
          />
          <small className="text-muted ms-1">
            ({product.reviews_count || 0} reviews)
          </small>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="d-flex align-items-center">
            <span className="h5 text-primary mb-0 me-2">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <small className="text-muted text-decoration-line-through">
                {formatPrice(product.compare_price)}
              </small>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-auto">
          <Button
            variant={product.is_in_stock ? "primary" : "secondary"}
            className="w-100"
            onClick={handleAddToCart}
            disabled={!product.is_in_stock}
          >
            {product.is_in_stock ? (
              <>
                <i className="bi bi-cart-plus me-2"></i>
                Add to Cart
              </>
            ) : (
              'Out of Stock'
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;