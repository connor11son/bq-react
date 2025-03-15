// src/hooks/useBisque.js
import { useState, useEffect, useContext, createContext } from 'react';
import BisqueAPI from '../services/bisqueAPI';

// Create a context for the Bisque API
const BisqueContext = createContext(null);

/**
 * Provider component that makes Bisque API available to all child components
 */
export function BisqueProvider({ children, baseUrl = '' }) {
  const [api] = useState(() => new BisqueAPI(baseUrl));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initialize() {
      try {
        const authenticated = await api.initialize();
        setIsAuthenticated(authenticated);
        setIsInitialized(true);
      } catch (err) {
        setError(err);
        setIsInitialized(true);
      }
    }
    initialize();
  }, [api]);

  const value = {
    api,
    isAuthenticated,
    isInitialized,
    error
  };

  return (
    <BisqueContext.Provider value={value}>
      {children}
    </BisqueContext.Provider>
  );
}

/**
 * Hook that lets any component access the Bisque API
 */
export function useBisque() {
  const context = useContext(BisqueContext);
  if (!context) {
    throw new Error('useBisque must be used within a BisqueProvider');
  }
  return context;
}

/**
 * Hook to fetch and load an image from Bisque
 */
export function useBisqueImage(imageId, options = {}) {
  const { api } = useBisque();
  const [image, setImage] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadImage() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch the image resource
        if (imageId) {
          const imageData = await api.getImage(imageId);
          setImage(imageData);
          
          // Optionally fetch metadata
          if (options.fetchMetadata) {
            const metaData = await api.getImageMetadata(imageId);
            setMetadata(metaData);
          }
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadImage();
  }, [api, imageId, options.fetchMetadata]);

  // Calculate display URL using the resource_uniq value from image metadata
  const resourceUniq = image?.resource_uniq;
  const imageUrl = resourceUniq ? api.getImageUrl(resourceUniq, options) : null;

  return { image, metadata, imageUrl, loading, error };
}