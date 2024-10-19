

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import productsData from '../components/data.json'; // Adjust the path to your JSON file

const ImageUploadNew = () => {
  const [productImage, setProductImage] = useState(null);
  const [productPreview, setProductPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleProductImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const img = event.target.files[0];
      setProductImage(img);
      setProductPreview(URL.createObjectURL(img));
      setPrediction(null);
      setProductInfo(null);
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!productImage) {
      setError('Please select a product image before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('product_image', productImage);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/', { 
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred while processing the image.');
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
        (item) => item.name.toLowerCase().includes(data.freshness.toLowerCase())
      );

      setProductInfo(product || { name: 'Unknown', shelf_life_days: 'N/A', description: 'No description available.' });
      setLoading(false);
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
      setPrediction(null);
      setLoading(false);
    }
  };

  return (
    <div>
     <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Freshvision</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

      {/* Main content */}
      <div className="container mt-4">
        {/* Upload Section */}
        <h2 className="text-center mb-4">Upload Product Image</h2>
        <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
          <div className="form-group">
            <label htmlFor="productImage" className="font-weight-bold">Upload Product Image:</label>
            <input
              type="file"
              className="form-control-file mt-2"
              id="productImage"
              accept="image/*"
              onChange={handleProductImageChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary mt-3">Upload Image</button>
        </form>

        {/* Preview Image */}
        {productPreview && (
          <div className="mt-4 text-center">
            <h5>Product Preview:</h5>
            <img src={productPreview} alt="Product Preview" className="img-fluid" style={{ maxWidth: '300px' }} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger mt-3">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && <p className="mt-3 text-center">Loading...</p>}

        {/* Prediction Result */}
        {prediction && (
          <div className="mt-4">
            <h4 className="font-weight-bold">Prediction Result</h4>
            <ul className="list-group mt-3">
              <li className="list-group-item"><strong>Freshness:</strong> {prediction.freshness}</li>
              <li className="list-group-item"><strong>Shelf Life:</strong> {prediction.shelf_life}</li>
            </ul>
          </div>
        )}

        {/* Product Information */}
        {productInfo && (
          <div className="mt-4">
            <h4 className="font-weight-bold">Product Information</h4>
            <ul className="list-group mt-3">
              <li className="list-group-item"><strong>Name:</strong> {productInfo.name}</li>
              <li className="list-group-item"><strong>Shelf Life (Days):</strong> {productInfo.shelf_life_days}</li>
              <li className="list-group-item"><strong>Description:</strong> {productInfo.description}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadNew;

