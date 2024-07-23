FROM node:18

ENV VITE_API_URL=http://localhost:8000

WORKDIR /app

# Copy the package.json and yarn.lock/npm package-lock.json files
COPY package.json pnpm-lock.yaml /app/

RUN npm i -g pnpm
RUN pnpm install

COPY . /app

RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Serve the built application using a simple static file server
RUN yarn global add serve
CMD ["pnpm", "run", "preview"]
