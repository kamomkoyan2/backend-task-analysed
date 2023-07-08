FROM node:16

# Set working directory
WORKDIR /src

# Install app dependencies
# Copy the package.json and pnpm-lock.yaml files to the container
COPY package.json .
COPY pnpm-lock.yaml .

# Install pnpm globally
RUN npm install -g pnpm


# Install application dependencies using pnpm
RUN pnpm install

# Copy application code
COPY . .

# Expose the port on which your Node.js application runs
EXPOSE 3000

# Specify the command to start the application
CMD [ "pnpm", "run", "dev" ]