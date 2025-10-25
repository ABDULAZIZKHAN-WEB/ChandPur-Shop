import React from 'react';

const StarRating = ({ rating = 0, maxRating = 5, size = 'md', showRating = false, className = '' }) => {
  const sizeClasses = {
    sm: 'fs-6',
    md: 'fs-5',
    lg: 'fs-4',
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <i key="half" className="bi bi-star-half text-warning"></i>
      );
    }

    // Empty stars
    const emptyStars = maxRating - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="bi bi-star text-muted"></i>
      );
    }

    return stars;
  };

  return (
    <div className={`d-inline-flex align-items-center ${className}`}>
      <div className={`${sizeClasses[size]} me-1`}>
        {renderStars()}
      </div>
      {showRating && (
        <span className="text-muted small">
          {rating.toFixed(1)} / {maxRating}
        </span>
      )}
    </div>
  );
};

export default StarRating;