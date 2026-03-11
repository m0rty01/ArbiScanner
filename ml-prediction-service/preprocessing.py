import pandas as pd
import re
import string

def normalize_text(text):
    if not isinstance(text, str):
        return ""
    # Lowercase
    text = text.lower()
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def preprocess_data(df):
    """
    Cleans and prepares the listing dataframe for training.
    """
    # Drop records with missing prices
    df = df.dropna(subset=['price'])
    # Ensure price is numeric
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df = df.dropna(subset=['price'])
    
    # Combine title and description
    df['description'] = df['description'].fillna("")
    
    if 'objects_detected' in df.columns:
        df['objects_text'] = df['objects_detected'].apply(lambda x: " ".join(x) if isinstance(x, list) else str(x))
    else:
        df['objects_text'] = ""
        
    df['combined_text'] = df['title'] + " " + df['description'] + " " + df['objects_text']

    
    # Normalize combined text
    df['processed_text'] = df['combined_text'].apply(normalize_text)
    
    return df
