import { Client, Session, Socket } from '@heroiclabs/nakama-js';

export const NAKAMA_SERVER = 'localhost';
export const NAKAMA_PORT = '7350';
export const NAKAMA_USE_SSL = false;
export const NAKAMA_SERVER_KEY = 'defaultkey';

export const OpCode = {
    MOVE: 1,
    STATE_UPDATE: 2,
    GAME_OVER: 3,
    PLAYER_JOINED: 4,
    ERROR: 5,
    CHAT: 6,
} as const;

export interface NakamaConfig {
    serverKey: string;
    host: string;
    port: string;
    useSSL: boolean;
}

export const createNakamaClient = (config?: Partial<NakamaConfig>): Client => {
    const finalConfig = {
        serverKey: config?.serverKey || NAKAMA_SERVER_KEY,
        host: config?.host || NAKAMA_SERVER,
        port: config?.port || NAKAMA_PORT,
        useSSL: config?.useSSL || NAKAMA_USE_SSL,
    };

    return new Client(
        finalConfig.serverKey,
        finalConfig.host,
        finalConfig.port,
        finalConfig.useSSL
    );
};

export const authenticateDevice = async (
    client: Client,
    deviceId: string,
    username?: string
): Promise<Session> => {
    const create = true;
    const session = await client.authenticateDevice(deviceId, create, username);
    return session;
};

export const createSocket = (client: Client, useSSL = false, verbose = false): Socket => {
    return client.createSocket(useSSL, verbose);
};

export const findMatch = async (socket: Socket): Promise<string> => {
    const query = '*';
    const minCount = 2;
    const maxCount = 2;
    const stringProperties: Record<string, string> = {};
    const numericProperties: Record<string, number> = {};

    const matchmakerTicket = await socket.addMatchmaker(
        query,
        minCount,
        maxCount,
        stringProperties,
        numericProperties
    );

    return matchmakerTicket.ticket;
};

export const sendMove = (socket: Socket, matchId: string, position: number): void => {
    const data = JSON.stringify({ position });
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    console.log('sendMove:', {
        matchId,
        position,
        data,
        encodedData,
        opCode: OpCode.MOVE,
    });

    try {
        socket.sendMatchState(matchId, OpCode.MOVE, encodedData);
        console.log('Move sent successfully');
    } catch (error) {
        console.error('Error sending move:', error);
        throw error;
    }
};

export interface LeaderboardEntry {
    rank: number;
    username: string;
    wins: number;
    losses: number;
}

/**
 * Fetches the leaderboard from Nakama and returns an array of LeaderboardEntry.
 * @param client Nakama client
 * @param session Nakama session
 * @param leaderboardId Nakama leaderboard id (default: 'tictactoe_wins')
 * @param limit Number of records to fetch (default: 10)
 */
export const getLeaderboard = async (
    client?: Client,
    session?: Session,
    leaderboardId: string = 'tictactoe_wins',
    limit: number = 10
): Promise<LeaderboardEntry[]> => {
    if (!client || !session) throw new Error('Nakama client/session not provided');
    const records = await client.listLeaderboardRecords(session, leaderboardId, [], limit);
    if (!records.records) return [];
    return records.records.map((record, idx) => ({
        rank: idx + 1,
        username: record.username || 'Anonymous',
        wins: record.score || 0,
        losses: record.subscore || 0,
    }));
};
