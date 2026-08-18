import { useState, useCallback } from 'react';
import GamesHub from '../components/games/GamesHub';
import WordMatch from '../components/games/WordMatch';
import SentenceBuilder from '../components/games/SentenceBuilder';
import SpeedTyping from '../components/games/SpeedTyping';

export default function GamesPage({ onBack }) {
  const [game, setGame] = useState(null);

  const handleSelectGame = useCallback((gameId) => {
    setGame(gameId);
    // URL'ni yangilash (back button uchun)
    window.location.hash = `#/games/${gameId}`;
  }, []);

  const handleBackToHub = useCallback(() => {
    setGame(null);
    window.location.hash = '#/games';
  }, []);

  // URL'dan game olish
  const hashGame = window.location.hash.replace('#/games/', '');
  const currentGame = game || (hashGame && hashGame !== 'games' ? hashGame : null);

  if (currentGame === 'word-match') {
    return <WordMatch onBack={handleBackToHub} />;
  }
  if (currentGame === 'sentence-builder') {
    return <SentenceBuilder onBack={handleBackToHub} />;
  }
  if (currentGame === 'speed-typing') {
    return <SpeedTyping onBack={handleBackToHub} />;
  }

  return <GamesHub onSelectGame={handleSelectGame} onBack={onBack} />;
}
