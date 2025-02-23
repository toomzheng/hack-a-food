import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from model.model import FoodRecommender
from datetime import datetime

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the recommender once when server starts
recommender = FoodRecommender()

class ProductInput(BaseModel):
    name: str
    categories: List[str] = []
    labels: List[str] = []
    nutriscore_grade: str = ""
    _id: Optional[str] = None
    url: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Food Recommendations API"}

@app.post("/recommendations")
async def get_recommendations(product: ProductInput):
    try:
        print("\nReceived product data:", product.dict())
        
        # Format input for model
        product_data = {
            "product_name": product.name,
            "_keywords": product.categories + product.labels,
            "nutriscore_grade": product.nutriscore_grade,
            "_id": product._id,
            "url": product.url
        }
        
        print("\nFormatted data for model:", product_data)
        
        # Get recommendations
        similar_products = recommender.find_similar_products(product_data, top_k=3)
        
        print("\nGot similar products:", similar_products)
        
        # Format recommendations
        recommendations = []
        for similarity_score, prod in similar_products:
            recommendation = {
                "product_name": prod.get("product_name", ""),
                "product_url": prod.get("url", ""),
                "nutriscore_grade": prod.get("nutriscore_grade", "")
            }
            recommendations.append(recommendation)
            print("\nFormatted recommendation:", recommendation)
            
        # Store recommendations in MongoDB
        recommendation_doc = {
            "timestamp": datetime.now(),
            "original_product": {
                "name": product.name,
                "keywords": product.categories + product.labels,
                "nutriscore_grade": product.nutriscore_grade
            },
            "recommendations": recommendations
        }
        recommender.db['recommendations'].insert_one(recommendation_doc)
        
        return {"recommendations": recommendations}
        
    except Exception as e:
        print(f"\nError in /recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("\nStarting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
