# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define image dimensions
IMG_HEIGHT, IMG_WIDTH = 150, 150

# Load your trained models
# Replace 'freshness_model.h5' and 'shelf_life_model.h5' with your actual model filenames
freshness_model = load_model('freshness_model.h5')
shelf_life_model = load_model('shelf_life_model.h5')

# Class indices for freshness
freshness_class_indices = {
    0: 'Fresh Apples', 1: 'Fresh Banana', 2: 'Fresh Bitter Gourd', 3: 'Fresh Capsicum',
    4: 'Fresh Cucumber', 5: 'Fresh Okra', 6: 'Fresh Oranges', 7: 'Fresh Potato',
    8: 'Fresh Tomato', 9: 'Rotten Apples', 10: 'Rotten Banana', 11: 'Rotten Bitter Gourd',
    12: 'Rotten Capsicum', 13: 'Rotten Cucumber', 14: 'Rotten Okra', 15: 'Rotten Oranges',
    16: 'Rotten Potato', 17: 'Rotten Tomato'
}

# Shelf life mapping
shelf_life_class_days = {
    0: 5,   
    1: 14,   
    2: 10,
    3: 5,    
    4: 15,
    5: 20,
    6: 10,
    7: 2,    
    8: 4,
    9: 6,    
    10: 0,   
    11: 5,   
    12: 15,  
    13: 10   
}

# Ensure the uploads directory exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def prepare_image(file_path):
    """Load and preprocess the image."""
    img = image.load_img(file_path, target_size=(IMG_HEIGHT, IMG_WIDTH))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Normalize to [0,1]
    return img_array

@app.route('/', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Prepare the image for prediction
        prepared_image = prepare_image(file_path)

        # Predict freshness
        freshness_prediction = freshness_model.predict(prepared_image)
        freshness_class = np.argmax(freshness_prediction, axis=-1)[0]

        # Predict shelf life
        shelf_life_prediction = shelf_life_model.predict(prepared_image)
        shelf_life_class = np.argmax(shelf_life_prediction, axis=-1)[0]

        # Clean up the uploaded file
        os.remove(file_path)

        # Prepare the response
        response = {
            "freshness": freshness_class_indices.get(freshness_class, "Unknown"),
            "shelf_life": shelf_life_class_days.get(shelf_life_class, "Unknown")
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


