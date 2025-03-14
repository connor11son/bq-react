// src/App.js
import React, { useState } from 'react';
import { BisqueProvider } from './hooks/useBisque';
import BisqueImageViewer from './components/BisqueImageViewer';
import BisqueImageBrowser from './components/BisqueImageBrowser';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState('browse'); // 'browse' or 'view'
  const [selectedImage, setSelectedImage] = useState(null);
  const [inputImageId, setInputImageId] = useState('');
  const baseUrl = process.env.REACT_APP_BISQUE_URL || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputImageId) {
      setSelectedImage({ id: inputImageId });
      setViewMode('view');
    }
  };

  const handleSelectImage = (image) => {
    setSelectedImage(image);
    setViewMode('view');
  };

  const handleBackToBrowse = () => {
    setViewMode('browse');
  };

  return (
    <BisqueProvider baseUrl={baseUrl}>
      <div className="App">
        <header className="App-header">
          <h1>Bisque Image Viewer</h1>
        </header>
        
        <main>
          <section className="image-search">
            <form onSubmit={handleSubmit}>
              <label htmlFor="image-id">Image ID:</label>
              <input 
                id="image-id"
                type="text" 
                value={inputImageId} 
                onChange={(e) => setInputImageId(e.target.value)}
                placeholder="Enter image ID or resource uniq"
              />
              <button type="submit">Load Image</button>
            </form>
            
            <div className="view-controls">
              <button 
                className={viewMode === 'browse' ? 'active' : ''}
                onClick={() => setViewMode('browse')}
              >
                Browse Images
              </button>
              {selectedImage && (
                <button 
                  className={viewMode === 'view' ? 'active' : ''}
                  onClick={() => setViewMode('view')}
                >
                  View Selected
                </button>
              )}
            </div>
          </section>
          
          {viewMode === 'browse' && (
            <section className="image-browser">
              <BisqueImageBrowser onSelectImage={handleSelectImage} limit={24} />
            </section>
          )}
          
          {viewMode === 'view' && selectedImage && (
            <section className="image-display">
              <button className="back-button" onClick={handleBackToBrowse}>
                ← Back to All Images
              </button>
              
              <BisqueImageViewer 
                imageId={selectedImage.id || selectedImage.resource_uniq}
                maxWidth={800}
                maxHeight={600}
                showMetadata={true}
                showControls={true}
              />
            </section>
          )}
        </main>
      </div>
    </BisqueProvider>
  );
}

export default App;