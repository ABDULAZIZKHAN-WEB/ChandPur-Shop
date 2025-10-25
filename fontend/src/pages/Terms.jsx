import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Terms = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1>Terms of Service</h1>
          <div className="my-4">
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <p className="lead text-center">This page is coming soon. Please check back later.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Terms;