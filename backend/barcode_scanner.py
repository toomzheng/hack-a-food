import cv2
import requests
import json
from pyzbar.pyzbar import decode
import numpy as np
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class BarcodeScanner:
    def __init__(self):
        self.api_url = "https://world.openfoodfacts.org/api/v0/product/{}.json"
        self.headers = {
            'User-Agent': 'FoodNutritionScanner - Python - Version 1.0'
        }
        
        # Initialize MongoDB connection using environment variable
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            raise ValueError("MongoDB connection string not found. Please set MONGODB_URI in .env file")
            
        try:
            self.client = MongoClient(mongodb_uri)
            # Test the connection
            self.client.admin.command('ping')
            print("Successfully connected to MongoDB!")
        except Exception as e:
            raise Exception(f"Failed to connect to MongoDB: {str(e)}")
            
        self.db = self.client['food_products']
        self.products_collection = self.db['products']
        
        # Create index on barcode for faster lookups
        self.products_collection.create_index('barcode', unique=True)

    def scan_barcode(self):
        """
        Opens webcam and scans for barcodes in real-time.
        Returns the barcode when found.
        """
        cap = cv2.VideoCapture(0)
        
        print("Scanning for barcode... Press 'q' to quit")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame")
                break

            # Find barcodes in frame
            barcodes = decode(frame)
            
            # Draw rectangle around barcode and show data
            for barcode in barcodes:
                # Extract barcode data
                barcode_data = barcode.data.decode('utf-8')
                barcode_type = barcode.type
                
                # Draw rectangle
                points = np.array([barcode.polygon], np.int32)
                points = points.reshape((-1, 1, 2))
                cv2.polylines(frame, [points], True, (0, 255, 0), 2)
                
                # Put text
                cv2.putText(frame, barcode_data, (barcode.rect.left, barcode.rect.top - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                
                # Release camera and return barcode
                cap.release()
                cv2.destroyAllWindows()
                return barcode_data

            # Display the frame
            cv2.imshow('Barcode Scanner', frame)
            
            # Break loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        return None

    def get_product_info(self, barcode):
        """
        Fetches product information from Open Food Facts API or MongoDB if already stored.
        """
        # First, try to get from MongoDB
        stored_product = self.products_collection.find_one({'barcode': barcode})
        if stored_product:
            print("Product found in database!")
            return self._format_product_info(stored_product['product_data'])
        
        # If not in MongoDB, fetch from API
        try:
            response = requests.get(self.api_url.format(barcode), headers=self.headers)
            data = response.json()
            
            if data.get('status') == 1:  # Product found
                product = data['product']
                # Store in MongoDB
                self._store_product(barcode, product)
                return self._format_product_info(product)
            else:
                return "Product not found in database."
                
        except requests.RequestException as e:
            return f"Error fetching product information: {str(e)}"

    def _store_product(self, barcode, product_data):
        """
        Stores product information in MongoDB.
        """
        try:
            # Prepare document
            document = {
                'barcode': barcode,
                'product_data': product_data,
                'last_updated': datetime.utcnow()
            }
            
            # Insert or update the document
            self.products_collection.update_one(
                {'barcode': barcode},
                {'$set': document},
                upsert=True
            )
            print("Product information stored in database!")
        except Exception as e:
            print(f"Error storing product in database: {str(e)}")

    def _format_product_info(self, product):
        """
        Formats the product information for display.
        Includes all possible fields from the Open Food Facts API.
        """
        info = {
            # Basic Information
            'Product Name': product.get('product_name', 'N/A'),
            'Generic Name': product.get('generic_name', 'N/A'),
            'Brands': product.get('brands', 'N/A'),
            'Quantity': product.get('quantity', 'N/A'),
            
            # Product Details
            'Countries': product.get('countries', 'N/A'),
            'Labels': product.get('labels', 'N/A'),
            'Manufacturing Places': product.get('manufacturing_places', 'N/A'),
            'Stores': product.get('stores', 'N/A'),
            'Countries Where Sold': product.get('countries_where_sold', 'N/A'),
            
            # Ingredients and Allergens
            'Ingredients Text': product.get('ingredients_text', 'N/A'),
            'Allergens': product.get('allergens', 'N/A'),
            'Traces': product.get('traces', 'N/A'),
            
            # Nutrition
            'Nutrition Grade': product.get('nutrition_grades', 'N/A').upper(),
            'Nova Group': product.get('nova_group', 'N/A'),
            'Serving Size': product.get('serving_size', 'N/A'),
            'Serving Quantity': product.get('serving_quantity', 'N/A'),
            
            # Nutriments (per 100g/ml)
            'Energy (kcal/100g)': product.get('nutriments', {}).get('energy-kcal_100g', 'N/A'),
            'Energy (kJ/100g)': product.get('nutriments', {}).get('energy-kj_100g', 'N/A'),
            'Fat (g/100g)': product.get('nutriments', {}).get('fat_100g', 'N/A'),
            'Saturated Fat (g/100g)': product.get('nutriments', {}).get('saturated-fat_100g', 'N/A'),
            'Carbohydrates (g/100g)': product.get('nutriments', {}).get('carbohydrates_100g', 'N/A'),
            'Sugars (g/100g)': product.get('nutriments', {}).get('sugars_100g', 'N/A'),
            'Fiber (g/100g)': product.get('nutriments', {}).get('fiber_100g', 'N/A'),
            'Proteins (g/100g)': product.get('nutriments', {}).get('proteins_100g', 'N/A'),
            'Salt (g/100g)': product.get('nutriments', {}).get('salt_100g', 'N/A'),
            'Sodium (g/100g)': product.get('nutriments', {}).get('sodium_100g', 'N/A'),
            
            # Additional Nutriments
            'Calcium (g/100g)': product.get('nutriments', {}).get('calcium_100g', 'N/A'),
            'Iron (g/100g)': product.get('nutriments', {}).get('iron_100g', 'N/A'),
            'Vitamin A (g/100g)': product.get('nutriments', {}).get('vitamin-a_100g', 'N/A'),
            'Vitamin C (g/100g)': product.get('nutriments', {}).get('vitamin-c_100g', 'N/A'),
            'Vitamin D (g/100g)': product.get('nutriments', {}).get('vitamin-d_100g', 'N/A'),
            
            # Environmental Impact
            'Ecoscore Grade': product.get('ecoscore_grade', 'N/A'),
            'CO2 Impact': product.get('carbon_footprint_100g', 'N/A'),
            
            # Additional Information
            'Additives': ', '.join(product.get('additives_tags', [])),
            'Ingredients from Palm Oil': ', '.join(product.get('ingredients_from_palm_oil_tags', [])),
            'May Contain Palm Oil': ', '.join(product.get('ingredients_that_may_be_from_palm_oil_tags', []))
        }
        
        # Format the output
        output = "\n=== Product Information ===\n"
        
        # Group the information into sections
        sections = {
            'Basic Information': ['Product Name', 'Generic Name', 'Brands', 'Quantity'],
            'Product Details': ['Countries', 'Labels', 'Manufacturing Places', 'Stores'],
            'Ingredients and Allergens': ['Ingredients Text', 'Allergens', 'Traces'],
            'Nutrition Information': ['Nutrition Grade', 'Nova Group', 'Serving Size', 'Serving Quantity'],
            'Nutriments (per 100g/ml)': [k for k in info.keys() if '100g' in k],
            'Environmental Impact': ['Ecoscore Grade', 'CO2 Impact'],
            'Additional Information': ['Additives', 'Ingredients from Palm Oil', 'May Contain Palm Oil']
        }
        
        # Print information by sections
        for section, fields in sections.items():
            output += f"\n--- {section} ---\n"
            for field in fields:
                if field in info and info[field] != 'N/A' and info[field] != [] and info[field] != '':
                    output += f"{field}: {info[field]}\n"
        
        return output

def main():
    scanner = BarcodeScanner()
    
    while True:
        print("\nReady to scan! Position barcode in front of camera...")
        barcode = scanner.scan_barcode()
        
        if barcode:
            print(f"\nBarcode detected: {barcode}")
            print("\nFetching product information...")
            product_info = scanner.get_product_info(barcode)
            print(product_info)
        
        choice = input("\nWould you like to scan another product? (y/n): ")
        if choice.lower() != 'y':
            break

    print("Thank you for using the Barcode Scanner!")

if __name__ == "__main__":
    main()
