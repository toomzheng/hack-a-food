import pymongo
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random
from typing import List, Dict, Tuple

class FoodRecommender:
    def __init__(self):
        # Weights for scoring
        self.weights = {
            'name_similarity': 0.5,    # Higher weight for name matching
            'keyword_similarity': 0.5   # Lower weight for keyword matching
        }
        
        # Connect to MongoDB and get products
        try:
            self.client = pymongo.MongoClient(os.getenv("MONGO_URI", "mongodb+srv://tomzheng1012:feg0yDprkZh5Fewq@scanned-items.uug7q.mongodb.net/?retryWrites=true&w=majority&appName=scanned-items"))
            self.db = self.client['food_products']
            self.food_data = list(self.db['openfoodproducts'].find(
                {
                    "product_name": {"$exists": True, "$ne": ""},
                    "_keywords": {"$exists": True, "$ne": []}
                },
                {
                    "product_name": 1,
                    "_keywords": 1,
                    "nutriscore_grade": 1,
                    "url": 1,
                    "_id": 0
                }
            ))
            
            # Filter out invalid products
            self.food_data = [
                item for item in self.food_data
                if self._is_valid_product(item)
            ]
            
            print(f"Loaded {len(self.food_data)} valid products")
            
            # Initialize vectorizers
            self.name_vectorizer = TfidfVectorizer(
                ngram_range=(1, 3),
                max_features=5000,
                analyzer='char_wb',  # Better for product names
                stop_words=None
            )
            
            self.keyword_vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=5000,
                stop_words='english'
            )
            
            # Prepare text for vectorization
            product_names = [str(item['product_name']).lower() for item in self.food_data]
            product_keywords = [' '.join(item['_keywords']).lower() for item in self.food_data]
            
            # Compute TF-IDF matrices
            self.name_matrix = self.name_vectorizer.fit_transform(product_names)
            self.keyword_matrix = self.keyword_vectorizer.fit_transform(product_keywords)
            
            print("Vectorization completed!")
            
        except Exception as e:
            print(f"Error initializing recommender: {e}")
            raise

    def _is_valid_product(self, item: Dict) -> bool:
        """Check if a product has valid data"""
        if not item.get('product_name') or not item.get('_keywords'):
            return False
            
        name = str(item['product_name']).lower()
        return (
            len(name) > 0 and
            'n/a' not in name and 
            'unknown' not in name and
            isinstance(item['_keywords'], list) and
            len(item['_keywords']) > 0
        )

    def get_random_product(self) -> Dict:
        """Get a random product from the database"""
        return random.choice(self.food_data)

    def find_similar_products(self, product: Dict, top_k: int = 5) -> List[Tuple[float, Dict]]:
        """Find similar products based on name and keyword similarity"""
        try:
            # Get product name and keywords
            query_name = str(product['product_name']).lower()
            query_keywords = ' '.join(product['_keywords']).lower()
            
            # Transform query
            query_name_vector = self.name_vectorizer.transform([query_name])
            query_keyword_vector = self.keyword_vectorizer.transform([query_keywords])
            
            # Calculate similarities
            name_similarities = cosine_similarity(query_name_vector, self.name_matrix)[0]
            keyword_similarities = cosine_similarity(query_keyword_vector, self.keyword_matrix)[0]
            
            # Combine scores with weights
            final_scores = (
                self.weights['name_similarity'] * name_similarities +
                self.weights['keyword_similarity'] * keyword_similarities
            )
            
            # Get top K similar products
            similar_products = []
            for idx in np.argsort(final_scores)[::-1]:
                if len(similar_products) >= top_k:
                    break
                    
                # Skip the query product itself
                if self.food_data[idx] == product:
                    continue
                    
                similar_products.append((final_scores[idx], self.food_data[idx]))
            
            return similar_products
            
        except Exception as e:
            print(f"Error finding similar products: {e}")
            return []

def main():
    # Initialize recommender
    recommender = FoodRecommender()
    
    # Get a random product
    product = recommender.get_random_product()
    
    print("\nSelected Random Product:")
    print(f"Name: {product['product_name']}")
    print(f"Keywords: {', '.join(product['_keywords'])}")
    print(f"Nutriscore: {product.get('nutriscore_grade', '').upper()}")
    print(f"URL: {product.get('url', '')}")
    
    # Get recommendations
    print("\nTop Similar Products:")
    similar_products = recommender.find_similar_products(product)
    
    for rank, (score, item) in enumerate(similar_products, 1):
        print(f"\n{rank}. Similarity Score: {score:.3f}")
        print(f"Name: {item['product_name']}")
        print(f"Keywords: {', '.join(item['_keywords'])}")
        print(f"Nutriscore: {item.get('nutriscore_grade', '').upper()}")
        print(f"URL: {item.get('url', '')}")

if __name__ == "__main__":
    main()