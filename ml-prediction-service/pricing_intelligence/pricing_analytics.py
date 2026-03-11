from pricing_intelligence.pricing_database import get_connection
import numpy as np

def get_pricing_metrics(product_id):
    """
    Computes average and median historical prices for a given normalized product.
    Returns: {"average_price": float, "median_price": float, "trend": str}
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT price FROM sales WHERE product_id = ? ORDER BY timestamp DESC LIMIT 50', (product_id,))
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return {
            "historical_avg_price": None,
            "historical_median_price": None,
            "recent_price_trend": "unknown"
        }
        
    prices = [row[0] for row in rows]
    avg_price = np.mean(prices)
    median_price = np.median(prices)
    
    # Simple trend calculation based on last 5 items vs all
    trend = "stable"
    if len(prices) >= 10:
        recent_avg = np.mean(prices[:5])
        if recent_avg > avg_price * 1.05:
            trend = "up"
        elif recent_avg < avg_price * 0.95:
            trend = "down"
            
    return {
        "historical_avg_price": round(float(avg_price), 2),
        "historical_median_price": round(float(median_price), 2),
        "recent_price_trend": trend
    }
