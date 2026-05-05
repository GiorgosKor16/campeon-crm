FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start", "--", "-H", "0.0.0.0"]