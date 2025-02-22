import gym
import numpy as np
import pymongo
import os
from stable_baselines3 import DQN

class FoodRecommendationEnv(gym.Env):
    def __init__(self, db_name, collection_name):
        super(FoodRecommendationEnv, self).__init__()
        
        # Connect to MongoDB
        try:
            client = pymongo.MongoClient(os.getenv("MONGO_URI", "mongodb+srv://tomzheng1012:feg0yDprkZh5Fewq@scanned-items.uug7q.mongodb.net/?retryWrites=true&w=majority&appName=scanned-items"))
            db = client[db_name]
            collection = db[collection_name]
            print("Successfully connected to MongoDB!")
            
            # Load food data from MongoDB
            self.food_data = list(collection.find({}, {"_id": 0}))
            self.num_products = len(self.food_data)
            print(f"Found {self.num_products} products in the database")
            
            # Print available items
            print("\nAvailable items:")
            for i, food in enumerate(self.food_data):
                print(f"{i}. {food.get('product_name', 'Unknown')} - Nutri-score: {food.get('nutri_score', 'N/A')}, Nova: {food.get('nova_group', 'N/A')}, Eco-score: {food.get('eco_score', 'N/A')}")
            
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise
        
        # Define the features we'll use
        self.features = ['nutri_score', 'nova_group', 'eco_score']
        
        # Observation: Nutri-Score, NOVA, Eco-Score
        self.observation_space = gym.spaces.Box(
            low=0, 
            high=5,  # Assuming max values for scores
            shape=(len(self.features),), 
            dtype=np.float32
        )
        
        # Action: Recommend a product (Discrete choices)
        self.action_space = gym.spaces.Discrete(self.num_products)
        
        self.current_food = None

    def _get_observation(self, food_item):
        # Convert food item dictionary to numpy array of features
        return np.array([
            float(food_item.get('nutri_score', 0)),
            float(food_item.get('nova_group', 0)),
            float(food_item.get('eco_score', 0))
        ], dtype=np.float32)

    def step(self, action):
        recommended_food = self.food_data[action]
        reward = self.calculate_reward(recommended_food)
        
        # Simple feedback: 1 for Yes, -1 for No (User Accepts/Rejects Recommendation)
        user_feedback = self.get_user_feedback(recommended_food)
        reward += user_feedback  # Adjust reward based on user feedback
        
        # Return observation as numpy array
        return self._get_observation(recommended_food), reward, False, {}

    def calculate_reward(self, recommended_food):
        # Example: Reward based on health improvement
        return (float(recommended_food.get('nutri_score', 0)) - float(self.current_food.get('nutri_score', 0))) - \
               (float(recommended_food.get('nova_group', 0)) - float(self.current_food.get('nova_group', 0))) + \
               (float(recommended_food.get('eco_score', 0)) - float(self.current_food.get('eco_score', 0)))

    def get_user_feedback(self, recommended_food):
        # Show recommendation details
        print(f"\nRecommended item: {recommended_food.get('product_name', 'Unknown')}")
        print(f"Nutri-score: {recommended_food.get('nutri_score', 'N/A')}")
        print(f"Nova group: {recommended_food.get('nova_group', 'N/A')}")
        print(f"Eco-score: {recommended_food.get('eco_score', 'N/A')}")
        
        # Get user feedback
        while True:
            user_input = input("Do you like this recommendation? (yes/no): ").strip().lower()
            if user_input in ['yes', 'no']:
                return 1 if user_input == "yes" else -1
            print("Please answer with 'yes' or 'no'")

    def reset(self):
        # Let user select their previously consumed item
        while True:
            try:
                print("\nPlease select the number of the item you previously consumed:")
                for i, food in enumerate(self.food_data):
                    print(f"{i}. {food.get('product_name', 'Unknown')}")
                
                selection = int(input("Enter the number: "))
                if 0 <= selection < self.num_products:
                    self.current_food = self.food_data[selection]
                    print(f"\nSelected: {self.current_food.get('product_name', 'Unknown')}")
                    break
                else:
                    print("Invalid selection. Please try again.")
            except ValueError:
                print("Please enter a valid number.")
        
        return self._get_observation(self.current_food)

# Only run training if this file is run directly
if __name__ == "__main__":
    # MongoDB connection details
    db_name = "food_products"
    collection_name = "products"

    # Create and train RL model
    env = FoodRecommendationEnv(db_name, collection_name)
    model = DQN("MlpPolicy", env, verbose=1)
    
    print("\nStarting training...")
    model.learn(total_timesteps=10000)
    print("Training completed!")
