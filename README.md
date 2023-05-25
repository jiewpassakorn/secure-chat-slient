# MERN SECURE CHAT

This project is a secure chat app. It will secure your message while sending each other. This app can chat both one-on-one and group chat. Real-time messaging by using socket.io

## Technology Stack

### Client Application

1. ViteJS for UI
2. Axios Library for handling AJAX calls
3. WebSocket library for real-time message exchange
4. CryptoJS for end-to-end encryption
5. Chakra UI

### Server Application

1. NodeJS
2. ExpressJS
3. Mongoose for MongoDB integration

---

## Set up project on your environment

Install necessary dependencies of the project by

```
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

## Start Locally

Run server by nodemon and use mongoDB as a database

```
npm start
```

Run frontend. This project created by using vite as a frontend framework. Vite is tools for create react project

```
cd frontend
npm run dev
```
