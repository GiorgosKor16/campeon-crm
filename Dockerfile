# 1. Use a lightweight base image
FROM node:20-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy dependency files first (for better caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm ci

# 5. Copy the rest of your application code
COPY . .

# 6. Expose the port your app runs on
EXPOSE 3000

# 7. Define the command to start the app
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]