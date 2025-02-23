from flask import Flask, request, jsonify
from flask_cors import CORS
from model.model import FoodRecommender
import traceback

app = Flask(__name__)
CORS(app)
recommender = FoodRecommender()

@app.route('/recommendations', methods=['POST', 'OPTIONS'])
def get_recommendations():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        print("\nReceived data from frontend:")
        print(data)

        # Convert frontend data format to model format
        product = {
            'product_name': data.get('name', ''),
            '_keywords': data.get('categories', []) + data.get('labels', []),
            'nutriscore_grade': data.get('nutriscore_grade', ''),
        }

        print("\nConverted product format:")
        print(f"Name: {product['product_name']}")
        print(f"Keywords: {', '.join(product['_keywords'])}")

        similar_products = recommender.find_similar_products(product)
        
        # Print recommendations to terminal
        print("\nRecommendations:")
        for score, item in similar_products:
            print(f"\nSimilarity Score: {score:.3f}")
            print(f"Name: {item['product_name']}")
            print(f"Keywords: {', '.join(item['_keywords'])}")
            if 'nutriscore_grade' in item:
                print(f"Nutriscore: {item['nutriscore_grade'].upper()}")
            if 'url' in item:
                print(f"URL: {item['url']}")
            if 'image_url' in item:
                print(f"Image URL: {item['image_url']}")

        return jsonify({
            'recommendations': [
                {
                    'product_name': item['product_name'],
                    'product_url': item.get('url', ''),
                    'nutriscore_grade': item.get('nutriscore_grade', ''),
                    'image_url': item.get('image_url', ''),
                    'code': item.get('code', ''),
                    '_id': str(item['_id'])
                } for score, item in similar_products
            ]
        })

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
