// src/components/BisqueImageViewer.js
import React, { useState } from 'react';
import { useBisqueImage } from '../hooks/useBisque';

const ImageMetadataDisplay = ({ metadata }) => {
  if (!metadata) return null;
  
  return (
    <div className="image-metadata">
      <h3>Image Metadata</h3>
      <div className="metadata-grid">
        {metadata.pixel_size && (
          <div className="metadata-item">
            <span className="label">Dimensions:</span>
            <span>{metadata.x} × {metadata.y} pixels</span>
          </div>
        )}
        {metadata.pixel_resolution_x && (
          <div className="metadata-item">
            <span className="label">Resolution:</span>
            <span>
              {metadata.pixel_resolution_x} × {metadata.pixel_resolution_y} 
              {metadata.pixel_resolution_unit_x && ` ${metadata.pixel_resolution_unit_x}`}
            </span>
          </div>
        )}
        {metadata.image_num_c > 1 && (
          <div className="metadata-item">
            <span className="label">Channels:</span>
            <span>{metadata.image_num_c}</span>
          </div>
        )}
        {metadata.image_num_z > 1 && (
          <div className="metadata-item">
            <span className="label">Z-Slices:</span>
            <span>{metadata.image_num_z}</span>
          </div>
        )}
        {metadata.image_num_t > 1 && (
          <div className="metadata-item">
            <span className="label">Timepoints:</span>
            <span>{metadata.image_num_t}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Image viewer component for Bisque images
 */
const BisqueImageViewer = ({ 
  imageId, 
  maxWidth = 800, 
  maxHeight = 600, 
  showMetadata = true,
  showControls = true
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [channel, setChannel] = useState(0);
  const [zSlice, setZSlice] = useState(0);
  const [timepoint, setTimepoint] = useState(0);
  
  const { 
    image, 
    metadata, 
    imageUrl, 
    loading, 
    error 
  } = useBisqueImage(imageId, { 
    maxWidth, 
    maxHeight, 
    fetchMetadata: showMetadata,
    channel: channel,
    slice: zSlice,
    timepoint: timepoint
  });

  if (loading) {
    return <div className="loading">Loading image...</div>;
  }

  if (error) {
    return <div className="error">Error loading image: {error.message}</div>;
  }

  if (!image) {
    return <div className="no-image">No image found</div>;
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  return (
    <div className="bisque-image-viewer">
      <div className="image-container">
        <img 
          src={imageUrl} 
          alt={image.name || 'Bisque image'} 
          style={{ 
            maxWidth: `${maxWidth}px`, 
            maxHeight: `${maxHeight}px`,
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center'
          }}
        />
      </div>
      
      {showControls && (
        <div className="image-controls">
          <div className="zoom-controls">
            <button onClick={handleZoomOut} disabled={zoomLevel <= 50}>-</button>
            <span>{zoomLevel}%</span>
            <button onClick={handleZoomReset}>Reset</button>
            <button onClick={handleZoomIn} disabled={zoomLevel >= 200}>+</button>
          </div>
          
          {metadata && metadata.image_num_c > 1 && (
            <div className="dimension-controls">
              <label>
                Channel:
                <select 
                  value={channel} 
                  onChange={(e) => setChannel(Number(e.target.value))}
                >
                  {Array.from({length: metadata.image_num_c}, (_, i) => (
                    <option key={`ch-${i}`} value={i}>
                      {metadata.channel_names?.[i] || `Channel ${i+1}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          
          {metadata && metadata.image_num_z > 1 && (
            <div className="dimension-controls">
              <label>
                Z-Slice:
                <input 
                  type="range" 
                  min={0} 
                  max={metadata.image_num_z - 1} 
                  value={zSlice}
                  onChange={(e) => setZSlice(Number(e.target.value))}
                />
                <span>{zSlice + 1}/{metadata.image_num_z}</span>
              </label>
            </div>
          )}
          
          {metadata && metadata.image_num_t > 1 && (
            <div className="dimension-controls">
              <label>
                Timepoint:
                <input 
                  type="range" 
                  min={0} 
                  max={metadata.image_num_t - 1} 
                  value={timepoint}
                  onChange={(e) => setTimepoint(Number(e.target.value))}
                />
                <span>{timepoint + 1}/{metadata.image_num_t}</span>
              </label>
            </div>
          )}
        </div>
      )}
      
      {showMetadata && metadata && (
        <ImageMetadataDisplay metadata={metadata} />
      )}
      
      <div className="image-info">
        {image.name && <h2>{image.name}</h2>}
        {image.owner && <p>Owner: {image.owner}</p>}
        {image.value && <p>{image.value}</p>}
      </div>
    </div>
  );
};

export default BisqueImageViewer;