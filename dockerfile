# Get the base image of Node version 20
FROM node:18-bullseye-slim

# Get the latest version of Playwright
FROM mcr.microsoft.com/playwright:focal

# Set the work directory for the application
WORKDIR /app

# COPY the needed files to the app folder in Docker image
COPY package*.json ./

# Install openssl for Prisma
RUN apt-get update && apt-get install -y fuse3 openssl ca-certificates

# Get the needed libraries to run Playwright
RUN apt-get update && apt-get -y install libnss3 libatk-bridge2.0-0 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libatspi2.0-0 libxshmfence-dev

# Set up Prisma
COPY prisma .
# RUN npx prisma generate

# Install the dependencies in Node environment
RUN npm install

COPY ./ .
RUN npm run build # will build remix app
ENV NODE_ENV=production
CMD ["npm", “run” ,"start"]