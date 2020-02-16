# base image
FROM node:lts-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json /app/package.json
RUN npm install
RUN npm install @vue/cli@4.2.2 -g

# start app
CMD ["npm", "run", "serve"]