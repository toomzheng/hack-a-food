# Barcode Scanner for Food Nutrition

This application uses your computer's webcam to scan food product barcodes and retrieve nutritional information from the Open Food Facts database.

## Features

- Real-time barcode scanning using webcam
- Integration with Open Food Facts API
- Detailed nutritional information display
- Visual feedback during scanning
- Support for multiple barcode formats

## Requirements

- Python 3.7+
- Webcam
- Internet connection
- ZBar library (required for barcode scanning)

## Installation

1. Install the ZBar library:
   - On macOS: `brew install zbar`
   - On Ubuntu/Debian: `sudo apt-get install libzbar0`
   - On Windows: Download and install from [here](http://zbar.sourceforge.net/)

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. Run the application:
   ```bash
   python barcode_scanner.py
   ```

2. Hold a product barcode in front of your webcam
3. The application will automatically detect and scan the barcode
4. Nutritional information will be displayed on the screen
5. Choose whether to scan another product or exit

## Nutritional Information Displayed

- Product Name
- Brand
- Nutrition Grade
- Calories
- Proteins
- Carbohydrates
- Fat
- Fiber
- Salt
- Ingredients
- Allergens

## Notes

- The application uses the Open Food Facts database, which is community-driven
- Some products may not be found in the database
- The accuracy of nutritional information depends on the database entries
