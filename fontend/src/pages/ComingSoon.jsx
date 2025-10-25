import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const ComingSoon = ({ title }) => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <h1>{title}</h1>
          <div className="my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <p className="lead">This page is coming soon. Please check back later.</p>
        </Col>
      </Row>
    </Container>
  );
};

export default ComingSoon;