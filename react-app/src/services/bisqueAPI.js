// src/services/bisqueApi.js
// A modern API wrapper for Bisque functionality

/**
 * BisqueAPI provides a modern interface to the Bisque backend services
 */
export default class BisqueAPI {
    constructor(baseUrl = '') {
      this.baseUrl = baseUrl;
      this.session = null;
    }
  
    /**
     * Initialize the API and check authentication
     */
    async initialize() {
      try {
        const sessionResponse = await this.fetchJSON('/auth_service/session');
        if (sessionResponse && sessionResponse.user) {
          this.session = sessionResponse;
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to initialize Bisque API:', error);
        return false;
      }
    }
  
    /**
     * Load an image by ID
     * @param {string} imageId - The image ID to load
     * @returns {Promise<Object>} - Image data
     */
    async getImage(imageId) {
      return this.fetchResource(`/data_service/image/${imageId}?view=deep`);
    }
  
    /**
     * Get image URL for direct display
     * @param {string} resourceUniq - The resource unique identifier
     * @param {Object} options - Additional parameters for image rendering
     * @returns {string} - Image URL
     */
    getImageUrl(resourceUniq, options = {}) {
      const params = new URLSearchParams();
      
      // Handle specific known parameters
      if (options.thumbnail) {
        // Handle thumbnail parameter (e.g. "280,280")
        if (typeof options.thumbnail === 'string') {
          params.append('thumbnail', options.thumbnail);
        } else if (Array.isArray(options.thumbnail) && options.thumbnail.length === 2) {
          params.append('thumbnail', `${options.thumbnail[0]},${options.thumbnail[1]}`);
        } else if (typeof options.thumbnail === 'object' && options.thumbnail.width && options.thumbnail.height) {
          params.append('thumbnail', `${options.thumbnail.width},${options.thumbnail.height}`);
        }
      }
      
      // Add other image service parameters
      if (options.maxWidth) params.append('maxWidth', options.maxWidth);
      if (options.maxHeight) params.append('maxHeight', options.maxHeight);
      if (options.format) params.append('format', options.format);
      if (options.slice) params.append('slice', options.slice);
      if (options.timepoint) params.append('t', options.timepoint);
      if (options.channel) params.append('c', options.channel);
      if (options.depth !== undefined) params.append('depth', options.depth);
      if (options.level !== undefined) params.append('level', options.level);
      if (options.roi) params.append('roi', options.roi);
      if (options.histogram) params.append('histogram', options.histogram === true ? 'true' : options.histogram);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return `${this.baseUrl}/image_service/${resourceUniq}${queryString}`;
    }
    
    /**
     * Get thumbnail URL for an image
     * @param {string} resourceUniq - The resource unique identifier
     * @param {number|string} width - Thumbnail width
     * @param {number|string} height - Thumbnail height (optional)
     * @returns {string} - Thumbnail URL
     */
    getThumbnailUrl(resourceUniq, width = 280, height = width) {
      return this.getImageUrl(resourceUniq, {
        thumbnail: `${width},${height}`
      });
    }
  
    /**
     * Get metadata for an image
     * @param {string} imageId - The image ID
     * @returns {Promise<Object>} - Image metadata
     */
    async getImageMetadata(imageId) {
      return this.fetchResource(`/image_service/${imageId}?meta`);
    }
  
    /**
     * Generic resource fetcher
     * @param {string} uri - Resource URI to fetch
     * @returns {Promise<Object>} - Parsed resource
     */
    async fetchResource(uri) {
      const response = await this.fetchJSON(uri);
      
      // If the response has a resource, transform it to a more React-friendly format
      if (response && response.resource) {
        return this.transformResource(response.resource);
      }
      
      return response;
    }
  
    /**
     * Generic JSON fetch with error handling
     * @param {string} uri - URI to fetch
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} - JSON response
     */
    async fetchJSON(uri, options = {}) {
      const url = `${this.baseUrl}${uri}`;
      
      const defaultOptions = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      };
      
      const fetchOptions = { ...defaultOptions, ...options };
      
      try {
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
      }
    }
  
    /**
     * Transform Bisque XML-like structure to a more React-friendly format
     * @param {Object} resource - Raw Bisque resource
     * @returns {Object} - Transformed resource
     */
    transformResource(resource) {
      if (!resource) return null;
      
      // Create a clean object with direct properties
      const transformed = {
        ...resource,
        id: resource.resource_uniq || resource.uri?.split('/').pop(),
        src: resource.src || (resource.resource_uniq ? 
          `${this.baseUrl}/image_service/${resource.resource_uniq}` : null),
        tags: this.transformTags(resource.tags || []),
        children: (resource.children || []).map(child => this.transformResource(child))
      };
      
      return transformed;
    }
  
    /**
     * Convert tag array to a more usable object
     * @param {Array} tags - Array of tag objects
     * @returns {Object} - Tag map by name
     */
    transformTags(tags) {
      const tagMap = {};
      
      for (const tag of tags) {
        if (tag.name) {
          // Handle tags with sub-tags
          if (tag.tags && tag.tags.length > 0) {
            tagMap[tag.name] = {
              value: tag.value,
              type: tag.type,
              subtags: this.transformTags(tag.tags)
            };
          } else {
            tagMap[tag.name] = tag.value;
          }
        }
      }
      
      return tagMap;
    }
  }