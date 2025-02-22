import pymongo
import os
from pprint import pprint

# Connect to MongoDB
client = pymongo.MongoClient(os.getenv("MONGO_URI", "mongodb+srv://tomzheng1012:feg0yDprkZh5Fewq@scanned-items.uug7q.mongodb.net/?retryWrites=true&w=majority&appName=scanned-items"))
db = client['food_products']

# Check openfoodproducts collection
print("\nChecking openfoodproducts collection:")
sample_item = db['openfoodproducts'].find_one({})
if sample_item:
    print("\nSample item structure:")
    pprint(sample_item)
    
    # Check all items for score fields
    items = list(db['openfoodproducts'].find({}))
    print(f"\nTotal items: {len(items)}")
    
    # Check what fields are available for scores
    score_fields = set()
    for item in items:
        score_fields.update(item.keys())
    
    print("\nAvailable fields:")
    pprint(list(score_fields))
