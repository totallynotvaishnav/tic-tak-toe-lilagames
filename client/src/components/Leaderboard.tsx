import React, { useEffect, useState } from 'react';

import { getLeaderboard, LeaderboardEntry } from '../utils/nakama';

interface LeaderboardProps {
  client: any;
  session: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ client, session }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await getLeaderboard(client, session);
      setEntries(records);
    } catch (err: any) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client && session) {
      fetchLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, session]);

  return (
    <div className="leaderboard-container">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Leaderboard</h2>
        <button className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={fetchLeaderboard}>
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-4">No players yet. Be the first!</div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-1 px-2 text-left">Rank</th>
              <th className="py-1 px-2 text-left">Username</th>
              <th className="py-1 px-2 text-right">Wins</th>
              <th className="py-1 px-2 text-right">Losses</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.rank} className="border-b last:border-b-0">
                <td className="py-1 px-2">#{entry.rank}</td>
                <td className="py-1 px-2">{entry.username}</td>
                <td className="py-1 px-2 text-right">{entry.wins}</td>
                <td className="py-1 px-2 text-right">{entry.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
