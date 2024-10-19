from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import os

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

# API route for prediction
@app.route('/', methods=['POST'])
def predict():
    try:
        product_file = request.files['product_image']

        if product_file.filename == '':
            return jsonify({"error": "Both files must have a valid filename."}), 400

        product_path = os.path.join(UPLOAD_FOLDER, product_file.filename)
        product_file.save(product_path)

        prepared_image = prepare_image(product_path)

        freshness_prediction = freshness_model.predict(prepared_image)
        freshness_class = np.argmax(freshness_prediction, axis=-1)[0]
        food_type = freshness_class_indices.get(freshness_class, "Unknown")

        shelf_life_prediction = shelf_life_model.predict(prepared_image)
        shelf_life_class = np.argmax(shelf_life_prediction, axis=-1)[0]
        base_shelf_life = shelf_life_class_days.get(shelf_life_class, 0)

        os.remove(product_path)

        response = {
            "freshness": food_type,
            "shelf_life": base_shelf_life,  # This is the updated key
        }

        if 'Rotten' in food_type:
            response['status'] = 'Wasted'
            response['status_color'] = 'red'
        else:
            response['status'] = 'Fresh'

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
