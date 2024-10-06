import cv2
import pytesseract
import re
from datetime import datetime
import numpy as np

def preprocess_image(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    # Apply Otsu's thresholding
    _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    
    # Dilate the image to make text thicker
    kernel = np.ones((3,3), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    
    return dilated

def extract_info_from_label(image_path):
    print(f"Attempting to read image from: {image_path}")
    image = cv2.imread(image_path)
    
    if image is None:
        print(f"Error: Unable to read image from {image_path}")
        return None
    
    print("Image read successfully. Shape:", image.shape)
    
    processed_image = preprocess_image(image)
    
    print("Performing OCR on preprocessed image...")
    text = pytesseract.image_to_string(processed_image)
    confidence = pytesseract.image_to_data(processed_image, output_type=pytesseract.Output.DICT)['conf']
    avg_confidence = np.mean([float(c) for c in confidence if c != '-1'])
    
    print(f"OCR Result (Confidence: {avg_confidence:.2f}):")
    print(text)
    
    expiry_date = extract_date(text, r'(?i)exp(?:iry)?\.?\s*date:?\s*([\d\w]+)')
    mfg_date = extract_date(text, r'(?i)mfg\.?\s*date:?\s*=?\s*([\d\w]+)')  # Updated pattern
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
        print(f"Found date string: {date_str}")
        # Custom parsing for the format in the image (e.g., 2OMAY2015)
        day = date_str[:2].replace('O', '0')  # Replace 'O' with '0' if present
        month = date_str[2:-4]
        year = date_str[-4:]
        try:
            parsed_date = datetime.strptime(f"{day} {month} {year}", "%d %b %Y").date()
            print(f"Successfully parsed date: {parsed_date}")
            return parsed_date
        except ValueError:
            print(f"Failed to parse date string: {date_str}")
    else:
        print(f"No match found for pattern: {pattern}")
    return None

if __name__ == "__main__":
    image_path = "/home/sharvil-palvekar/flipkart/images/qw.webp"
    result = extract_info_from_label(image_path)
    print("Extracted Information:")
    print(result)

    # Display the original image
    image = cv2.imread(image_path)
    cv2.imshow('Original Image', image)
    cv2.waitKey(0)
    
    # Display preprocessed image
    processed_image = preprocess_image(image)
    cv2.imshow('Preprocessed Image', processed_image)
    cv2.waitKey(0)
    
    cv2.destroyAllWindows()