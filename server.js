const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 8080;

const app = express();

// Set server
const httpServer = http.createServer(app);
const socketIOserver = new Server(httpServer, {
  cors: {
    // origins: "http://localhost:3000/",
    origins: "https://medical-appointment.vercel.app/",
    methods: ["GET", "POST"],
  }
});

socketIOserver.on("connection", (socket) => {
  socket["nickname"] = "Anon";

  socket.on("clicked", (payload) => {
    console.log(payload, 'by', socket.id);
  });
});

httpServer.listen(PORT, () => console.log('Activated the server. '+PORT));