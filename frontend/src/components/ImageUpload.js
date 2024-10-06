import React, { useState, useEffect } from 'react';
import '../css/ImageUpload.css'; // Import the CSS file for styling

const ImageUpload= () => {
  const [productImage, setProductImage] = useState(null);
  const [expiryImage, setExpiryImage] = useState(null);
  const [productPreview, setProductPreview] = useState(null);
  const [expiryPreview, setExpiryPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [temperature, setTemperature] = useState('');

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setCurrentDate(formattedDate);
  }, []);

  const handleProductImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setProductImage(img);
      setProductPreview(URL.createObjectURL(img));
      setPrediction(null);
      setOcrData(null);
      setError(null);
    }
  };

  const handleExpiryImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setExpiryImage(img);
      setExpiryPreview(URL.createObjectURL(img));
      setPrediction(null);
      setOcrData(null);
      setError(null);
    }
  };

  const handleTemperatureChange = (event) => {
    setTemperature(event.target.value);
    setPrediction(null);
    setOcrData(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!productImage || !expiryImage) {
      setError('Please select both Product Image and Expiry Label Image before submitting.');
      return;
    }

    if (temperature === '') {
      setError('Please enter the storage temperature.');
      return;
    }

    const tempValue = parseFloat(temperature);
    if (isNaN(tempValue)) {
      setError('Temperature must be a valid number.');
      return;
    }

    const formData = new FormData();
    formData.append('product_image', productImage);
    formData.append('expiry_image', expiryImage);
    formData.append('temperature', temperature);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred while processing the images.');
        setPrediction(null);
        setOcrData(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setPrediction({
        freshness: data.freshness,
        base_shelf_life: data.base_shelf_life,
        adjusted_shelf_life: data.adjusted_shelf_life,
      });
      setOcrData(data.ocr_data);
      setLoading(false);
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
      setPrediction(null);
      setOcrData(null);
      setLoading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <header className="header">
        <div className="logo">Flipkart</div>
        <div className="search-container">
          <input type="text" className="search-input" placeholder="Search for products..." />
        </div>
        <button className="login-button">Login</button>
      </header>

      <div className="main-content">
        <h3 className="current-date">Current Date: {currentDate}</h3>
        <div className="grid-container">
          <div className="grid-item">
            <h2 className="frame-heading">Image Processing</h2>
            <div className="form-container">
              <form id="imageForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="productImage">Upload Product Image:</label>
                  <input
                    type="file"
                    className="custom-file-input"
                    id="productImage"
                    accept="image/*"
                    onChange={handleProductImageChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expiryImage">Upload Expiry Label Image:</label>
                  <input
                    type="file"
                    className="custom-file-input"
                    id="expiryImage"
                    accept="image/*"
                    onChange={handleExpiryImageChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="temperature">Storage Temperature (°C):</label>
                  <input
                    type="number"
                    className="temperature-input"
                    id="temperature"
                    value={temperature}
                    onChange={handleTemperatureChange}
                    placeholder="Enter temperature in °C"
                    required
                  />
                </div>

                <button type="submit" className="submit-button">Upload Images</button>
              </form>

              <div className="image-preview" id="imagePreview">
                <div className="image-container">
                  {productPreview && (
                    <>
                      <img id="productPreview" src={productPreview} alt="Product Preview" className="image-preview-img" />
                      <span className="image-label">Product Image</span>
                    </>
                  )}
                </div>
                <div className="image-container">
                  {expiryPreview && (
                    <>
                      <img id="expiryPreview" src={expiryPreview} alt="Expiry Label Preview" className="image-preview-img" />
                      <span className="image-label">Expiry Label Image</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid-item">
            <h2 className="frame-heading">Freshness Analysis</h2>
            <div className="result-container">
              {loading && <p>Loading...</p>}
              {prediction && (
                <div className="prediction-result">
                  <p><strong>Freshness:</strong> {prediction.freshness}</p>
                  <p><strong>Base Shelf Life:</strong> {prediction.base_shelf_life} days</p>
                  <p><strong>Adjusted Shelf Life:</strong> {prediction.adjusted_shelf_life} days</p>
                  <p><strong>Storage Temperature:</strong> {temperature}°C</p>
                  {productPreview && (
                    <div className="analysis-image">
                      <h3>Product Image:</h3>
                      <img src={productPreview} alt="Product" className="image-preview-img" />
                    </div>
                  )}
                </div>
              )}
              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid-item full-width">
            <h2 className="frame-heading">Expiry Data</h2>
            <div className="result-container">
              {ocrData ? (
                <div className="ocr-result">
                  <p><strong>Expiry Date:</strong> {ocrData.expiry_date}</p>
                  <p><strong>Manufacturing Date:</strong> {ocrData.mfg_date}</p>
                  <p><strong>Best Before:</strong> {ocrData.best_before}</p>
                  {expiryPreview && (
                    <div className="ocr-image">
                      <h3>Expiry Label Image:</h3>
                      <img src={expiryPreview} alt="Expiry Label" className="image-preview-img" />
                    </div>
                  )}
                </div>
              ) : (
                <p>No OCR data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
