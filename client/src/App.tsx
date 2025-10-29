import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { Board } from './components/Board';
import { PlayerInfo } from './components/PlayerInfo';
import { ScorePanel } from './components/ScorePanel';
import { GameButton } from './components/GameButton';
import { GameOverModal } from './components/GameOverModal';
import Leaderboard from './components/Leaderboard';
import { GameState, WinningLine } from './utils/gameLogic';
import { checkWinner } from './utils/gameLogic';
import {
    createNakamaClient,
    authenticateDevice,
    createSocket,
    findMatch,
    sendMove,
    OpCode,
} from './utils/nakama';
import { generateDeviceId, getStoredUsername, storeUsername } from './utils/helpers';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'finding-match' | 'in-match';

// Use Vite environment variables for Nakama config
const isProduction = import.meta.env.PROD;

function App() {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [username, setUsername] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [matchId, setMatchId] = useState<string | null>(null);
    const [winningLine, setWinningLine] = useState<WinningLine | null>(null);
    const [lastMove, setLastMove] = useState<number | null>(null);
    const [showGameOver, setShowGameOver] = useState(false);
    // Clear error message when game over modal is shown
    useEffect(() => {
        if (showGameOver) setErrorMessage(null);
    }, [showGameOver]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [gameOverData, setGameOverData] = useState<{
        winner: string | null;
        winnerId: string | null;
        isDraw: boolean;
    } | null>(null);

    const clientRef = useRef<Client | null>(null);
    const sessionRef = useRef<Session | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const matchmakerTicketRef = useRef<string | null>(null);
    const gameStateRef = useRef<GameState | null>(null);

    useEffect(() => {
        const stored = getStoredUsername();
        if (stored) {
            setUsername(stored);
            setUsernameInput(stored);
        }
    }, []);

    useEffect(() => {
        console.log('GameState or UserId changed:', {
            userId,
            gameState,
            hasPlayers: gameState?.players ? Object.keys(gameState.players) : [],
        });
    }, [gameState, userId]);

    const connectToServer = useCallback(async () => {
        if (!usernameInput.trim()) {
            setErrorMessage('Please enter a username');
            return;
        }

        try {
            setConnectionState('connecting');
            setErrorMessage(null);

            const client = createNakamaClient();

            clientRef.current = client;

            const deviceId = generateDeviceId();
            const session = await authenticateDevice(client, deviceId, usernameInput);
            sessionRef.current = session;
            setUserId(session.user_id || null);
            setUsername(usernameInput);
            storeUsername(usernameInput);

            const socket = createSocket(client, isProduction, false);
            socketRef.current = socket;

            await socket.connect(session, true);

            socket.onmatchmakermatched = async (matched) => {
                console.log('Matchmaker matched:', matched);
                if (matchmakerTicketRef.current) {
                    socket.removeMatchmaker(matchmakerTicketRef.current);
                    matchmakerTicketRef.current = null;
                }

                if (matched.match_id) {
                    try {
                        console.log('Joining match:', matched.match_id);
                        await new Promise((resolve) => setTimeout(resolve, 100));
                        const match = await socket.joinMatch(matched.match_id);
                        console.log('Joined match successfully:', match);
                        setMatchId(matched.match_id);
                        setConnectionState('in-match');
                    } catch (error) {
                        console.error('Error joining match:', error);
                        setErrorMessage('Failed to join match');
                        setConnectionState('connected');
                    }
                }
            };

            socket.onmatchdata = (matchData) => {
                console.log('Match data received:', {
                    opCode: matchData.op_code,
                    sender: matchData.presence,
                    data: matchData.data,
                });

                switch (matchData.op_code) {
                    case OpCode.STATE_UPDATE: {
                        const data = JSON.parse(new TextDecoder().decode(matchData.data));
                        console.log('STATE_UPDATE received:', {
                            board: data.board,
                            currentPlayer: data.currentPlayer,
                            currentPlayerName: data.currentPlayerName,
                            gameStatus: data.gameStatus,
                            players: data.players,
                            moveCount: data.moveCount,
                        });
                        setGameState(data);
                        gameStateRef.current = data;
                        break;
                    }

                    case OpCode.PLAYER_JOINED: {
                        const data = JSON.parse(new TextDecoder().decode(matchData.data));
                        console.log('Player joined:', data);
                        break;
                    }

                    case OpCode.GAME_OVER: {
                        const data = JSON.parse(new TextDecoder().decode(matchData.data));
                        const isDraw = data.reason === 'draw' || data.winner === 'draw';
                        const board = Array.isArray(data.board)
                            ? data.board
                            : Array.isArray(data.finalBoard)
                            ? data.finalBoard
                            : null;
                        const rawWinner = typeof data.winner === 'string' ? data.winner : null;
                        const winnerIdFromPayload =
                            typeof data.winnerId === 'string'
                                ? data.winnerId
                                : rawWinner && rawWinner !== 'draw'
                                ? rawWinner
                                : null;
                        const latestState = gameStateRef.current;
                        const winnerName =
                            !isDraw &&
                            winnerIdFromPayload &&
                            latestState?.players?.[winnerIdFromPayload]
                                ? latestState.players[winnerIdFromPayload].username
                                : !isDraw && rawWinner && rawWinner !== 'draw'
                                ? rawWinner
                                : null;

                        if (board) {
                            const winLine = checkWinner(board);
                            setWinningLine(winLine);
                        }

                        setGameOverData({
                            winner: winnerName,
                            winnerId: winnerIdFromPayload,
                            isDraw,
                        });

                        setErrorMessage(null); // Clear error on game over

                        setTimeout(() => {
                            setShowGameOver(true);
                        }, 800);
                        break;
                    }

                    case OpCode.ERROR: {
                        const data = JSON.parse(new TextDecoder().decode(matchData.data));
                        console.log('ERROR:', data);
                        if (data.error && data.error.toLowerCase().includes('not your turn')) {
                            setErrorMessage(null);
                        } else if (
                            data.error &&
                            (data.error.toLowerCase().includes("player 1's turn") ||
                                data.error.toLowerCase().includes("player 2's turn"))
                        ) {
                            setErrorMessage(null);
                        } else {
                            setErrorMessage(data.error || 'An error occurred');
                        }
                        break;
                    }
                }
            };

            socket.ondisconnect = () => {
                console.log('Disconnected from server');
                setConnectionState('disconnected');
                setGameState(null);
                gameStateRef.current = null;
                setMatchId(null);
            };

            setConnectionState('connected');
        } catch (error) {
            console.error('Connection error:', error);
            setErrorMessage('Failed to connect to server');
            setConnectionState('disconnected');
        }
    }, [usernameInput]);

    const startMatchmaking = useCallback(async () => {
        if (!socketRef.current) return;

        try {
            setConnectionState('finding-match');
            setErrorMessage(null);
            const ticket = await findMatch(socketRef.current);
            matchmakerTicketRef.current = ticket;
            console.log('Matchmaking started, ticket:', ticket);
        } catch (error) {
            console.error('Matchmaking error:', error);
            setErrorMessage('Failed to start matchmaking');
            setConnectionState('connected');
        }
    }, []);

    const handleMove = useCallback(
        (position: number) => {
            console.log('handleMove called:', { position, matchId, gameState, userId });

            if (!socketRef.current || !matchId || !gameState || !userId) {
                console.log('Missing required data:', {
                    socket: !!socketRef.current,
                    matchId: !!matchId,
                    gameState: !!gameState,
                    userId: !!userId,
                });
                return;
            }

            // Prevent moves and error popups after game is over
            if (showGameOver || gameState.gameStatus === 'finished') {
                return;
            }

            if (gameState.currentPlayer !== userId) {
                // Do not show 'not your turn' error, as turn is indicated under username
                return;
            }

            if (gameState.board[position] !== null) {
                console.log('Position already occupied:', position, gameState.board[position]);
                setErrorMessage('Position already occupied');
                return;
            }

            console.log('Sending move:', position);
            setLastMove(position);
            sendMove(socketRef.current, matchId, position);
            setErrorMessage(null);
        },
        [matchId, gameState, userId]
    );

    const handlePlayAgain = useCallback(() => {
        setShowGameOver(false);
        setWinningLine(null);
        setLastMove(null);
        setGameState(null);
        gameStateRef.current = null;
        setMatchId(null);
        setGameOverData(null);
        setConnectionState('connected');

        if (matchmakerTicketRef.current && socketRef.current) {
            socketRef.current.removeMatchmaker(matchmakerTicketRef.current);
            matchmakerTicketRef.current = null;
        }
    }, []);

    const handleDisconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect(true);
        }
        setConnectionState('disconnected');
        setGameState(null);
        gameStateRef.current = null;
        setMatchId(null);
        setWinningLine(null);
        setLastMove(null);
        setShowGameOver(false);
    }, []);

    const getMyPlayer = () => {
        if (!gameState || !userId) {
            console.log('getMyPlayer: Missing data', { gameState: !!gameState, userId });
            return null;
        }
        console.log('getMyPlayer:', {
            userId,
            players: gameState.players,
            myPlayer: gameState.players[userId],
        });
        return gameState.players[userId] || null;
    };

    const getOpponentPlayer = () => {
        if (!gameState || !userId) {
            console.log('getOpponentPlayer: Missing data', { gameState: !!gameState, userId });
            return null;
        }
        const opponentId = Object.keys(gameState.players).find((id) => id !== userId);
        console.log('getOpponentPlayer:', {
            userId,
            opponentId,
            players: gameState.players,
            opponent: opponentId ? gameState.players[opponentId] : null,
        });
        return opponentId ? gameState.players[opponentId] : null;
    };

    const isMyTurn = () => {
        // If game is over, it's no one's turn
        if (showGameOver || gameState?.gameStatus === 'finished') return false;
        const myTurn = gameState?.currentPlayer === userId;
        console.log('isMyTurn check:', {
            myTurn,
            currentPlayer: gameState?.currentPlayer,
            myUserId: userId,
            gameStatus: gameState?.gameStatus,
            showGameOver,
        });
        return myTurn;
    };

    const renderLoginScreen = () => (
        <div className='min-h-screen flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl'>
                <h1 className='text-4xl font-bold text-text-dark mb-2 text-center'>Tic Tac Toe</h1>
                <p className='text-text-dark opacity-60 text-center mb-8'>Multiplayer Edition</p>

                {errorMessage && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        {errorMessage}
                    </div>
                )}

                <input
                    type='text'
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && connectToServer()}
                    placeholder='Enter your username'
                    className='w-full px-4 py-3 border-2 border-grid-bg rounded-lg mb-4 text-text-dark focus:outline-none focus:border-tile-x'
                    disabled={connectionState === 'connecting'}
                />

                <GameButton
                    onClick={connectToServer}
                    fullWidth
                    disabled={connectionState === 'connecting'}
                >
                    {connectionState === 'connecting' ? 'Connecting...' : 'Connect'}
                </GameButton>
            </div>
        </div>
    );

    const renderLobbyScreen = () => (
        <div className='min-h-screen flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl'>
                <h1 className='text-4xl font-bold text-text-dark mb-2 text-center'>Tic Tac Toe</h1>
                <p className='text-text-dark opacity-60 text-center mb-2'>Welcome, {username}!</p>
                {errorMessage && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        {errorMessage}
                    </div>
                )}
                <div className='my-6'>
                    <Leaderboard client={clientRef.current} session={sessionRef.current} />
                </div>
                <div className='space-y-4 mt-8'>
                    <GameButton
                        onClick={startMatchmaking}
                        fullWidth
                        disabled={connectionState === 'finding-match'}
                    >
                        {connectionState === 'finding-match' ? 'Finding Match...' : 'Find Match'}
                    </GameButton>
                    <GameButton onClick={handleDisconnect} fullWidth variant='secondary'>
                        Disconnect
                    </GameButton>
                </div>
            </div>
        </div>
    );

    const renderGameScreen = () => {
        const myPlayer = getMyPlayer();
        const opponentPlayer = getOpponentPlayer();
        const playerCount = gameState ? Object.keys(gameState.players).length : 0;

        return (
            <div className='min-h-screen p-4 pb-8'>
                <div className='max-w-2xl mx-auto'>
                    <div className='text-center mb-6'>
                        <h1 className='text-4xl font-bold text-text-dark mb-2'>Tic Tac Toe</h1>
                        <p className='text-text-dark opacity-60'>Multiplayer Battle</p>
                    </div>

                    <div className='grid grid-cols-3 gap-4 mb-6'>
                        <ScorePanel title='Players' value={`${playerCount}/2`} />
                        <ScorePanel
                            title='Moves'
                            value={gameState?.moveCount || 0}
                            highlight={isMyTurn()}
                        />
                        <ScorePanel
                            title='Status'
                            value={
                                gameState?.gameStatus === 'waiting'
                                    ? 'Wait'
                                    : gameState?.gameStatus === 'playing' ||
                                      gameState?.gameStatus === 'active'
                                    ? 'Play'
                                    : 'End'
                            }
                        />
                    </div>

                    {/* Only show error if not game over */}
                    {errorMessage && !showGameOver && (
                        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-slide-in'>
                            {errorMessage}
                        </div>
                    )}

                    {(gameState?.gameStatus === 'waiting' || playerCount < 2) && (
                        <div className='bg-tile-x bg-opacity-20 border-2 border-tile-x rounded-lg p-4 mb-6 text-center animate-pulse'>
                            <p className='font-bold text-text-dark'>
                                Waiting for opponent to join...
                            </p>
                        </div>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                        <PlayerInfo player={myPlayer} isCurrentTurn={isMyTurn()} userId={userId} />
                        <PlayerInfo
                            player={opponentPlayer}
                            isCurrentTurn={!isMyTurn() && gameState?.gameStatus === 'playing'}
                            userId={userId}
                        />
                    </div>

                    {gameState && (
                        <Board
                            board={gameState.board}
                            onMove={handleMove}
                            disabled={
                                !isMyTurn() ||
                                (gameState.gameStatus !== 'playing' &&
                                    gameState.gameStatus !== 'active')
                            }
                            winningLine={winningLine}
                            lastMove={lastMove}
                            isMyTurn={isMyTurn()}
                        />
                    )}

                    <div className='mt-6 flex justify-center'>
                        <GameButton onClick={handleDisconnect} variant='secondary'>
                            Leave Match
                        </GameButton>
                    </div>
                    <div className='mt-8'>
                        <Leaderboard client={clientRef.current} session={sessionRef.current} />
                    </div>
                </div>

                <GameOverModal
                    winner={gameOverData?.winner || null}
                    winnerId={gameOverData?.winnerId || null}
                    currentUserId={userId}
                    isDraw={gameOverData?.isDraw || false}
                    onPlayAgain={handlePlayAgain}
                    show={showGameOver}
                />
            </div>
        );
    };

    return (
        <div className='min-h-screen bg-game-bg'>
            {connectionState === 'disconnected' && renderLoginScreen()}
            {(connectionState === 'connected' || connectionState === 'finding-match') &&
                renderLobbyScreen()}
            {connectionState === 'in-match' && renderGameScreen()}
        </div>
    );
}

export default App;
