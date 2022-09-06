FROM node:gallium-alpine

# Process env
ENV PORT=3000

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE ${PORT}
CMD [ "npm", "run", "start" ]
