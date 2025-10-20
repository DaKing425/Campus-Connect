FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production=false --no-audit --no-fund

# Copy rest of the sources
COPY . .

EXPOSE 3000

# Use the dev server by default for a developer-friendly container.
CMD ["npm", "run", "dev"]
