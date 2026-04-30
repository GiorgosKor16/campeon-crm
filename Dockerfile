# 1. Use a lightweight base image
FROM node:20-slim

# 2. Set the working directory inside the container
WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 5. Copy the rest of your application code
COPY . .
RUN npm run build

# 6. Expose the port your app runs on
EXPOSE 3000

# 7. Define the command to start the app
CMD ["npm", "start", "--", "-H", "0.0.0.0"]