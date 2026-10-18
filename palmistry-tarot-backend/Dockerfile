FROM node:20-slim

WORKDIR /app

# Install native build tools for sqlite3 and bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Force sqlite3 to compile natively from source matching container's GLIBC version
RUN npm install --omit=dev --build-from-source=sqlite3

COPY . .

EXPOSE 3001

ENV PORT=3001
CMD ["node", "server.js"]
