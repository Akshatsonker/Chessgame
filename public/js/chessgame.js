/*
const socket = io();

const chess = new Chess();
const boardElement = document.querySelector(".chessboard")

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = ()=>{
  const board = chess.board();
    boardElement.innerHTML = ""; // Clear the board element
    board.forEach((row, rowindex) => {
   row.forEach((square, squareindex) => {
   const squareElement = document.createElement("div");
   squareElement.classList.add("square", (rowindex + squareindex) % 2 === 0 ? "light" : "dark");  
   squareElement.dataset.row = rowindex; 
    squareElement.dataset.col = squareindex; 

    if(square){
        const pieceElement = document.createElement("div");
        pieceElement.classList.add("piece", square.color=== "w" ? "white" : "black");
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e)=>{
            if(pieceElement.draggable){
                draggedPiece = pieceElement;
                sourceSquare = {row: rowindex, col: squareindex};
                e.dataTransfer.setData("text/plain", "");
            }
        });
        pieceElement.addEventListener("dragend",(e)=>{
            draggedPiece = null;
            sourceSquare = null;
        })
        squareElement.appendChild(pieceElement);
    }

    squareElement.addEventListener("dragover", function(e){
        e.preventDefault();
    });

    squareElement.addEventListener("drop", function(e){
        e.preventDefault();
        if(draggedPiece){
            const targetSource = {
                row: parseInt(squareElement.dataset.row),
                col: parseInt(squareElement.dataset.col),
        
            };
            handleMove(sourceSquare, targetSource);
        }
    })
    boardElement.appendChild(squareElement);
});
});
}
const handleMove = (source,target)=>{
    const move={
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q", // Always promote to queen for simplicity
    };
    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
   K: "♔",
   Q:  "♕",	
	R: "♖",	
	B: "♗",
	N: "♘",	
	P:  "♙",	
	k:  "♚",	
	q:  "♛",
    r:  "♜",	
	b:  "♝",
    n:  "♞",
    p:  "♟"
    };
    return unicodePieces[piece.type] || ""; // Return the unicode character or the original piece if not found	
	
};

socket.on("playerRole", function (role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function(){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function (fen) {
    chess.load(fen);
    renderBoard();
});

socket.on("move", function (move) {
    chess.move(move);
    renderBoard();
});
renderBoard();
*/
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";

    // Flip board if black player
    if (playerRole === "b") {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.className = `square ${(rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"}`;
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add( "piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;
                pieceElement.style.userSelect = "none";
                pieceElement.style.webkitUserSelect = "none";

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = {
                            row: rowIndex,
                            col: squareIndex
                        };
                        e.dataTransfer.setData("text/plain", "");
                        setTimeout(() => {
                            pieceElement.style.display = "none";
                        }, 0);
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    if (draggedPiece) {
                        draggedPiece.style.display = "block";
                        draggedPiece = null;
                        sourceSquare = null;
                    }
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => e.preventDefault());
            squareElement.addEventListener("dragenter", (e) => e.preventDefault());
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece && sourceSquare) {
                    const targetSquare = {
                        row: parseInt(e.currentTarget.dataset.row),
                        col: parseInt(e.currentTarget.dataset.col)
                    };

                    if (sourceSquare.row !== targetSquare.row || sourceSquare.col !== targetSquare.col) {
                        handleMove(sourceSquare, targetSquare);
                    }
                }
            });

            boardElement.appendChild(squareElement);
        });
    });
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q"
    };

    if (chess.move(move)) {
        socket.emit("move", move);
    } else {
        console.log("Invalid move attempted");
        renderBoard();
    }
};

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",  // White pieces
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"   // Black pieces
  };
  return unicodePieces[piece.type] || "";
};

// Socket event handlers
socket.on("playerRole", (role) => {
    playerRole = role;
    console.log("You are playing as:", role === "w" ? "White" : "Black");
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    console.log("You are a spectator");
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

socket.on("invalidMove", (message) => {
    console.log("Invalid move:", message);
    renderBoard();
});

// Initial render
renderBoard();
