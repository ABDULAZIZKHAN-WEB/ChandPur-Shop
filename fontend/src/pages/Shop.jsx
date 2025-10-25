import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { getProducts, getProductsByCategory, getCategories } from '../services/productService';
import { toast } from 'react-hot-toast';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams(); // Category slug from URL

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest',
    in_stock: searchParams.get('in_stock') === 'true',
    featured: searchParams.get('featured') === 'true',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, slug]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = {
        search: searchParams.get('search'),
        min_price: searchParams.get('min_price'),
        max_price: searchParams.get('max_price'),
        sort: searchParams.get('sort') || 'newest',
        in_stock: searchParams.get('in_stock'),
        featured: searchParams.get('featured'),
        page: searchParams.get('page') || 1,
        per_page: 12,
      };

      let response;
      if (slug) {
        // Fetch products by category
        response = await getProductsByCategory(slug, params);
        setProducts(response.data.products.data);
        setPagination(response.data.products);
      } else {
        // Fetch all products
        response = await getProducts(params);
        setProducts(response.data.data);
        setPagination(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    handleFilterChange('sort', e.target.value);
  };

  const handlePriceFilter = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const minPrice = formData.get('min_price');
    const maxPrice = formData.get('max_price');
    
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set('min_price', minPrice);
    else newParams.delete('min_price');
    
    if (maxPrice) newParams.set('max_price', maxPrice);
    else newParams.delete('max_price');
    
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      sort: 'newest',
      in_stock: false,
      featured: false,
    });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  return (
    <Container className="py-4">
      <Row>
        {/* Sidebar Filters */}
        <Col lg={3} className="mb-4">
          <div className="bg-light p-3 rounded">
            <h5 className="mb-3">Filters</h5>
            
            {/* Search */}
            <Form.Group className="mb-3">
              <Form.Label>Search Products</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Form.Group>

            {/* Categories */}
            <Form.Group className="mb-3">
              <Form.Label>Categories</Form.Label>
              <Form.Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Price Range */}
            <Form onSubmit={handlePriceFilter} className="mb-3">
              <Form.Label>Price Range</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    type="number"
                    name="min_price"
                    placeholder="Min"
                    defaultValue={filters.min_price}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    name="max_price"
                    placeholder="Max"
                    defaultValue={filters.max_price}
                  />
                </Col>
              </Row>
              <Button type="submit" variant="outline-primary" size="sm" className="mt-2 w-100">
                Apply
              </Button>
            </Form>

            {/* Checkboxes */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="In Stock Only"
                checked={filters.in_stock}
                onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
              />
              <Form.Check
                type="checkbox"
                label="Featured Products"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
              />
            </Form.Group>

            <Button variant="outline-secondary" size="sm" onClick={clearFilters} className="w-100">
              Clear All Filters
            </Button>
          </div>
        </Col>

        {/* Products */}
        <Col lg={9}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>{slug ? `Category: ${slug}` : 'All Products'}</h2>
              {pagination.total && (
                <p className="text-muted mb-0">
                  Showing {pagination.from}-{pagination.to} of {pagination.total} products
                </p>
              )}
            </div>
            
            <Form.Select
              style={{ width: 'auto' }}
              value={filters.sort}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </Form.Select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {/* No Products */}
          {!loading && products.length === 0 && (
            <Alert variant="info" className="text-center">
              <h5>No products found</h5>
              <p>Try adjusting your filters or search terms.</p>
            </Alert>
          )}

          {/* Products Grid */}
          {!loading && products.length > 0 && (
            <>
              <Row>
                {products.map(product => (
                  <Col key={product.id} lg={4} md={6} className="mb-4">
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {[...Array(pagination.last_page)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <li key={page} className={`page-item ${pagination.current_page === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    
                    <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Shop;