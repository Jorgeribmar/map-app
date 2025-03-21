# Build and serve stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve package globally
RUN npm install -g serve

# Expose default serve port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"] 