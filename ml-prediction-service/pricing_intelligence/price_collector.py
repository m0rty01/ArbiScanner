import random
from datetime import datetime
from pricing_database import insert_product, insert_sale
from product_normalizer import normalize_title

class MockPriceCollector:
    """
    Simulates fetching 'sold' listings from a platform like eBay.
    """
    
    def __init__(self):
        self.mock_data = [
            {"title": "Nvidia RTX 3070", "base_price": 465, "variance": 30},
            {"title": "RTX 3080 Founders", "base_price": 600, "variance": 50},
            {"title": "PS5 Disk Edition", "base_price": 400, "variance": 40},
            {"title": "Macbook Pro M1", "base_price": 850, "variance": 80}
        ]
        
    def run_collection_job(self):
        print("Starting historical price collection job...")
        count = 0
        for item in self.mock_data:
            # 1. Normalize Product Identity
            normalized = normalize_title(item['title'])
            if not normalized:
                continue
                
            # 2. Add or Get Product ID
            # Assuming insert_product either inserts and returns new ID, or creates if not exist
            # Wait, the current implementation of insert_product doesn't return ID if it exists perfectly yet, 
            # let's write a safe get_or_create logic around it.
            product_id = self._get_or_create_product(normalized['brand'], normalized['model'], normalized['category'])
            
            # 3. Simulate grabbing 10 recent sales from eBay
            for _ in range(10):
                sale_price = item['base_price'] + random.randint(-item['variance'], item['variance'])
                insert_sale(
                    product_id=product_id,
                    price=sale_price,
                    condition="Used",
                    platform="eBay",
                    timestamp=datetime.now().isoformat()
                )
                count += 1
                
        print(f"Collection job finished. Added {count} new historical sale records.")

    def _get_or_create_product(self, brand, model, category):
        import sqlite3
        import os
        from pricing_database import DB_PATH
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT product_id FROM products WHERE brand = ? AND model = ?', (brand, model))
        res = cursor.fetchone()
        if res:
            conn.close()
            return res[0]
            
        import uuid
        product_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO products (product_id, brand, model, category)
            VALUES (?, ?, ?, ?)
        ''', (product_id, brand, model, category))
        conn.commit()
        conn.close()
        return product_id

if __name__ == "__main__":
    collector = MockPriceCollector()
    collector.run_collection_job()
