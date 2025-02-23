from stable_baselines3 import DQN
from model import FoodRecommendationEnv
import numpy as np
from heapq import nlargest

def test_model():
    # Create the environment
    env = FoodRecommendationEnv()
    
    # Load the trained model
    try:
        model = DQN.load("food_recommendation_model")
    except Exception as e:
        print(f"Error loading model: {e}")
        return
    
    # Get test items
    test_items = env.food_data[:5]  # Test with first 5 items
    
    for idx, test_item in enumerate(test_items):
        print(f"\n{'='*50}")
        print(f"Testing with Item #{idx + 1}:")
        print(f"Product: {test_item.get('product_name', 'Unknown')}")
        print(f"Keywords: {', '.join(test_item.get('_keywords', []))}")
        print(f"Nutri-score: {test_item.get('nutriscore_grade', test_item.get('nutrition_grade_fr', 'N/A'))}")
        print(f"Nova group: {test_item.get('nova_groups', 'N/A')}")
        print(f"Eco-score: {test_item.get('ecoscore_grade', 'N/A')}")
        
        # Set the current test item in environment
        env.current_food = test_item
        obs = env.reset()
        
        # Get predictions and rewards for all possible actions
        predictions = []
        for i in range(len(env.food_data)):
            if env.food_data[i] == test_item:  # Skip the test item itself
                continue
                
            # Get reward for this action
            temp_obs = obs.copy()
            _, reward, _, _ = env.step(i)
            env.reset()  # Reset after each prediction
            
            predictions.append({
                'action_idx': i,
                'reward': reward,
                'food': env.food_data[i]
            })
        
        # Get top 3 recommendations by reward
        print("\nTop 3 Recommendations (Best to Worst):")
        top_recommendations = nlargest(3, predictions, key=lambda x: x['reward'])
        
        for i, rec in enumerate(top_recommendations):
            recommended_food = rec['food']
            print(f"\nRecommendation #{i+1} (Reward: {rec['reward']:.2f}):")
            print(f"Product: {recommended_food.get('product_name', 'Unknown')}")
            print(f"Keywords: {', '.join(recommended_food.get('_keywords', []))}")
            print(f"Nutri-score: {recommended_food.get('nutriscore_grade', recommended_food.get('nutrition_grade_fr', 'N/A'))}")
            print(f"Nova group: {recommended_food.get('nova_groups', 'N/A')}")
            print(f"Eco-score: {recommended_food.get('ecoscore_grade', 'N/A')}")
        
        # Ask if user wants to continue testing with next item
        if idx < len(test_items) - 1:
            response = input("\nTest next item? (y/n): ").strip().lower()
            if response != 'y':
                break

if __name__ == "__main__":
    test_model()
