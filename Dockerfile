FROM node:lts

COPY . .
RUN npm ci
