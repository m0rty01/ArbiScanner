from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import sys
from fastapi.middleware.cors import CORSMiddleware

# Add parent directory to path to import scripts
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from preprocessing import normalize_text


app = FastAPI(title="Marketplace Price Prediction API")

# Enable CORS for the extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and vectorizer
model = None
vectorizer = None

from typing import List

class PredictionRequest(BaseModel):
    title: str
    description: str = ""
    objects_detected: List[str] = []

@app.on_event("startup")
def load_model():
    global model, vectorizer
    model_dir = os.path.join(os.path.dirname(__file__), '../model')
    model_path = os.path.join(model_dir, 'price_model.joblib')
    vectorizer_path = os.path.join(model_dir, 'tfidf_vectorizer.joblib')
    
    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        print("Model and vectorizer loaded successfully.")
    else:
        print("Warning: Model or vectorizer not found. Prediction will fail.")

from pricing_intelligence.product_normalizer import normalize_title
from pricing_intelligence.pricing_analytics import get_pricing_metrics

@app.post("/predict")
async def predict(request: PredictionRequest):
    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please train the model first.")
    
    # Text normalization for ML Model
    obj_text = " ".join(request.objects_detected)
    combined_raw = request.title + " " + request.description + " " + obj_text
    
    # Look up pricing intelligence
    normalized_prod = normalize_title(combined_raw)
    pricing_data = {"historical_avg_price": None, "historical_median_price": None, "recent_price_trend": "unknown"}
    
    if normalized_prod:
        # We need the product_id to get metrics. Let's find it.
        import sqlite3
        from pricing_intelligence.pricing_database import DB_PATH
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT product_id FROM products WHERE brand=? AND model=?', 
                       (normalized_prod['brand'], normalized_prod['model']))
        res = cursor.fetchone()
        conn.close()
        
        if res:
            pricing_data = get_pricing_metrics(res[0])

    # ML Inference (Text + Objects -> TF-IDF -> Model)
    # *Note: Phase 8 requested historical pricing as input to the model. 
    # To truly do that, we need a Pipeline with ColumnTransformer (TF-IDF + Numeric).
    # Since we don't have historical data in the raw listings dataset right now,
    # appending the historical price directly to the response allows the extension
    # to use it as a powerful override or confidence booster in `dealDetector.js`
    # without breaking the existing dataset structure.
    # Alternatively, we append it to the text. Let's append to text for the ML model to learn it natively.
    
    textstr = normalize_text(combined_raw)
    if pricing_data["historical_avg_price"]:
        textstr += f" historical_avg_price_{int(pricing_data['historical_avg_price'])}"
        
    features = vectorizer.transform([textstr])
    prediction = model.predict(features)[0]
    
    return {
        "predicted_price": round(float(prediction), 2),
        "historical_pricing": pricing_data
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
