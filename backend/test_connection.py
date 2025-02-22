from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def test_mongodb_connection():
    try:
        # Get the connection string
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            raise ValueError("MONGODB_URI not found in environment variables")
            
        # Create client and test connection
        client = MongoClient(mongodb_uri)
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # Test database and collection access
        db = client['food_products']
        products = db['products']
        print("✅ Successfully accessed food_products database and products collection")
        
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_mongodb_connection()
