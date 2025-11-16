#!/bin/bash
# Build script for Vercel deployment

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Install Node.js dependencies and build frontend
cd frontend
npm install
npm run build
cd ..

echo "Build completed successfully!"