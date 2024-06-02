# Use an official Node runtime as the base image
FROM node:16.13-alpine

# Set the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Your app starts here...
CMD [ "/usr/src/app/node_modules/.bin/nodemon", "server.js" ]