# ArbiScanner (formerly Marketplace Deal Scanner)

ArbiScanner is a highly sophisticated, multi-modal market intelligence engine and browser extension designed to discover, valuate, and alert users to arbitrage opportunities on Facebook Marketplace in real-time. 

Built across 8 development phases, ArbiScanner evolved from a simple DOM-scraping extension into a complex system that uses Machine Learning (ML) to estimate actual market values, Computer Vision (YOLOv8) to see past poor text descriptions, and Historical Pricing databases to anchor predictions.

## Features

### 1. Automated Extraction & Background Monitoring
- Runs seamlessly on `https://www.facebook.com/marketplace/*`.
- Automatically parses Marketplace listing cards (Title, Price, Image, Location).
- Rotates through customizable search URLs automatically querying for new items.
- Uses `MutationObserver` to instantly catch new listings as Facebook's feed dynamically loads.

### 2. Multi-Modal Valuation Engine
ArbiScanner doesn't just read words; it sees the product and researches its true value.
- **Natural Language Processing**: Uses a trained `scikit-learn` TF-IDF Vectorizer and Random Forest model to digest the listing title and description.
- **Image Intelligence (Phase 7)**: A local FastAPI Microservice runs `YOLOv8` to analyze the main listing photo. If a seller lists "Box of old stuff" but the photo clearly shows a "laptop", the vision engine detects the laptop, injects that label into the text features, and forces the ML model to valuate it as a laptop.
- **Historical Pricing Anchors (Phase 8)**: Sellers ask for hopes and dreams; buyers pay market value. ArbiScanner normalizes the item's identity, queries a local database of *actual completed sales* (analogous to eBay sold listings), and calculates the real-world median price and market trend to anchor its predictions.

### 3. Real-Time Alerting
When the projected Fair Market Value exceeds the seller's asking price by a configured threshold (e.g., $150 potential profit), the system:
1. Highlights the card in bright green on your actual browser screen.
2. Injects a UI tooltip displaying the estimated value, predicted profit margin, the YOLO objects detected, and the historical eBay average.
3. Fires an immediate webhook payload to Slack, Discord, or Telegram with a direct link so you can message the seller before anyone else.

## System Architecture

The project is split into three main components:

### A. The Browser Extension (`/marketplace-extension`)
The eyes and ears of the operation.
- **Tech Stack**: Vanilla Javascript, Chrome Extension Manifest V3.
- **Key Files**: 
  - `content.js`: Observes the DOM.
  - `dealDetector.js`: Orchestrates the valuation logic between the local rules and the backend ML APIs.
  - `background.js`: Handles webhook alerting and persistent data storage.
  
### B. ML Prediction Service (`/ml-prediction-service`)
The brain of the operation.
- **Tech Stack**: Python, FastAPI, scikit-learn, joblib, SQLite.
- **Key Modules**:
  - `api/main.py`: The `POST /predict` endpoint that receives unified listing objects from the extension.
  - `training/train_model.py`: Pipeline for retraining the Random Forest regressor on newly scraped raw JSON datasets.
  - `pricing_intelligence/`: Houses the Phase 8 historical database (`pricing_database.py`), product normalizer algorithms, and the `price_collector.py` job.

### C. Image Intelligence Service (`/image-detection-service`)
The visual cortex.
- **Tech Stack**: Python, FastAPI, PyTorch, Ultralytics (YOLOv8), OpenCV.
- **Key Modules**:
  - `api/main.py`: The `POST /detect_objects` endpoint that accepts an image URL, downloads it, runs inference, and returns recognized labels (e.g. `['laptop', 'cellphone']`) above a 0.70 confidence threshold.

## Installation & Setup

Because ArbiScanner uses local GPU/CPU resources to avoid API costs, you need to run the backend services locally alongside the Chrome Extension.

### 1. Start the Machine Learning Service
```bash
cd ml-prediction-service
pip install -r requirements.txt
# (Optional) Retrain the model if you have new data
# python3 training/train_model.py
python3 api/main.py
```
*Runs on `http://localhost:8000`*

### 2. Start the Image Intelligence Service
```bash
cd image-detection-service
pip install -r requirements.txt
python3 api/main.py
```
*Runs on `http://localhost:8001`*

### 3. Load the Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked** and select the `marketplace-extension` folder.
4. Click the ArbiScanner icon in your toolbar and open **Options**.
5. Enable ML predictions, configure your search URLs, and paste your Discord/Telegram webhooks.

## Development History
- **Phase 1-3**: Core DOM scraping, Keyword Dictionaries, and Webhook notification loops.
- **Phase 4**: IndexedDB local storage implementations for bulk data collection.
- **Phase 5-6**: `scikit-learn` model training scripts and extension integrations.
- **Phase 7**: YOLOv8 Vision pipeline integrated to catch badly titled listings.
- **Phase 8**: Historical Pricing normalizers and SQLite analytics.

*Built for educational and research purposes.*
