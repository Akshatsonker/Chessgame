/*
const express = require("express");
const socket = require("socket.io");
const http = require("http");
const {Chess} = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/", (req, res) => {
  res.render("index",{title:"Chess Game"});
});

io.on("connection", function (uniquesocket){
    console.log("connected");

    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("player", "w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("player", "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect", function(){
        if(uniquesocket.id=== players.white){
            delete players.white;
        }
        else if(uniquesocket.id=== players.black){
            delete players.black;
        }
    });

    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn()==="w" && uniquesocket.id!==players.white) return;
            if(chess.turn()==="b" && uniquesocket.id!==players.black) return;  
        const result = chess.move(move);
        if(result){
            currentPlayer = chess.turn();
            io.emit("move", move);
            io.emit("boardState", chess.fen());
        }

        else{
            console.log("Invalid move: ", move);
            uniquesocket.emit("invalidMove", move);
        }
        } 
        catch (err) {
            console.error("Invalid move: ", err);
            uniquesocket.emit("Invalid move", move);
        }
 });
});


server.listen(5000);
console.log("Server is running on port 5000");
*/
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const chess = new Chess();
let players = {};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Assign player roles
  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
    console.log(`Assigned white to ${socket.id}`);
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
    console.log(`Assigned black to ${socket.id}`);
  } else {
    socket.emit("spectatorRole");
    console.log(`Assigned spectator role to ${socket.id}`);
  }

  // Send initial board state
  socket.emit("boardState", chess.fen());

  socket.on("disconnect", () => {
    if (socket.id === players.white) {
      console.log("White player disconnected");
      delete players.white;
    } else if (socket.id === players.black) {
      console.log("Black player disconnected");
      delete players.black;
    }
  });

  socket.on("move", (move) => {
    try {
      // Validate player turn
      if ((chess.turn() === "w" && socket.id !== players.white) || 
          (chess.turn() === "b" && socket.id !== players.black)) {
        return socket.emit("invalidMove", "Not your turn");
      }

      // Attempt move
      const result = chess.move(move);
      if (result) {
        console.log("Valid move:", move);
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move:", move);
        socket.emit("invalidMove", "Invalid move");
      }
    } catch (err) {
      console.error("Move error:", err);
      socket.emit("invalidMove", err.message);
    }
  });
});

httpServer.listen(5000, () => {
  console.log("Server running on port 5000");
});