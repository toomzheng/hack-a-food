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
            'name_similarity': 0.6,
            'keyword_similarity': 0.4
        }
        
        try:
            # Connect to MongoDB
            self.client = pymongo.MongoClient(os.getenv("MONGO_URI", "mongodb+srv://tomzheng1012:feg0yDprkZh5Fewq@scanned-items.uug7q.mongodb.net/?retryWrites=true&w=majority&appName=scanned-items"))
            self.db = self.client['food_products']
            
            # First, just get all products with names and keywords
            self.food_data = list(self.db['openfoodproducts'].find(
                {
                    "product_name": {"$exists": True},
                    "_keywords": {"$exists": True},
                },
                {
                    "product_name": 1,
                    "_keywords": 1,
                    "nutriscore_grade": 1,
                    "url": 1,
                    "image_url": 1,
                    "code": 1,
                    "_id": 1
                }
            ))
            
            print(f"Initial products found: {len(self.food_data)}")
            
            # Debug: Print a sample product with all fields
            if len(self.food_data) > 0:
                print("\nSample product fields:")
                sample = self.food_data[0]
                print(f"Fields available: {list(sample.keys())}")
                print(f"Image URL: {sample.get('image_url', 'Not found')}")
            
            # Filter for valid products
            self.food_data = [
                item for item in self.food_data
                if self._is_valid_product(item)
            ]
            
            if len(self.food_data) == 0:
                raise ValueError("No valid products found after filtering")
                
            print(f"Valid products after filtering: {len(self.food_data)}")
            
            # Debug: Print some sample data
            print("\nSample product:")
            sample = self.food_data[0]
            print(f"Name: {sample['product_name']}")
            print(f"Keywords: {sample['_keywords']}")
            
            # Prepare text for vectorization
            product_names = []
            product_keywords = []
            
            for item in self.food_data:
                name = str(item['product_name']).lower().strip()
                keywords = ' '.join(str(k).lower().strip() for k in item['_keywords'])
                
                if name and keywords:  # Only add if both have content
                    product_names.append(name)
                    product_keywords.append(keywords)
            
            if not product_names or not product_keywords:
                raise ValueError("No valid text data for vectorization")
                
            print(f"\nProducts with valid text: {len(product_names)}")
            
            # Initialize and fit vectorizers
            self.name_vectorizer = TfidfVectorizer(
                analyzer='char_wb',
                ngram_range=(1, 3),
                max_features=5000,
                min_df=1,
                stop_words=None
            )
            
            self.keyword_vectorizer = TfidfVectorizer(
                analyzer='word',
                ngram_range=(1, 2),
                max_features=5000,
                min_df=1,
                stop_words=None  # Don't use stop words to preserve all keywords
            )
            
            # Compute TF-IDF matrices
            self.name_matrix = self.name_vectorizer.fit_transform(product_names)
            self.keyword_matrix = self.keyword_vectorizer.fit_transform(product_keywords)
            
            print("\nVectorization completed!")
            print(f"Name vocabulary size: {len(self.name_vectorizer.vocabulary_)}")
            print(f"Keyword vocabulary size: {len(self.keyword_vectorizer.vocabulary_)}")
            
        except Exception as e:
            print(f"Error initializing recommender: {e}")
            raise

    def _is_valid_product(self, item: Dict) -> bool:
        """Check if a product has valid data"""
        try:
            # Check if required fields exist
            if not item.get('product_name') or not item.get('_keywords'):
                return False
            
            # Clean and validate product name
            name = str(item['product_name']).lower().strip()
            if not name or 'n/a' in name or 'unknown' in name:
                return False
            
            # Clean and validate keywords
            keywords = item['_keywords']
            if not isinstance(keywords, list) or not keywords:
                return False
            
            # Clean keywords and remove empty ones
            valid_keywords = [
                str(k).strip() for k in keywords
                if str(k).strip() and 'n/a' not in str(k).lower() and 'unknown' not in str(k).lower()
            ]
            
            if not valid_keywords:
                return False
            
            # Update item with cleaned keywords
            item['_keywords'] = valid_keywords
            
            return True
            
        except Exception:
            return False

    def get_random_product(self) -> Dict:
        """Get a random product from the database"""
        return random.choice(self.food_data)

    def find_similar_products(self, product: Dict, top_k: int = 5) -> List[Tuple[float, Dict]]:
        """Find similar products based on name and keyword similarity"""
        try:
            # Clean and prepare query text
            query_name = str(product['product_name']).lower().strip()
            query_keywords = ' '.join(str(k).lower().strip() for k in product['_keywords'])
            
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
    if 'nutriscore_grade' in product:
        print(f"Nutriscore: {product['nutriscore_grade'].upper()}")
    if 'url' in product:
        print(f"URL: {product['url']}")
    if 'image_url' in product:
        print(f"Image URL: {product['image_url']}")
    if 'code' in product:
        print(f"Code: {product['code']}")
    
    # Get recommendations
    print("\nTop Similar Products:")
    similar_products = recommender.find_similar_products(product)
    
    for rank, (score, item) in enumerate(similar_products, 1):
        print(f"\n{rank}. Similarity Score: {score:.3f}")
        print(f"Name: {item['product_name']}")
        print(f"Keywords: {', '.join(item['_keywords'])}")
        if 'nutriscore_grade' in item:
            print(f"Nutriscore: {item['nutriscore_grade'].upper()}")
        if 'url' in item:
            print(f"URL: {item['url']}")
        if 'image_url' in item:
            print(f"Image URL: {item['image_url']}")
        if 'code' in item:
            print(f"Code: {item['code']}")

if __name__ == "__main__":
    main()