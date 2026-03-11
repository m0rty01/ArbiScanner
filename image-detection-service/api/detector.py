from ultralytics import YOLO
import os

class ObjectDetector:
    def __init__(self, model_name='yolov8n.pt'):
        """
        Initializes the YOLO model. 
        Note: yolov8n.pt is the nano version, which is fastest.
        """
        # Ensure model weights are stored in the service's models directory
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', model_name)
        self.model = YOLO(model_name) # Will download automatically if not found
        
    def detect(self, image, confidence_threshold=0.70):
        """
        Runs object detection on a PIL image.
        """
        results = self.model(image, stream=True)
        detected_objects = []
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Confidence score
                confidence = float(box.conf[0])
                if confidence >= confidence_threshold:
                    # Class ID and Label
                    class_id = int(box.cls[0])
                    label = result.names[class_id]
                    
                    detected_objects.append({
                        "label": label,
                        "confidence": round(confidence, 2)
                    })
        
        return detected_objects
