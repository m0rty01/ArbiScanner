# ArbiScanner - Phase 1

This browser extension automatically extracts and logs Facebook Marketplace listings to the developer console.

## Features
- **Automatic Extraction**: Captures listing title, price, location, image, and URL.
- **Dynamic Monitoring**: Uses `MutationObserver` to detect and process new listings as you scroll.
- **Deal Detection**: Automatically identifies high-value products being sold below market value.
- **Search Automation**: Automatically rotates through a list of saved Marketplace searches.
- **Instant Alerts**: Sends notifications to Telegram or Discord webhooks when a deal is found.
- **Data Collection**: Automatically stores all observed listings in a local IndexedDB database.
- **ML Price Prediction (Phase 5)**: Uses a data-driven Machine Learning model to estimate fair market value.
- **Data Export**: Export your historical listing data to JSON or CSV formats.
- **Duplicate Prevention**: Both listings and alerts are filtered to prevent spam.

## Installation
1. Open Google Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `marketplace-extension` folder.

## Machine Learning Setup
To use the advanced ML price prediction, you must run the local prediction API:
1. Navigate to the `ml-prediction-service` directory.
2. Install dependencies: `pip install -r requirements.txt`.
3. Train the model: `python3 training/train_model.py` (requires exported data).
4. Start the API: `python3 api/main.py`.
5. In the extension **Options**, enable **ML Price Prediction**.

## Image Intelligence Setup (Phase 7)
To enable visual scanning for poorly-described listings:
1. Navigate to the `image-detection-service` directory.
2. Install dependencies: `pip install -r requirements.txt` (This will install PyTorch & Ultralytics).
3. Start the Image API: `python3 api/main.py`.
4. In the extension **Options**, ensure the Image API endpoint is set (default: `http://localhost:8001/detect_objects`).




## Configuration
1. Right-click the extension icon and select **Options**.
2. Enter your **Marketplace Search URLs** (one per line).
3. Set your **Scan Interval** (default 2 minutes).
4. (Optional) Provide your **Telegram Bot Token** and **Chat ID**, or **Discord Webhook URL**.
5. Click **Save Settings**.

## Automation
Once configured, the extension will automatically refresh the Marketplace tab with a new search query every 2 minutes (or your custom interval). If a deal is found, you will receive a notification on your configured messaging platform.

## Usage
1. Navigate to [Facebook Marketplace](https://www.facebook.com/marketplace/).
2. Open the browser's developer console (`F12` or `Ctrl+Shift+I`).
3. As listings appear or as you scroll, they will be logged in JSON format.

## Troubleshooting
- If no listings are being logged, try refreshing the page.
- Facebook frequently updates their DOM structure; if extraction fails, selectors in `content.js` may need adjustment.
