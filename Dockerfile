FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript
RUN npx tsc


# Start the server
CMD ["node", "dist/server.js"]
