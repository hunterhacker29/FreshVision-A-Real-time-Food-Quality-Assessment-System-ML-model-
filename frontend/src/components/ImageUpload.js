import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import productsData from '../components/data.json'; // Adjust the path to your JSON file
import '../css/about.css'; // Import custom CSS for additional styles

const ImageUploadNew= () => {
  const [freshnessImage, setFreshnessImage] = useState(null);
  const [labelImage, setLabelImage] = useState(null);
  const [freshnessPreview, setFreshnessPreview] = useState(null);
  const [labelPreview, setLabelPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [ocrInfo, setOcrInfo] = useState(null); // State for OCR information
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFreshnessImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setFreshnessImage(img);
      setFreshnessPreview(URL.createObjectURL(img));
      setPrediction(null);
      setProductInfo(null);
      setOcrInfo(null); // Reset OCR info
      setError(null);
    }
  };

  const handleLabelImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setLabelImage(img);
      setLabelPreview(URL.createObjectURL(img));
      setPrediction(null);
      setProductInfo(null);
      setOcrInfo(null); // Reset OCR info
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!freshnessImage || !labelImage) {
      setError('Please select both freshness and label images before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('freshness_image', freshnessImage);
    formData.append('label_image', labelImage);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred while processing the images.');
        setPrediction(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setPrediction({
        freshness: data.freshness,
        shelf_life: data.shelf_life,
      });

      // Find product information based on freshness
      const product = productsData.products.find(
        (p) => p.name.toLowerCase() === data.freshness.toLowerCase()
      );

      if (product) {
        setProductInfo(product);
      }

      setOcrInfo(data.ocr_info); // Set the OCR info
    } catch (error) {
      setError('An error occurred while fetching the prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="about-container">
      <Navbar bg="light" variant="bright" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Freshness Detection System</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something else here</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h2 className="text-center text-white">Freshness Detection System</h2>
        <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow">
          <div className="mb-3">
            <label htmlFor="freshnessImageInput" className="form-label">Freshness Detection Image:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFreshnessImageChange} 
              className="form-control" 
              required 
            />
            {freshnessPreview && (
              <img 
                src={freshnessPreview} 
                alt="Freshness Preview" 
                className="img-thumbnail mt-2" 
                style={{ maxWidth: '300px' }} // Limit the size of the image
              />
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="labelImageInput" className="form-label">Label Image for OCR:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLabelImageChange} 
              className="form-control" 
              required 
            />
            {labelPreview && (
              <img 
                src={labelPreview} 
                alt="Label Preview" 
                className="img-thumbnail mt-2" 
                style={{ maxWidth: '300px' }} // Limit the size of the image
              />
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>

        {error && <p className="text-danger mt-3">{error}</p>}

        {prediction && (
          <div className="mt-4">
            <h3 className="text-white">Prediction Result:</h3>
            <div className="card bg-light text-dark" style={{ opacity: 0.8 }}> {/* Greyish transparent card */}
              <div className="card-body">
                <p><strong>Freshness:</strong> {prediction.freshness}</p>
                <p><strong>Shelf Life:</strong> {prediction.shelf_life} days</p>
                <hr /> {/* Horizontal line for separation */}
                <h4>Product Information:</h4>
                <p><strong>Name:</strong> {productInfo?.name}</p>
                <p><strong>Shelf Life (Days):</strong> {productInfo?.shelf_life_days}</p>
                <p><strong>Description:</strong> {productInfo?.description}</p>
                <hr /> {/* Horizontal line for separation */}
                {/* Display OCR information */}
                {ocrInfo ? (
                  <div>
                    <h4>OCR Information:</h4>
                    <p><strong>Expiry Date:</strong> {ocrInfo.expiry_date || 'N/A'}</p>
                 
                  </div>
                ) : (
                  <p className="text-muted">No OCR information available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ImageUploadNew;
