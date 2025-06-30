# Use official Node.js LTS image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source
COPY . .

# Expose webhook URL environment variable
ENV WEBHOOK "https://changeme.com"

# Expose application port (change if needed)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]