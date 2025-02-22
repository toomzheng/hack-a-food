import gym
import numpy as np
import pymongo
import os
from stable_baselines3 import DQN
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class FoodRecommendationEnv(gym.Env):
    def __init__(self):
        super(FoodRecommendationEnv, self).__init__()
        
        # Define weights for different components
        self.weights = {
            'keyword_similarity': 0.5,  # 50% weight for keyword matching
            'nutri_score': 0.2,        # 20% weight for nutrition
            'nova_group': 0.15,        # 15% weight for processing level
            'eco_score': 0.15          # 15% weight for environmental impact
        }
        
        # Connect to MongoDB
        try:
            self.client = pymongo.MongoClient(os.getenv("MONGO_URI", "mongodb+srv://tomzheng1012:feg0yDprkZh5Fewq@scanned-items.uug7q.mongodb.net/?retryWrites=true&w=majority&appName=scanned-items"))
            self.db = self.client['food_products']
            
            # Get recommendation pool from openfoodproducts
            self.recommendation_collection = self.db['openfoodproducts']
            self.food_data = list(self.recommendation_collection.find({}, {"_id": 0}))
            self.num_products = len(self.food_data)
            print("Successfully connected to MongoDB!")
            print(f"Found {self.num_products} products in the recommendation pool")
            
            # Get user's scanned item from products collection
            self.user_collection = self.db['products']
            self.scanned_item = self.user_collection.find_one({}, {"_id": 0})
            if self.scanned_item:
                print("\nUser's scanned item:")
                print(f"Product: {self.scanned_item.get('product_name', 'Unknown')}")
                print(f"Keywords: {', '.join(self.scanned_item.get('_keywords', []))}")
                print(f"Nutri-score: {self.scanned_item.get('nutriscore_grade', self.scanned_item.get('nutrition_grade_fr', 'N/A'))}")
                print(f"Nova group: {self.scanned_item.get('nova_groups', 'N/A')}")
                print(f"Eco-score: {self.scanned_item.get('ecoscore_grade', 'N/A')}")
            else:
                raise Exception("No scanned item found in products collection")
            
            # Initialize TF-IDF vectorizer for keyword similarity
            all_keywords = [' '.join(item.get('_keywords', [])) for item in self.food_data]
            self.vectorizer = TfidfVectorizer()
            self.keyword_vectors = self.vectorizer.fit_transform(all_keywords)
            
        except Exception as e:
            print(f"Error with MongoDB: {e}")
            raise
        
        # Define the features we'll use (now includes keyword similarity)
        self.features = ['keyword_similarity', 'nutriscore_grade', 'nova_groups', 'ecoscore_grade']
        
        # Observation space now includes keyword similarity
        self.observation_space = gym.spaces.Box(
            low=0, 
            high=5,  # Assuming max values for scores
            shape=(len(self.features),), 
            dtype=np.float32
        )
        
        # Action: Recommend a product (Discrete choices)
        self.action_space = gym.spaces.Discrete(self.num_products)
        
        self.current_food = self.scanned_item  # Initialize with scanned item

    def calculate_keyword_similarity(self, food_item1, food_item2):
        """Calculate cosine similarity between two food items based on their keywords"""
        keywords1 = ' '.join(food_item1.get('_keywords', []))
        keywords2 = ' '.join(food_item2.get('_keywords', []))
        
        # Transform keywords to vectors
        vector1 = self.vectorizer.transform([keywords1])
        vector2 = self.vectorizer.transform([keywords2])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(vector1, vector2)[0][0]
        return similarity

    def _get_observation(self, food_item):
        # Helper function to safely convert to float
        def safe_float(value, default=0.0):
            try:
                if isinstance(value, (int, float)):
                    return float(value)
                if isinstance(value, str):
                    # Convert letter grades to numbers
                    grade_map = {'a': 5.0, 'b': 4.0, 'c': 3.0, 'd': 2.0, 'e': 1.0}
                    if value.lower() in grade_map:
                        return grade_map[value.lower()]
                    if value.replace('.', '').isdigit():
                        return float(value)
                return default
            except (ValueError, TypeError):
                return default

        # Calculate keyword similarity
        keyword_sim = self.calculate_keyword_similarity(self.current_food, food_item)
        
        # Get other scores
        nutri_score = safe_float(food_item.get('nutriscore_grade', food_item.get('nutrition_grade_fr', 0)))
        nova_group = safe_float(food_item.get('nova_groups', 0))
        eco_score = safe_float(food_item.get('ecoscore_grade', 0))
        
        return np.array([keyword_sim * 5, nutri_score, nova_group, eco_score], dtype=np.float32)

    def calculate_reward(self, recommended_food):
        # Helper function to safely convert to float
        def safe_float(value, default=0.0):
            try:
                if isinstance(value, (int, float)):
                    return float(value)
                if isinstance(value, str):
                    # Convert letter grades to numbers
                    grade_map = {'a': 5.0, 'b': 4.0, 'c': 3.0, 'd': 2.0, 'e': 1.0}
                    if value.lower() in grade_map:
                        return grade_map[value.lower()]
                    if value.replace('.', '').isdigit():
                        return float(value)
                return default
            except (ValueError, TypeError):
                return default

        # Calculate keyword similarity (scaled to 0-5 range)
        keyword_sim = self.calculate_keyword_similarity(self.current_food, recommended_food) * 5
        
        # Get scores for recommended food
        rec_nutri = safe_float(recommended_food.get('nutriscore_grade', recommended_food.get('nutrition_grade_fr', 0)))
        rec_nova = safe_float(recommended_food.get('nova_groups', 0))
        rec_eco = safe_float(recommended_food.get('ecoscore_grade', 0))
        
        # Get scores for current food
        cur_nutri = safe_float(self.current_food.get('nutriscore_grade', self.current_food.get('nutrition_grade_fr', 0)))
        cur_nova = safe_float(self.current_food.get('nova_groups', 0))
        cur_eco = safe_float(self.current_food.get('ecoscore_grade', 0))

        # Calculate weighted reward:
        # - keyword_similarity: higher is better (more similar products)
        # - nutri_score: higher is better (A=5, E=1)
        # - nova_group: lower is better (less processing)
        # - eco_score: higher is better (A=5, E=1)
        reward = (
            self.weights['keyword_similarity'] * keyword_sim +
            self.weights['nutri_score'] * (rec_nutri - cur_nutri) +
            self.weights['nova_group'] * (-1 * (rec_nova - cur_nova)) +  # Negative because lower NOVA is better
            self.weights['eco_score'] * (rec_eco - cur_eco)
        )
        
        return reward

    def get_user_feedback(self, recommended_food):
        # Show recommendation details
        print(f"\nRecommended item: {recommended_food.get('product_name', 'Unknown')}")
        print(f"Keywords: {', '.join(recommended_food.get('_keywords', []))}")
        print(f"Keyword similarity: {self.calculate_keyword_similarity(self.current_food, recommended_food):.2f}")
        print(f"Nutri-score: {recommended_food.get('nutriscore_grade', recommended_food.get('nutrition_grade_fr', 'N/A'))}")
        print(f"Nova group: {recommended_food.get('nova_groups', 'N/A')}")
        print(f"Eco-score: {recommended_food.get('ecoscore_grade', 'N/A')}")
        
        # Get user feedback
        while True:
            user_input = input("Do you like this recommendation? (yes/no): ").strip().lower()
            if user_input in ['yes', 'no']:
                return 1 if user_input == "yes" else -1
            print("Please answer with 'yes' or 'no'")

    def step(self, action):
        recommended_food = self.food_data[action]
        reward = self.calculate_reward(recommended_food)
        
        # Simple feedback: 1 for Yes, -1 for No (User Accepts/Rejects Recommendation)
        user_feedback = self.get_user_feedback(recommended_food)
        reward += user_feedback  # Adjust reward based on user feedback
        
        # Return observation as numpy array
        return self._get_observation(recommended_food), reward, False, {}

    def reset(self):
        # Always start with the user's scanned item
        return self._get_observation(self.current_food)

# Only run training if this file is run directly
if __name__ == "__main__":
    # Create and train RL model
    env = FoodRecommendationEnv()
    model = DQN("MlpPolicy", env, verbose=1)
    
    print("\nStarting training...")
    model.learn(total_timesteps=1000)
    print("Training completed!")
