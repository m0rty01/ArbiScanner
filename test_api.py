import requests
import json

# 1. Test Image Detection API
print("Testing Image Detection API...")
image_url = "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=640&auto=format&fit=crop"
try:
    img_resp = requests.post("http://localhost:8001/detect_objects", json={"image_urls": [image_url]})
    img_resp.raise_for_status()
    detections = img_resp.json().get("objects", [])
    print(f"Detected Objects: {detections}")
    labels = [obj['label'] for obj in detections]
except Exception as e:
    print(f"Image API Error: {e}")
    labels = []

# 2. Test ML Prediction API with the detected labels
print("\nTesting ML Prediction API with labels...")
payload = {
    "title": "Nvidia RTX 3070 GPU",
    "description": "Used but good condition.",
    "objects_detected": []
}
try:
    ml_resp = requests.post("http://localhost:8000/predict", json=payload)
    ml_resp.raise_for_status()
    resp_data = ml_resp.json()
    print(f"Predicted Price: ${resp_data.get('predicted_price')}")
    print(f"Historical Pricing: {json.dumps(resp_data.get('historical_pricing'), indent=2)}")
except Exception as e:
    print(f"ML API Error: {e}")
