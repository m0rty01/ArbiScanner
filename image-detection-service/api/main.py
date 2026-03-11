from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
import sys

# Add parent directory to path to import local modules
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from detector import ObjectDetector
from image_loader import download_image

app = FastAPI(title="Marketplace Image Detection API")

# Initialize detector lazily
detector = None

class DetectionRequest(BaseModel):
    image_urls: List[str]

@app.on_event("startup")
def load_detector():
    global detector
    print("Loading YOLO model...")
    detector = ObjectDetector()
    print("YOLO model loaded successfully.")

@app.post("/detect_objects")
async def detect_objects(request: DetectionRequest):
    if detector is None:
        raise HTTPException(status_code=503, detail="Detector not initialized.")
    
    all_detections = []
    
    # We process up to 5 images as per PRD
    for url in request.image_urls[:5]:
        image = download_image(url)
        if image:
            detections = detector.detect(image)
            all_detections.extend(detections)
    
    # Remove duplicates but keep highest confidence
    unique_detections = {}
    for det in all_detections:
        label = det['label']
        if label not in unique_detections or det['confidence'] > unique_detections[label]['confidence']:
            unique_detections[label] = det
            
    return {"objects": list(unique_detections.values())}

@app.get("/health")
def health_check():
    return {"status": "ok", "detector_loaded": detector is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
