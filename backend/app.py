

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import os
import cv2
import pytesseract
import re
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Image processing constants
IMG_HEIGHT, IMG_WIDTH = 150, 150

# Load models
freshness_model = load_model('freshness_model.h5')
shelf_life_model = load_model('shelf_life_model.h5')

# Class mappings
freshness_class_indices = {
    0: 'Fresh Apples', 1: 'Fresh Banana', 2: 'Fresh Bitter Gourd', 3: 'Fresh Capsicum',
    4: 'Fresh Cucumber', 5: 'Fresh Okra', 6: 'Fresh Oranges', 7: 'Fresh Potato',
    8: 'Fresh Tomato', 9: 'Rotten Apples', 10: 'Rotten Banana', 11: 'Rotten Bitter Gourd',
    12: 'Rotten Capsicum', 13: 'Rotten Cucumber', 14: 'Rotten Okra', 15: 'Rotten Oranges',
    16: 'Rotten Potato', 17: 'Rotten Tomato'
}

shelf_life_class_days = {
    0: 5, 1: 14, 2: 10, 3: 5, 4: 15,
    5: 20, 6: 10, 7: 2, 8: 4, 9: 6,
    10: 0, 11: 5, 12: 15, 13: 10
}

# Upload folder setup
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Helper functions
def prepare_image(file_path):
    img = image.load_img(file_path, target_size=(IMG_HEIGHT, IMG_WIDTH))
    img_array = image.img_to_array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

def preprocess_image(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Apply CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    # Apply Otsu's thresholding
    _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    # Dilate the image
    kernel = np.ones((3,3), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    return dilated

def extract_info_from_label(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return None
    
    processed_image = preprocess_image(image)
    text = pytesseract.image_to_string(processed_image)
    expiry_date = extract_date(text, r'(?i)exp(?:iry)?\.?\s*date:?\s*([\d\w]+)')
    mfg_date = extract_date(text, r'(?i)mfg\.?\s*date:?\s*=?\s*([\d\w]+)')
    best_before = extract_date(text, r'(?i)best\s*before:?\s*([\d\w]+)')
    
    return {
        'expiry_date': expiry_date,
        'mfg_date': mfg_date,
        'best_before': best_before
    }

def extract_date(text, pattern):
    match = re.search(pattern, text)
    if match:
        date_str = match.group(1)
        day = date_str[:2].replace('O', '0')
        month = date_str[2:-4]
        year = date_str[-4:]
        try:
            parsed_date = datetime.strptime(f"{day} {month} {year}", "%d %b %Y").date()
            return parsed_date
        except ValueError:
            pass
    return None

# API route for prediction
@app.route('/', methods=['POST'])
def predict():
    try:
        freshness_file = request.files['freshness_image']
        label_file = request.files['label_image']

        if freshness_file.filename == '' or label_file.filename == '':
            return jsonify({"error": "Both files must have a valid filename."}), 400

        freshness_path = os.path.join(UPLOAD_FOLDER, freshness_file.filename)
        label_path = os.path.join(UPLOAD_FOLDER, label_file.filename)

        freshness_file.save(freshness_path)
        label_file.save(label_path)

        prepared_image = prepare_image(freshness_path)

        freshness_prediction = freshness_model.predict(prepared_image)
        freshness_class = np.argmax(freshness_prediction, axis=-1)[0]
        food_type = freshness_class_indices.get(freshness_class, "Unknown")

        shelf_life_prediction = shelf_life_model.predict(prepared_image)
        shelf_life_class = np.argmax(shelf_life_prediction, axis=-1)[0]
        base_shelf_life = shelf_life_class_days.get(shelf_life_class, 0)

        # Perform OCR
        ocr_info = extract_info_from_label(label_path)

        os.remove(freshness_path)
        os.remove(label_path)

        response = {
            "freshness": food_type,
            "shelf_life": base_shelf_life,
            "ocr_info": ocr_info  # Include OCR information in the response
        }

        response['status'] = 'Wasted' if 'Rotten' in food_type else 'Fresh'
        response['status_color'] = 'red' if response['status'] == 'Wasted' else 'green'

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
