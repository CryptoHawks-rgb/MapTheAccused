# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Build the application for development (with hot reload)
# For production build, change to: RUN yarn build && yarn global add serve
# CMD ["serve", "-s", "build", "-l", "3000"]

# Expose port
EXPOSE 3000

# Command to run the application in development mode
CMD ["yarn", "start"]