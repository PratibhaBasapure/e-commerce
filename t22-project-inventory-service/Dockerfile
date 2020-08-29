# Using the official nodejs image.
FROM node:12
# Work directory.
WORKDIR /app
# Copy the package manager file to the working location.
COPY package*.json ./
# Installing packages inside the image filesystem.
RUN npm install
# Copy source code to image filesystem.
COPY . .
# Docker image port.
EXPOSE 3000
# Command to run the application
CMD ["npm", "start"]
