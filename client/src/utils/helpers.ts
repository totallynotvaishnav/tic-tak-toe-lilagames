export const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
};

export const generateDeviceId = (): string => {
    const stored = localStorage.getItem('deviceId');
    if (stored) return stored;

    const newId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('deviceId', newId);
    return newId;
};

export const getStoredUsername = (): string | null => {
    return localStorage.getItem('username');
};

export const storeUsername = (username: string): void => {
    localStorage.setItem('username', username);
};

export const clearStoredData = (): void => {
    localStorage.removeItem('username');
};
