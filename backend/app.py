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

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
IMG_HEIGHT, IMG_WIDTH = 150, 150

freshness_model = load_model('freshness_model.h5')
shelf_life_model = load_model('shelf_life_model.h5')

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

shelf_life_adjustment = {
    'Fresh Apples': {
        'ideal_temp': 4,
        'adjustments': [
            {'min_temp': -10, 'max_temp': 3, 'multiplier': 1.1},
            {'min_temp': 4, 'max_temp': 10, 'multiplier': 1.0},
            {'min_temp': 11, 'max_temp': 20, 'multiplier': 0.9},
            {'min_temp': 21, 'max_temp': 50, 'multiplier': 0.8},
        ]
    },
    'Fresh Banana': {
        'ideal_temp': 13,
        'adjustments': [
            {'min_temp': 5, 'max_temp': 12, 'multiplier': 0.95},
            {'min_temp': 13, 'max_temp': 20, 'multiplier': 1.0},
            {'min_temp': 21, 'max_temp': 30, 'multiplier': 0.85},
            {'min_temp': 31, 'max_temp': 50, 'multiplier': 0.7},
        ]
    },
}

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def prepare_image(file_path):
    img = image.load_img(file_path, target_size=(IMG_HEIGHT, IMG_WIDTH))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    return img_array

def preprocess_ocr_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    kernel = np.ones((3,3), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    return dilated

def extract_date(text, pattern):
    match = re.search(pattern, text)
    if match:
        date_str = match.group(1).replace('O', '0').replace('o', '0')
        try:
            parsed_date = datetime.strptime(date_str, "%d%b%Y").date()
            return parsed_date.isoformat()
        except ValueError:
            return None
    return None

def extract_info_from_label(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return {"error": f"Unable to read image from {image_path}"}
    
    processed_image = preprocess_ocr_image(image)
    text = pytesseract.image_to_string(processed_image)

    expiry_date = extract_date(text, r'(?i)exp(?:iry)?\.?\s*date:?\s*([\dA-Za-z]+)')
    mfg_date = extract_date(text, r'(?i)mfg\.?\s*date:?\s*=?\s*([\dA-Za-z]+)')
    best_before = extract_date(text, r'(?i)best\s*before:?\s*([\dA-Za-z]+)')

    return {
        'expiry_date': expiry_date or "Not Found",
        'mfg_date': mfg_date or "Not Found",
        'best_before': best_before or "Not Found"
    }

def adjust_shelf_life(food_type, base_shelf_life, temperature):
    if food_type not in shelf_life_adjustment:
        return base_shelf_life

    adjustments = shelf_life_adjustment[food_type]['adjustments']
    for adjustment in adjustments:
        if adjustment['min_temp'] <= temperature <= adjustment['max_temp']:
            adjusted_life = base_shelf_life * adjustment['multiplier']
            return max(1, int(round(adjusted_life)))

    return base_shelf_life

@app.route('/', methods=['POST'])
def predict():
    try:
        if 'product_image' not in request.files or 'expiry_image' not in request.files:
            return jsonify({"error": "Both product_image and expiry_image files are required."}), 400

        product_file = request.files['product_image']
        expiry_file = request.files['expiry_image']

        if product_file.filename == '' or expiry_file.filename == '':
            return jsonify({"error": "Both files must have a valid filename."}), 400

        temperature = request.form.get('temperature')
        if temperature is None:
            return jsonify({"error": "Temperature is required."}), 400

        try:
            temperature = float(temperature)
        except ValueError:
            return jsonify({"error": "Temperature must be a number."}), 400

        product_path = os.path.join(UPLOAD_FOLDER, product_file.filename)
        expiry_path = os.path.join(UPLOAD_FOLDER, expiry_file.filename)
        product_file.save(product_path)
        expiry_file.save(expiry_path)

        prepared_image = prepare_image(product_path)

        freshness_prediction = freshness_model.predict(prepared_image)
        freshness_class = np.argmax(freshness_prediction, axis=-1)[0]
        food_type = freshness_class_indices.get(freshness_class, "Unknown")

        shelf_life_prediction = shelf_life_model.predict(prepared_image)
        shelf_life_class = np.argmax(shelf_life_prediction, axis=-1)[0]
        base_shelf_life = shelf_life_class_days.get(shelf_life_class, 0)

        adjusted_shelf_life = adjust_shelf_life(food_type, base_shelf_life, temperature)

        ocr_result = extract_info_from_label(expiry_path)

        os.remove(product_path)
        os.remove(expiry_path)

        response = {
            "freshness": food_type,
            "base_shelf_life": base_shelf_life,
            "adjusted_shelf_life": adjusted_shelf_life,
            "temperature": temperature,
            "ocr_data": ocr_result
        }

        if 'Rotten' in food_type:
            response['status'] = 'Wasted'
            response['status_color'] = 'red'
            adjusted_shelf_life = 0
        else:
            response['status'] = 'Fresh'
            adjusted_shelf_life = adjust_shelf_life(food_type, base_shelf_life, temperature)

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
