import React, { useState, useEffect } from 'react';
import '../css/ImageUpload.css'; // Import the CSS file for styling

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null); // State to store the selected image URL
  const [prediction, setPrediction] = useState(null); // State to store the prediction result
  const [error, setError] = useState(null); // State to store any error messages
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [currentDate, setCurrentDate] = useState(''); // State for current date

  // Set current date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setCurrentDate(formattedDate);
  }, []);

  // Function to handle image selection
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setSelectedImage(URL.createObjectURL(img)); // Create a URL for the selected image
      setPrediction(null); // Reset previous predictions
      setError(null); // Reset previous errors
    }
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    if (!selectedImage) {
      setError('Please select an image before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('file', event.target.elements.file.files[0]); // Append the selected file
    setLoading(true); // Start loading spinner

    try {
      const response = await fetch('http://127.0.0.1:5000', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred while processing the image.');
        setPrediction(null);
        setLoading(false); // Stop loading spinner
        return;
      }

      const data = await response.json();
      setPrediction(data); // Set the prediction result
      setError(null); // Clear any previous errors
      setLoading(false); // Stop loading spinner
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
      setPrediction(null);
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="image-upload-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-logo">Flipkart</div>
        <ul className="navbar-links">
          <li>Home</li>
          <li>Products</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </nav>

      <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'center' }}>
        <div className="upload-card">
          <h1>Fruit Freshness & Shelf Life Prediction</h1>
          <p className="current-date">{currentDate}</p> {/* Display current date */}
          <form onSubmit={handleSubmit} className="upload-form">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="file-input"
              name="file"
              required
            />
            <label htmlFor="file-input" className="upload-button">
              Choose an Image
            </label>
            <button type="submit" className="submit-button">Predict</button>
          </form>

          {selectedImage && (
            <div className="image-preview">
              <h2>Selected Image:</h2>
              <img src={selectedImage} alt="Selected" />
            </div>
          )}

          {loading && (
            <div className="loading-spinner">
              <p>Loading...</p>
              {/* You can add a loading spinner here */}
            </div>
          )}

          {prediction && (
            <div className="prediction-result">
              <h2>Prediction Results:</h2>
              <p><strong>Freshness:</strong> {prediction.freshness}</p>
              <p><strong>Shelf Life:</strong> {prediction.shelf_life} days</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <h2>Error:</h2>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
