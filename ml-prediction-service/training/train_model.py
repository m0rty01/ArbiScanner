import pandas as pd
import numpy as np
import joblib
import os
import sys
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Add parent directory to path to import scripts
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from preprocessing import preprocess_data


def train():
    dataset_path = os.path.join(os.path.dirname(__file__), '../dataset/listings.json')
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        return

    print("Loading data...")
    df = pd.read_json(dataset_path)
    
    print("Preprocessing data...")
    df = preprocess_data(df)
    
    if len(df) < 10:
        print("Error: Not enough data to train. Need at least 10 records.")
        return

    # Features and Target
    X_text = df['processed_text']
    y = df['price']

    # TF-IDF Vectorization
    print("Vectorizing text...")
    vectorizer = TfidfVectorizer(max_features=10000, stop_words='english', ngram_range=(1, 2))
    X = vectorizer.fit_transform(X_text)

    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Models to evaluate
    models = {
        "RandomForest": RandomForestRegressor(n_estimators=100, random_state=42),
        "GradientBoosting": GradientBoostingRegressor(random_state=42)
    }

    best_model = None
    best_mae = float('inf')
    best_name = ""

    print("Evaluating models...")
    for name, model in models.items():
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        mae = mean_absolute_error(y_test, predictions)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))
        print(f"{name} -> MAE: {mae:.2f}, RMSE: {rmse:.2f}")
        
        if mae < best_mae:
            best_mae = mae
            best_model = model
            best_name = name

    print(f"Selected Best Model: {best_name}")

    # Save best model and vectorizer
    model_dir = os.path.join(os.path.dirname(__file__), '../model')
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(best_model, os.path.join(model_dir, 'price_model.joblib'))
    joblib.dump(vectorizer, os.path.join(model_dir, 'tfidf_vectorizer.joblib'))
    print("Model and vectorizer saved to /model directory.")

if __name__ == "__main__":
    train()
