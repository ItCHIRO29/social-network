FROM node:22.14.0
WORKDIR /social-network-frontend
COPY package*.json ./
RUN npm install
COPY . . 
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]