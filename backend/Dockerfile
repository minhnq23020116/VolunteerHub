# Dockerfile
FROM node:18
WORKDIR /app

# Copy package.json và package-lock.json trước
COPY package*.json ./

# Cài đặt dependencies trong container (Linux)
RUN npm install

# Copy phần còn lại của code
COPY . .

CMD ["npm", "run", "dev"]
