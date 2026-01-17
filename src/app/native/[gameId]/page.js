import NativeExplorerClient from './client';
import { GAMES } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { gameId } = params;
  const game = GAMES.find(g => g.id === gameId);
  const gameName = game ? game.name : decodeURIComponent(gameId).toUpperCase();
  return {
    title: `NativeDB / ${gameName}`,
  };
}

export default function NativePage() {
  return <NativeExplorerClient />;
}
