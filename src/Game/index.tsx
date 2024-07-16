import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const GAME_SIZE = 500;
const PLAYER_SIZE = 30;
const SPIKE_HEIGHT = 20;
const VERTICAL_SPEED = 100;
const CENTER_SPEED = 150;
const HORIZONTAL_SPEED = 50;
const DANGER_INTERVAL = 2000;

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Spike {
  dangerous: boolean;
  bonus: number | null;
}

type GameState = 'idle' | 'playing' | 'gameover';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [playerPos, setPlayerPos] = useState<Position>({ x: GAME_SIZE / 2 - PLAYER_SIZE / 2, y: GAME_SIZE - PLAYER_SIZE });
  const [playerVelocity, setPlayerVelocity] = useState<Velocity>({ x: 0, y: 0 });
  const [time, setTime] = useState<number>(0);
  const [topSpikes, setTopSpikes] = useState<Spike[]>(Array(10).fill({ dangerous: false, bonus: null }));
  const [bottomSpikes, setBottomSpikes] = useState<Spike[]>(Array(10).fill({ dangerous: false, bonus: null }));
  const [lastScore, setLastScore] = useState<number>(0);
  const [topScores, setTopScores] = useState<number[]>([]);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [intervalCount, setIntervalCount] = useState<number>(0);
  const verticalDirectionLocked = useRef<boolean>(false);
  const keysPressed = useRef<Record<string, boolean>>({});
  const gameLoopRef = useRef<number | null>(null);

  const startGame = () => {
    setGameState('playing');
    setPlayerPos({ x: GAME_SIZE / 2 - PLAYER_SIZE / 2, y: GAME_SIZE - PLAYER_SIZE });
    setPlayerVelocity({ x: 0, y: 0 });
    setTime(0);
    setBonusPoints(0);
    setIntervalCount(0);
    setTopSpikes(Array(10).fill({ dangerous: false, bonus: null }));
    setBottomSpikes(Array(10).fill({ dangerous: false, bonus: null }));
    verticalDirectionLocked.current = false;
    keysPressed.current = {};
  };

  const endGame = useCallback(() => {
    setGameState('gameover');
    const finalScore = time + bonusPoints;
    setLastScore(finalScore);
    setTopScores(prevScores => {
      const newScores = [...prevScores, finalScore].sort((a, b) => b - a).slice(0, 5);
      return newScores;
    });
  }, [time, bonusPoints]);

  const updatePlayerPosition = useCallback(() => {
    setPlayerPos(prev => {
      let newX = prev.x;
      if (keysPressed.current.ArrowLeft) newX -= HORIZONTAL_SPEED / 10;
      if (keysPressed.current.ArrowRight) newX += HORIZONTAL_SPEED / 10;
      newX = Math.max(0, Math.min(GAME_SIZE - PLAYER_SIZE, newX));

      let newY = prev.y + playerVelocity.y;
      const centerRegion = GAME_SIZE / 3;

      if (newY > centerRegion && newY < GAME_SIZE - centerRegion) {
        newY += playerVelocity.y > 0 ? (CENTER_SPEED - VERTICAL_SPEED) / 10 : (VERTICAL_SPEED - CENTER_SPEED) / 10;
      }

      newY = Math.max(0, Math.min(GAME_SIZE - PLAYER_SIZE, newY));

      if (newY === 0 || newY === GAME_SIZE - PLAYER_SIZE) {
        verticalDirectionLocked.current = false;
        if (prev.y !== newY) {
          setBonusPoints(bonus => bonus + 5);
        }
      }

      return { x: newX, y: newY };
    });

    setTime(prev => prev + 0.1);
  }, [playerVelocity.y]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = window.setInterval(updatePlayerPosition, 100);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, updatePlayerPosition]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const dangerInterval = setInterval(() => {
      setIntervalCount(prev => prev + 1);
      setTopSpikes(prev => prev.map(() => ({ dangerous: Math.random() < 0.3, bonus: null })));
      setBottomSpikes(prev => prev.map(() => ({ dangerous: Math.random() < 0.3, bonus: null })));

      // Add bonus spikes
      const addBonus = (spikes: Spike[], bonus: number): Spike[] => {
        const availableIndices = spikes.reduce<number[]>((acc, spike, index) => {
          if (!spike.dangerous && spike.bonus === null) acc.push(index);
          return acc;
        }, []);
        if (availableIndices.length > 0) {
          const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          return spikes.map((spike, index) =>
            index === randomIndex ? { ...spike, bonus } : spike
          );
        }
        return spikes;
      };

      if (Math.random() < 0.5) {
        setTopSpikes(prev => addBonus(prev, 1));
      } else {
        setBottomSpikes(prev => addBonus(prev, 1));
      }

      if (intervalCount % 10 === 0) {
        if (Math.random() < 0.5) {
          setTopSpikes(prev => addBonus(prev, 10));
        } else {
          setBottomSpikes(prev => addBonus(prev, 10));
        }
      }

      if (intervalCount % 100 === 0) {
        if (Math.random() < 0.5) {
          setTopSpikes(prev => addBonus(prev, 100));
        } else {
          setBottomSpikes(prev => addBonus(prev, 100));
        }
      }

      if (intervalCount % 1000 === 0) {
        if (Math.random() < 0.5) {
          setTopSpikes(prev => addBonus(prev, 1000));
        } else {
          setBottomSpikes(prev => addBonus(prev, 1000));
        }
      }
    }, DANGER_INTERVAL);

    return () => clearInterval(dangerInterval);
  }, [gameState, intervalCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      keysPressed.current[e.key] = true;

      switch (e.key) {
        case 'ArrowUp':
          if (!verticalDirectionLocked.current) {
            setPlayerVelocity(prev => ({ ...prev, y: -VERTICAL_SPEED / 10 }));
            verticalDirectionLocked.current = true;
          }
          break;
        case 'ArrowDown':
          if (!verticalDirectionLocked.current) {
            setPlayerVelocity(prev => ({ ...prev, y: VERTICAL_SPEED / 10 }));
            verticalDirectionLocked.current = true;
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const checkCollision = () => {
      const playerLeftIndex = Math.floor(playerPos.x / (GAME_SIZE / 10));
      const playerRightIndex = Math.floor((playerPos.x + PLAYER_SIZE - 1) / (GAME_SIZE / 10));

      const checkSpikes = (spikes: Spike[]) => {
        for (let i = playerLeftIndex; i <= playerRightIndex; i++) {
          if (spikes[i].dangerous) {
            endGame();
            return;
          }
          if (spikes[i].bonus !== null) {
            setBonusPoints(prev => prev + (spikes[i].bonus || 0));
            setTopSpikes(prev => prev.map((spike, index) =>
              index === i ? { ...spike, bonus: null } : spike
            ));
            setBottomSpikes(prev => prev.map((spike, index) =>
              index === i ? { ...spike, bonus: null } : spike
            ));
          }
        }
      };

      if (playerPos.y <= SPIKE_HEIGHT) {
        checkSpikes(topSpikes);
        // checkSpikes(topSpikes, playerPos.y);
      }
      if (playerPos.y >= GAME_SIZE - PLAYER_SIZE - SPIKE_HEIGHT) {
        checkSpikes(bottomSpikes);
        // checkSpikes(bottomSpikes, playerPos.y + PLAYER_SIZE);
      }
    };

    const collisionCheck = setInterval(checkCollision, 100);

    return () => clearInterval(collisionCheck);
  }, [gameState, playerPos, topSpikes, bottomSpikes, endGame]);

  const renderSpike = (spike: Spike, index: number, isTop: boolean) => (
    <div
      key={`${isTop ? 'top' : 'bottom'}-${index}`}
      className={`absolute transition-opacity duration-1000 ${
        spike.dangerous ? 'bg-gray-300 opacity-100' :
          spike.bonus === 1 ? 'bg-green-300 opacity-30' :
            spike.bonus === 10 ? 'bg-blue-300 opacity-30' :
              spike.bonus === 100 ? 'bg-pink-300 opacity-30' :
                spike.bonus === 1000 ? 'bg-orange-300 opacity-30' :
                  'bg-gray-300 opacity-30'
      }`}
      style={{
        width: GAME_SIZE / 10,
        height: SPIKE_HEIGHT,
        left: index * (GAME_SIZE / 10),
        [isTop ? 'top' : 'bottom']: 0,
        clipPath: isTop ? 'polygon(50% 100%, 0 0, 100% 0)' : 'polygon(50% 0, 0 100%, 100% 100%)',
      }}
    >
      {spike.dangerous && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold">!</div>}
      {spike.bonus && <div className="absolute inset-0 flex items-center justify-center text-black font-bold" style={{ fontSize: '6px' }}>{spike.bonus}</div>}
    </div>
  );

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="relative" style={{ width: GAME_SIZE, height: GAME_SIZE }}>
        {/* Game area */}
        <div className="absolute inset-0 bg-white border-2 border-gray-300">
          {/* Player */}
          <div
            className="absolute bg-black"
            style={{
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              left: playerPos.x,
              top: playerPos.y,
              transition: 'left 0.1s linear, top 0.1s linear',
            }}
          />

          {/* Spikes */}
          {topSpikes.map((spike, index) => renderSpike(spike, index, true))}
          {bottomSpikes.map((spike, index) => renderSpike(spike, index, false))}

          {/* Timer and Bonus */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
            {gameState === 'playing' ? `${time.toFixed(1)} + ${bonusPoints}` : ''}
          </div>

          {/* Play button and scores */}
          {gameState !== 'playing' && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              {lastScore > 0 && <div className="mb-2">Last Score: {lastScore.toFixed(1)}</div>}
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={startGame}
              >
                Play
              </button>
              {gameState === 'gameover' && (
                <div className="mt-4">
                  <h3 className="font-bold mb-1">Top Scores:</h3>
                  <ol>
                    {topScores.map((score, index) => (
                      <li key={index}>{score.toFixed(1)}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls explanation */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Controls:</h3>
        <div className="flex items-center mb-1">
          <ArrowUp size={16} className="mr-2" /> Jump
        </div>
        <div className="flex items-center mb-1">
          <ArrowDown size={16} className="mr-2" /> Fall
        </div>
        <div>← → Move left/right</div>
      </div>
    </div>
  );
};

export default Game;
