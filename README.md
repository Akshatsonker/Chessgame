# Chess Game with Socket.io

A real-time multiplayer chess game using Socket.io and chess.js.

## Client-side Implementation (`script.js`)

### Socket.io Initialization
- Establishes WebSocket connection to the server using Socket.io (`const socket = io();`).

### Chess Game Initialization
- Creates an instance of the Chess class from chess.js to manage game logic (`const chess = new Chess();`).

### DOM Elements
- Selects the HTML element with ID "chessboard" to render the board (`const boardElement = document.querySelector("#chessboard");`).

### Drag and Drop Functionality
- Implements drag and drop for moving chess pieces
- Pieces are only draggable during the player's turn
- Includes event listeners for:
  - drag start
  - drag end
  - drag over
  - drop

### Board Rendering
- Generates HTML representation of the current game state
- Iterates over board array to create square elements
- Creates piece elements for occupied squares
- Flips board perspective for black player

### Move Handling
- Constructs move object with source/target squares in algebraic notation
- Emits "move" event to server via Socket.io

### Unicode Chess Pieces
- Returns Unicode characters representing chess pieces based on type

### Socket.io Event Handlers
- Listens for server events:
  - Player role assignment
  - Spectator role assignment
  - Board state updates
  - Opponent moves
- Updates local game state and re-renders board accordingly

### Initial Setup
- Calls `renderBoard()` to display initial board state

## Server-side Implementation (`server.js`)

### Dependencies
- express
- http
- socket.io
- chess.js

### Setup
- Creates Express app instance
- Initializes HTTP server with Express
- Instantiates Socket.io on HTTP server
- Creates Chess object instance (chess.js)

### Game State Management
- Tracks:
  - Players (socket IDs, roles: white/black)
  - Current player's turn

### Express Configuration
- Uses EJS templating engine
- Serves static files from 'public' directory

### Routes
- Root URL renders "index" EJS template with title "Custom Chess Game"

### Socket.io Event Handling

#### Connection
- Assigns roles based on availability:
  - First connection → white player
  - Second connection → black player
  - Subsequent connections → spectators
- Emits appropriate role assignment events
- Sends initial board state using FEN notation

#### Disconnection
- Removes player from tracking object
- Frees up their role for new connections

#### Move Validation
- Verifies correct player's turn
- For valid moves:
  - Updates game state
  - Broadcasts move to all clients
  - Sends updated board state via "boardState" event
- Logs errors for invalid moves

## Features
- Real-time multiplayer gameplay
- Spectator mode
- Turn validation
- Board perspective flipping
- Responsive drag-and-drop interface
