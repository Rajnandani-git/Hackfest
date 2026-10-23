# Multi-stage Docker build for PayShield AI
# Stage 1: Build React 19 Frontend with Vite
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend with RapidOCR, OpenCV & ReportLab
FROM python:3.11-slim
WORKDIR /app

# Install essential system libraries for OpenCV and ONNX
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy Backend and Demo directories
COPY backend/ ./backend/
COPY demo/ ./demo/

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV PORT=8000
EXPOSE 8000

WORKDIR /app/backend
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
