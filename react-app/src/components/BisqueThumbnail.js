// src/components/BisqueThumbnail.js
import React, { useState } from 'react';
import { useBisque } from '../hooks/useBisque';

/**
 * Component to display a Bisque image thumbnail
 */
const BisqueThumbnail = ({ 
  resourceUniq, 
  width = 280, 
  height = 280,
  alt = 'Image thumbnail',
  onClick = null,
  className = '',
  placeholderImg = null
}) => {
  const { api } = useBisque();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Get thumbnail URL using the resource unique identifier
  const thumbnailUrl = resourceUniq ? 
    api.getThumbnailUrl(resourceUniq, width, height) : 
    placeholderImg;
  
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleError = (e) => {
    console.error('Error loading thumbnail:', e);
    setLoading(false);
    setError(true);
  };
  
  const containerClass = `bisque-thumbnail ${className} ${loading ? 'loading' : ''} ${error ? 'error' : ''}`;
  
  return (
    <div 
      className={containerClass} 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      {loading && <div className="thumbnail-loading">Loading...</div>}
      
      {error && <div className="thumbnail-error">!</div>}
      
      {thumbnailUrl && (
        <img 
          src={thumbnailUrl} 
          alt={alt} 
          onLoad={handleLoad}
          onError={handleError}
          style={{ opacity: loading ? 0 : 1 }}
        />
      )}
    </div>
  );
};

export default BisqueThumbnail;