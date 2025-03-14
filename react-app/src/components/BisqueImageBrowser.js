// src/components/BisqueImageBrowser.js
import React, { useState, useEffect } from 'react';
import { useBisque } from '../hooks/useBisque';
import BisqueThumbnail from './BisqueThumbnail';

/**
 * Component to browse and select images from Bisque
 */
const BisqueImageBrowser = ({ onSelectImage, limit = 20 }) => {
  const { api } = useBisque();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch recent images from data_service
        const response = await api.fetchJSON(`/data_service/image?limit=${limit}&wpublic=true`);
        setImages(response.image || []);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError(err.message || 'Failed to load images');
      } finally {
        setLoading(false);
      }
    }
    
    fetchImages();
  }, [api, limit]);
  
  const handleThumbnailClick = (image) => {
    if (onSelectImage) {
      onSelectImage(image);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading images...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  if (!images.length) {
    return <div className="no-images">No images found</div>;
  }
  
  return (
    <div className="bisque-image-browser">
      <h2>Available Images</h2>
      
      <div className="thumbnail-grid">
        {images.map((image) => (
          <div key={image.resource_uniq} className="thumbnail-item">
            <BisqueThumbnail 
              resourceUniq={image.resource_uniq}
              width={200}
              height={200}
              alt={image.name || 'Image'}
              onClick={() => handleThumbnailClick(image)}
            />
            <div className="thumbnail-caption">
              {image.name || 'Untitled Image'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BisqueImageBrowser;