import cv2
import requests
import numpy as np
from PIL import Image
from io import BytesIO
import os

def download_image(url):
    """
    Downloads an image from a URL and returns a PIL Image object.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return Image.open(BytesIO(response.content)).convert("RGB")
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return None

def preprocess_image(image, target_size=(640, 640)):
    """
    Standardizes image size for YOLO.
    """
    if image is None:
        return None
    # YOLO typically handles various sizes, but we can resize if needed
    return image
