import NativeExplorerClient from './client';
import { loadGamesServer, getGameById } from '@/lib/games.server';

export async function generateMetadata({ params }) {
  const { gameId } = params;
  const games = await loadGamesServer();
  const game = getGameById(games, gameId);
  const gameName = game ? game.name : decodeURIComponent(gameId).toUpperCase();
  return {
    title: `NativeDB / ${gameName}`,
  };
}

export default function NativePage() {
  return <NativeExplorerClient />;
}
