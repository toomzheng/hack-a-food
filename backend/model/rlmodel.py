import gym
import numpy as np
import pymongo
import os
from stable_baselines3 import PPO  # Using PPO instead of DQN for better performance
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
from typing import Dict, List

class FoodRecommendationEnv(gym.Env):
    def __init__(self):
        super(FoodRecommendationEnv, self).__init__()
        
        # Initialize RNG
        self.np_random = None
        
        # Weights for scoring
        self.weights = {
            'name_similarity': 0.4,    
            'keyword_similarity': 0.4,  
            'nutriscore': 0.2          
        }
        
        # Connect to MongoDB and get products
        try:
            self.client = pymongo.MongoClient(os.getenv("MONGO_URI", "mongodb+srv://tomzheng1012:feg0yDprkZh5Fewq@scanned-items.uug7q.mongodb.net/?retryWrites=true&w=majority&appName=scanned-items"))
            self.db = self.client['food_products']
            self.food_data = list(self.db['openfoodproducts'].find(
                {"product_name": {"$exists": True}, "nutriscore_grade": {"$exists": True}},
                {"product_name": 1, "nutriscore_grade": 1, "url": 1, "_keywords": 1, "_id": 0}
            ))
            
            if not self.food_data:
                raise ValueError("❌ No food data found! Check your MongoDB connection or query.")

            print(f"✅ Loaded {len(self.food_data)} valid products")
            
            # Initialize vectorizers
            self.name_vectorizer = TfidfVectorizer(
                ngram_range=(1, 3),
                max_features=5000,
                analyzer='char_wb'
            )
            
            self.keyword_vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=5000,
                stop_words='english'
            )
            
            # Precompute vectors
            self.name_vectors = self.name_vectorizer.fit_transform(
                [str(item.get('product_name', '')).lower() for item in self.food_data]
            )
            
            self.keyword_vectors = self.keyword_vectorizer.fit_transform(
                [' '.join(item.get('_keywords', [])).lower() for item in self.food_data]
            )
            
            print("✅ Vectorizers initialized successfully")
            
        except Exception as e:
            print(f"Database Error: {e}")
            raise
        
        # Define spaces
        self.observation_space = gym.spaces.Box(low=0, high=1, shape=(3,), dtype=np.float32)
        self.action_space = gym.spaces.Discrete(len(self.food_data))
        
        # Initialize state
        self.current_item = None
        self.current_item_idx = None
        self.recommended_indices = set()
        self.steps = 0
        self.max_steps = 10

    def _convert_nutriscore(self, score: str) -> float:
        score_map = {'a': 1.0, 'b': 0.75, 'c': 0.5, 'd': 0.25, 'e': 0.0}
        return score_map.get(str(score).lower(), 0.5)

    def step(self, action: int):
        self.steps += 1
        reward = self.calculate_reward(action)
        self.recommended_indices.add(action)

        name_sims, keyword_sims = self._calculate_similarities(self.food_data[action])
        nutriscore = self._convert_nutriscore(self.food_data[action].get('nutriscore_grade', 'c'))
        
        obs = np.array([
            float(name_sims.max()),
            float(keyword_sims.max()),
            float(nutriscore)
        ], dtype=np.float32)
        
        done = self.steps >= self.max_steps
        return obs, reward, done, False, {}

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        if seed is not None:
            self.np_random = np.random.default_rng(seed)
            
        self.steps = 0
        self.recommended_indices.clear()
        
        if self.current_item is None:
            self.current_item_idx = self.np_random.integers(len(self.food_data)) if self.np_random else np.random.randint(len(self.food_data))
            self.current_item = self.food_data[self.current_item_idx]
            
        name_sims, keyword_sims = self._calculate_similarities(self.current_item)
        nutriscore = self._convert_nutriscore(self.current_item.get('nutriscore_grade', 'c'))
        
        obs = np.array([
            float(name_sims.max()),
            float(keyword_sims.max()),
            float(nutriscore)
        ], dtype=np.float32)
        
        return obs, {}

if __name__ == "__main__":
    env = FoodRecommendationEnv()
    
    model = PPO(
        "MlpPolicy",
        env,
        verbose=1,
        learning_rate=3e-4,
        n_steps=2048,
        batch_size=64,
        n_epochs=10,
        gamma=0.95,
        policy_kwargs=dict(
            net_arch=[dict(pi=[256, 128], vf=[256, 128])],
            activation_fn=torch.nn.ReLU
        ),
        seed=42
    )
    
    print("Starting training...")
    model.learn(total_timesteps=100000)
    print("Training completed!")
    
    model.save("food_recommendation_model")
