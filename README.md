# 🎮 Tic-Tac-Toe Multiplayer Game

A real-time multiplayer Tic-Tac-Toe game built with **Nakama** game server and React.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Platform](https://img.shields.io/badge/platform-web-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

-   ⚡ **Real-time Multiplayer** - WebSocket-based instant gameplay
-   🎯 **Automatic Matchmaking** - Find opponents in seconds
-   🏆 **Leaderboard System** - Track wins, losses, and rankings
-   🎨 **Modern UI** - Responsive design with smooth animations
-   🔒 **Authoritative Server** - Server-side validation prevents cheating
-   📊 **Persistent Stats** - Player statistics saved in database
-   🌐 **Cross-platform** - Works on desktop and mobile browsers

## 🚀 Quick Start

### Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
-   node.js and npm installed

### Run Locally

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd tic-tak-toe-lilagames
```

2. **Start the game servers**

In two separate terminals, start the backend and frontend:

```bash
# Terminal 1: Start Nakama server and backend logic
cd server
npm run dev

# Terminal 2: Start the React web client
cd client
npm run dev
```

This will start:

-   Nakama game server (ports 10000 - API/WebSocket, 10001 - Admin Console)
-   PostgreSQL database (port 5432)
-   Web client (http://localhost:8080)

3. **Open in browser**

    - Open http://localhost:8080 in two browser windows/tabs
    - Enter usernames and click "Find Match"
    - Start playing!

4. **Stop servers**

In the server directory, stop the backend and database:

```bash
cd server
npm run stop
```

### Reset Database (Optional)

```bash
./clear-test-data.sh
```

## 🎮 How to Play

1. **Join:** Enter your username and click "Find Match"
2. **Wait:** Matchmaking will find you an opponent (~5-10 seconds)
3. **Play:** Click cells to place your mark (X or O)
4. **Win:** Get 3 in a row horizontally, vertically, or diagonally
5. **Rematch:** Click "New Game" to find another opponent

## 🏗️ Architecture

### Tech Stack

**Backend:**

-   [Nakama](https://heroiclabs.com/) - Open-source game server
-   PostgreSQL - Database for user data and leaderboards
-   Docker - Containerization

**Frontend:**

-   React (with TypeScript)
-   Vite (build tool)
-   Tailwind CSS (utility-first styling)
-   WebSocket for real-time communication

### Project Structure

```
tic-tak-toe-lilagames/
├── server/
│   ├── docker-compose.yml      # Docker services configuration
│   ├── local.yml               # Nakama server configuration
│   └── build/
│       └── index.js            # Game server logic
├── client/
│   ├── package.json            # Client dependencies and scripts
│   ├── tailwind.config.js      # Tailwind CSS config
│   ├── postcss.config.js       # PostCSS config
│   ├── public/
│   │   └── ...                 # Static assets
│   └── src/
│       ├── App.tsx             # Main React component
│       ├── main.tsx            # React entry point
│       ├── index.css           # Tailwind CSS imports
│       ├── components/         # React components
│       │   ├── Board.tsx
│       │   ├── GameButton.tsx
│       │   ├── GameOverModal.tsx
│       │   ├── Leaderboard.tsx
│       │   ├── PlayerInfo.tsx
│       │   ├── ScorePanel.tsx
│       │   └── Tile.tsx
│       └── utils/              # Utility modules
│           ├── gameLogic.ts
│           ├── helpers.ts
│           └── nakama.ts
├── clear-test-data.sh          # Reset database
└── README.md
```

## 🔧 Configuration

### Server Ports

-   **10000** - Nakama API & WebSocket (use this for client connection)
-   **10001** - Nakama Admin Console
-   **5432** - PostgreSQL
-   **8080** - Client web server

### Admin Console

Access Nakama admin console at: http://localhost:10001

-   **Username:** admin
-   **Password:** password

## 📊 Game Rules

-   Two players: X (first player) and O (second player)
-   Players take turns placing marks
-   First to get 3 marks in a row wins
-   If all 9 cells are filled with no winner, it's a draw
-   Winner gets +1 point on leaderboard

## 🐛 Troubleshooting

### Can't connect to game

```bash
# Check if services are running
docker ps

# View server logs
docker logs nakama --tail 50

```

### Players not matching

-   Both players must click "Find Match" within ~10 seconds
-   Wait for "Match found!" message
-   Check browser console for errors (F12)

### Clear stuck matches

```bash
./clear-test-data.sh
```

## 🔐 Security Notes

For production deployment:

1. Change default server key in `server/local.yml`
2. Update admin console password
3. Use environment variables for secrets
4. Enable SSL/HTTPS
5. Set up firewall rules
6. Enable rate limiting

## 📝 API Documentation

### Server-Client Communication (OpCodes)

```javascript
OpCode 1: MOVE           // Player makes a move
OpCode 2: STATE_UPDATE   // Board state changed
OpCode 3: GAME_OVER      // Game ended (win/draw)
OpCode 4: PLAYER_JOINED  // Player joined match
OpCode 5: ERROR          // Error message
OpCode 6: CHAT           // Chat message (reserved)
```

### Game State Structure

```javascript
{
  board: [null, null, 'X', null, 'O', ...],  // 9 cells
  currentPlayer: 'user-id',                   // Whose turn
  gameStatus: 'waiting' | 'active' | 'finished',
  players: { 'user-id': { username, symbol } },
  winner: 'user-id' | null
}
```

## 🔗 Resources

-   [Nakama Documentation](https://heroiclabs.com/docs/)
-   [Nakama JavaScript SDK](https://github.com/heroiclabs/nakama-js)
-   [Docker Documentation](https://docs.docker.com/)

## 📞 Support

Having issues? Check:

1. Docker is running
2. Ports 10000 and 10001 are available
3. Browser console for errors (F12)
4. Server logs: `docker logs nakama --tail 50`
