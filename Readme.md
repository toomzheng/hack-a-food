# Hack-A-Food

Devpost: https://devpost.com/software/awefaw-5dkeva#updates

What's in Hackathon food? Or food in general? Let's Hack-A-Food to find out.

## Features

- 📸 Real-time barcode scanning using device camera
- 🔍 Product information lookup using Open Food Facts database
- 📊 Nutritional analysis and scoring
- 🌱 Environmental impact assessment
- 💚 Health score calculation
- 📱 Responsive design for mobile and desktop
- 🗄️ MongoDB (Storing 400k+ documents) integration for product history

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Barcode Scanning**: ZXing Library
- **Camera Access**: react-webcam
- **Recommender System**: Pytorch, Scikit, Flask

## Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn
- Modern web browser with camera access

## Environment Setup

Create a `.env.local` file in the root directory with:

```env
MONGODB_URI=your_mongodb_connection_string
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hacklytics-2025
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Usage

1. Open the application in your browser
2. Click "Scan Food" to activate the camera
3. Point the camera at a product barcode
4. View detailed product information and scores
5. Check past scans in the history section

## API Routes

- `GET /api/products` - Get all scanned products
- `GET /api/products?id={id}` - Get specific product
- `POST /api/products` - Save new product scan
- `DELETE /api/products/{id}` - Delete product from history

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Open Food Facts for their comprehensive food database
- The Hacklytics 2025 team and organizers
