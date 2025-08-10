# **FreshVision – A Real-time Food Quality Assessment System**  
*(Flipkart Hackathon Project)*

**FreshVision** is a machine learning–powered system for detecting the freshness and predicting the shelf life of fresh produce such as fruits, vegetables, and other perishable food items. It uses **image processing, CNN models, and OCR** to provide users with accurate freshness levels and remaining shelf life estimates.

---

## **Live Demo**
🎥 [Watch Demo Video](https://www.youtube.com/watch?v=Dng16AcHYEw)

---

## **Problem Statement**
Develop a model that detects the freshness of perishable items (fruits, vegetables, bread, etc.) by analyzing visual cues and patterns. The system should predict **remaining shelf life** and help users make informed decisions, ultimately reducing food waste.

---

## **Proposed System**
- Users can **upload images** of produce.
- The system uses a **CNN-based ML model** to:
  - Assess **freshness levels**.
  - Predict **remaining shelf life**.
- **OCR functionality** extracts details from product labels (e.g., name, expiry date).
- Users can **input storage temperature** to improve prediction accuracy.
- A **React.js web interface** displays:
  - Freshness level.
  - Estimated shelf life.
  - Extracted label data.
- A **Flask backend** handles ML model requests and returns predictions in real time.

---

## **Tech Stack**
**Machine Learning & Data Processing**
- Python
- Pandas
- NumPy
- OpenCV
- TensorFlow / Keras
- OCR (Tesseract)
- Scikit-learn
- Matplotlib & Seaborn (data visualization)

**Frontend**
- React.js

**Backend**
- Flask (serving ML model endpoints)
- REST API

**Other Tools**
- Git & GitHub
- Jupyter Notebook (model development)

---

## **Model**
![Screenshot (341)](https://github.com/user-attachments/assets/3dc1ff49-3c74-4da8-828a-67de5da9c8df)
![Screenshot (130)](https://github.com/user-attachments/assets/931d56c7-cc7d-4661-81e8-6624ca2e7d11)
![Screenshot (131)](https://github.com/user-attachments/assets/133eeca5-ff2a-4acb-b219-101273a739fa)
![Screenshot (132)](https://github.com/user-attachments/assets/a799cbff-64d0-4620-a25c-af9c3110ff29)
![Screenshot (133)](https://github.com/user-attachments/assets/546193a8-4af0-4de4-880d-530bb741067d)
![Screenshot (134)](https://github.com/user-attachments/assets/f8e06663-229c-49f0-8266-a020e31a1da5)
![Screenshot (135)](https://github.com/user-attachments/assets/77a7d19c-f6d9-458a-bfd4-14dcfa49fecb)
![Screenshot (136)](https://github.com/user-attachments/assets/f14d8deb-1d08-4747-9935-ce7e910208d2)
![Screenshot (136)](https://github.com/user-attachments/assets/35a37d9e-4a52-4062-9d42-a9e8932f3fe0)
![Screenshot (183)](https://github.com/user-attachments/assets/358aff62-1d55-4856-83e7-1fd5d8100fd6)
![Screenshot (184)](https://github.com/user-attachments/assets/cf5c3dbb-47c8-43cf-8138-06fa10f61fff)

---

## **Website**
![Screenshot 2024-10-20 115607](https://github.com/user-attachments/assets/e54fccc0-12d7-4ba2-a531-0e6ecb59f6a3)
![Screenshot 2024-10-20 115520](https://github.com/user-attachments/assets/f4ac30da-12f6-4295-bb2b-1d1500c24b74)
![Screenshot 2024-10-20 115402](https://github.com/user-attachments/assets/b17c2291-daed-48dc-93b7-052d4ea764e5)
![Screenshot 2024-10-20 115414](https://github.com/user-attachments/assets/f47015d4-bf66-42ad-ba31-4aef58e0b188)
![Screenshot 2024-10-20 115318](https://github.com/user-attachments/assets/4896df39-cb87-4402-8dc7-b6a7af25edf5)
![Screenshot 2024-10-20 115333](https://github.com/user-attachments/assets/b7517a6f-060b-425c-90b0-2c022bf79e41)

---

## **Future Enhancements**
- Deploy the ML model to a cloud-based API for wider accessibility.
- Add mobile app support for on-the-go freshness detection.
- Improve OCR accuracy for a variety of label formats.
- Integrate AI-based personalized storage tips for each product.

