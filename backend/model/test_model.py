from stable_baselines3 import PPO
from model import FoodRecommendationEnv
import numpy as np
from typing import List, Dict, Tuple
import heapq
import random
from sklearn.metrics.pairwise import cosine_similarity

def find_similar_items(env: FoodRecommendationEnv, test_item: Dict, top_k: int = 5) -> List[Tuple[float, Dict]]:
    """Find similar items using name and keyword similarity"""
    if not test_item:
        return []
    
    # Get item name and keywords
    item_name = str(test_item.get('product_name', '')).lower()
    item_keywords = test_item.get('_keywords', [])
    
    # Skip if name is missing or contains N/A/Unknown
    if not item_name or 'n/a' in item_name.lower() or 'unknown' in item_name.lower():
        return []
    
    # Calculate name similarity
    name_vector = env.name_vectorizer.transform([item_name])
    name_similarities = cosine_similarity(name_vector, env.name_vectors)[0]
    
    # Calculate keyword similarity if keywords exist
    if item_keywords:
        keyword_text = ' '.join(item_keywords).lower()
        keyword_vector = env.keyword_vectorizer.transform([keyword_text])
        keyword_similarities = cosine_similarity(keyword_vector, env.keyword_vectors)[0]
    else:
        keyword_similarities = np.zeros_like(name_similarities)
    
    # Combine similarities with weights
    similarities = (
        env.weights['name_similarity'] * name_similarities +
        env.weights['keyword_similarity'] * keyword_similarities
    )
    
    # Find top similar items
    similar_items = []
    for idx, similarity in enumerate(similarities):
        item = env.food_data[idx]
        
        # Skip the test item itself
        if item == test_item:
            continue
            
        # Skip items with N/A or Unknown in name
        item_name = str(item.get('product_name', '')).lower()
        if not item_name or 'n/a' in item_name.lower() or 'unknown' in item_name.lower():
            continue
            
        # Skip items without keywords
        if not item.get('_keywords'):
            continue
        
        similar_items.append((similarity, item))
    
    # Return top-k items sorted by similarity
    return heapq.nlargest(top_k, similar_items, key=lambda x: x[0])

def test_model():
    """Test the food recommendation model"""
    # Create environment
    env = FoodRecommendationEnv()
    print(f"Loaded {len(env.food_data)} products")
    
    # Filter valid products (has name and keywords, no N/A/Unknown)
    valid_products = [
        item for item in env.food_data
        if item.get('product_name') 
        and item.get('_keywords')
        and 'n/a' not in str(item.get('product_name')).lower()
        and 'unknown' not in str(item.get('product_name')).lower()
    ]
    
    if not valid_products:
        print("No valid products found!")
        return
    
    print(f"Found {len(valid_products)} valid products")
    
    # Get random product
    test_item = random.choice(valid_products)
    
    print("\nSelected Random Product:")
    print(f"Name: {test_item.get('product_name')}")
    print(f"Keywords: {', '.join(test_item.get('_keywords', []))}")
    print(f"Nutriscore: {test_item.get('nutriscore_grade', '').upper()}")
    print(f"URL: {test_item.get('url', '')}")
    
    # Find similar items
    print("\nTop Similar Products:")
    similar_items = find_similar_items(env, test_item)
    
    for rank, (score, item) in enumerate(similar_items, 1):
        print(f"\n{rank}. Similarity Score: {score:.3f}")
        print(f"Name: {item.get('product_name')}")
        print(f"Keywords: {', '.join(item.get('_keywords', []))}")
        print(f"Nutriscore: {item.get('nutriscore_grade', '').upper()}")
        print(f"URL: {item.get('url', '')}")

if __name__ == "__main__":
    test_model()
