import re

def normalize_title(title):
    """
    Normalizes a potential product title into a standard brand/model representation.
    This is extremely simplified for demonstration. In production, this would 
    use NER (Named Entity Recognition) models or extensive regex dictionaries.
    """
    title = title.lower()
    
    # Very basic rule-based normalizer for demonstration
    if 'rtx 3070' in title or 'rtx3070' in title:
        return {"brand": "Nvidia", "model": "RTX 3070", "category": "GPU"}
    if 'rtx 3080' in title or 'rtx3080' in title:
        return {"brand": "Nvidia", "model": "RTX 3080", "category": "GPU"}
    if 'macbook pro' in title and 'm1' in title:
        return {"brand": "Apple", "model": "MacBook Pro M1", "category": "Laptop"}
    if 'ps5' in title or 'playstation 5' in title:
        return {"brand": "Sony", "model": "PlayStation 5", "category": "Console"}
        
    return None
