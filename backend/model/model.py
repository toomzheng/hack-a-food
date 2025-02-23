import gym
import numpy as np
import pymongo
import os
import random
from stable_baselines3 import DQN
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

class FoodRecommendationEnv(gym.Env):
    def __init__(self):
        super(FoodRecommendationEnv, self).__init__()
        
        # Define weights for different components
        self.weights = {
            'keyword_similarity': 0.5,  # Increased weight for keyword matching
            'nutri_score': 0.3,        # Nutrition is important
            'nova_group': 0.1,         # Processing level less important
            'eco_score': 0.1           # Environmental impact less important
        }
        
        # Connect to MongoDB
        try:
            self.client = pymongo.MongoClient(os.getenv("MONGO_URI", "mongodb+srv://tomzheng1012:feg0yDprkZh5Fewq@scanned-items.uug7q.mongodb.net/?retryWrites=true&w=majority&appName=scanned-items"))
            self.db = self.client['food_products']
            
            # Get recommendation pool and cache it
            self.recommendation_collection = self.db['openfoodproducts']
            self.food_data = list(self.recommendation_collection.find({}, {"_id": 0}))
            self.num_products = len(self.food_data)
            print(f"Found {self.num_products} products in the recommendation pool")
            
            # Get user's scanned item and cache it
            self.user_collection = self.db['products']
            self.scanned_item = self.user_collection.find_one({}, {"_id": 0})
            if not self.scanned_item:
                raise Exception("No scanned item found in products collection")
            
            # Initialize TF-IDF vectorizer with better parameters for food items
            self.vectorizer = TfidfVectorizer(
                ngram_range=(1, 2),     # Use both unigrams and bigrams
                max_features=1000,      # Limit vocabulary size
                min_df=2,              # Minimum document frequency
                stop_words='english',   # Remove common English words
                analyzer='word',        # Analyze at word level
                token_pattern=r'[a-zA-Z0-9]+', # Include numbers in tokens
            )
            
            # Pre-compute keyword vectors for all items
            all_keywords = [self._prepare_text(item) for item in self.food_data]
            self.keyword_vectors = self.vectorizer.fit_transform(all_keywords)
            
            # Pre-compute scanned item vector
            self.scanned_text = self._prepare_text(self.scanned_item)
            self.scanned_vector = self.vectorizer.transform([self.scanned_text])
            
            # Cache for similarity scores
            self.similarity_cache = {}
            
        except Exception as e:
            print(f"Error with MongoDB: {e}")
            raise
        
        # Define the action and observation spaces
        self.features = ['keyword_similarity', 'nutriscore_grade', 'nova_groups', 'ecoscore_grade']
        self.observation_space = gym.spaces.Box(
            low=0, 
            high=1,  # Normalized to [0,1]
            shape=(len(self.features),),
            dtype=np.float32
        )
        self.action_space = gym.spaces.Discrete(self.num_products)
        
        self.current_food = self.scanned_item
        self.recommended_items = set()
        self.steps = 0
        self.max_steps = 20
        self.rng = np.random.default_rng()

    def seed(self, seed=None):
        """Set random seed for reproducibility"""
        self.rng = np.random.default_rng(seed)
        random.seed(seed)
        return [seed]

    def _prepare_text(self, item):
        """Prepare text for TF-IDF by combining relevant fields"""
        fields = ['product_name', 'brands', 'categories', '_keywords']
        text_parts = []
        for field in fields:
            value = item.get(field, '')
            if isinstance(value, list):
                value = ' '.join(value)
            text_parts.append(str(value).lower())
        return ' '.join(text_parts)

    def _convert_grade_to_number(self, grade):
        """Convert letter grades to numbers with better unknown handling"""
        if isinstance(grade, (int, float)):
            return float(grade)
        grade_map = {'a': 1.0, 'b': 0.8, 'c': 0.6, 'd': 0.4, 'e': 0.2}
        return grade_map.get(str(grade).lower(), 0.5)  # Unknown is middle ground

    def calculate_keyword_similarity(self, food_item):
        """Calculate cosine similarity using pre-computed vectors"""
        item_id = id(food_item)
        if item_id in self.similarity_cache:
            return self.similarity_cache[item_id]
        
        item_text = self._prepare_text(food_item)
        vector = self.vectorizer.transform([item_text])
        similarity = float(cosine_similarity(self.scanned_vector, vector)[0][0])
        self.similarity_cache[item_id] = similarity
        return similarity

    def _get_observation(self, food_item):
        """Get normalized observation vector"""
        # Calculate keyword similarity
        keyword_sim = self.calculate_keyword_similarity(food_item)
        
        # Get and normalize scores
        nutri_score = self._convert_grade_to_number(food_item.get('nutriscore_grade', food_item.get('nutrition_grade_fr', 'unknown')))
        nova_score = 1.0 - (float(food_item.get('nova_groups', 2)) / 4.0)  # Normalize NOVA score and invert (lower is better)
        eco_score = self._convert_grade_to_number(food_item.get('ecoscore_grade', 'unknown'))
        
        return np.array([
            keyword_sim,
            nutri_score,
            nova_score,
            eco_score
        ], dtype=np.float32)

    def calculate_reward(self, recommended_food):
        """Calculate reward with emphasis on similarity and nutrition"""
        obs = self._get_observation(recommended_food)
        
        # Calculate base reward
        reward = (
            self.weights['keyword_similarity'] * obs[0] +
            self.weights['nutri_score'] * obs[1] +
            self.weights['nova_group'] * obs[2] +
            self.weights['eco_score'] * obs[3]
        )
        
        # Add penalties
        if id(recommended_food) in self.recommended_items:
            reward -= 0.5  # Penalty for repeated recommendations
        
        if obs[0] < 0.1:  # If similarity is too low
            reward -= 0.3  # Penalty for irrelevant recommendations
        
        return reward

    def step(self, action):
        """Take a step in the environment"""
        self.steps += 1
        recommended_food = self.food_data[action]
        
        # Calculate reward
        reward = self.calculate_reward(recommended_food)
        
        # Add to recommended items
        self.recommended_items.add(id(recommended_food))
        
        # Check if episode should end
        done = self.steps >= self.max_steps
        
        return self._get_observation(recommended_food), reward, done, {}

    def reset(self):
        """Reset the environment"""
        self.steps = 0
        self.recommended_items.clear()
        return self._get_observation(self.current_food)

# Only run training if this file is run directly
if __name__ == "__main__":
    # Create environment and model with optimized parameters
    env = FoodRecommendationEnv()
    model = DQN(
        "MlpPolicy",
        env,
        verbose=1,
        learning_rate=3e-4,
        batch_size=128,
        buffer_size=10000,
        learning_starts=5000,
        target_update_interval=1000,
        train_freq=8,
        gradient_steps=4,
        exploration_fraction=0.3,
        exploration_final_eps=0.01,
        gamma=0.99,
        policy_kwargs=dict(net_arch=[256, 256]),
        seed=42
    )
    
    print("\nStarting training...")
    model.learn(total_timesteps=20000)
    print("Training completed!")
    
    # Save the trained model
    model.save("food_recommendation_model")