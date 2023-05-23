# MERN SECURE CHAT

This project is a secure chat app. It will secure your message while sending each other. This app can chat both one-on-one and group chat.

## dependencies

At Root folder

- bcrtpytjs
- colors
- dotenv
- express
- experss=async-handler
- jsonwebtoken
- mongoose
- nodemon
- socket.io

At frontend folder

- chakra-ui
- axios
- react-router-dom
- socket.io-client

## Set up project on your environment

Install necessary dependencies of the project by

```
// at root folder
npm i
cd frontend
npm i
```

Then set up your environment by create `.env` file and configure this following variable <br/>
**At root folder:**

- **PORT** add your server port.
- **MONGO_URI** add your connection string into your application code
- **DB_NAME** add your database name
- **JWT_SECRET** add your secret json web token it can be anything

**At frontend folder:**

- **VITE_SECRET_KEY** add your secret key for encrpytion.

## To start the server

run server by nodemon and use mongoDB as a database

```
// at root folder
npm start
```

## To start frontend

This project created by using vite as a frontend framework. Vite is tools for create react project

```
cd frontend
npm run dev
```
