
import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import type { GameStatus, GameState } from './types';
import { useInput } from './hooks/useInput';
import { TouchControls } from './components/TouchControls';
import { WORLD_LEVELS } from './constants/levels';

const Heart: React.FC<{ filled: boolean, isNew: boolean }> = ({ filled, isNew }) => (
  <div className={`w-9 h-9 rounded-lg border-2 border-black/40 transition-all duration-300 ${filled ? 'bg-gradient-to-br from-green-300 to-green-600 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-gradient-to-br from-red-600 to-red-900 shadow-inner'} ${isNew ? 'animate-heart-pulse' : ''}`}></div>
);

const GameOverlay: React.FC<{ status: GameStatus; onAction: () => void; isFinal: boolean }> = ({ status, onAction, isFinal }) => {
  if (status === 'playing') return null;

  const isWin = status === 'levelComplete';
  const isGameComplete = status === 'gameComplete';
  
  let title = 'MISSION FAILED';
  let buttonText = 'Retry Level';
  let titleColor = 'text-red-500';

  if (isGameComplete) {
      title = 'WORLD CLEARED!';
      buttonText = 'Return to Title';
      titleColor = 'text-yellow-400';
  } else if (isWin) {
      title = 'LEVEL COMPLETE';
      buttonText = isFinal ? 'Fight Boss' : 'Next Level';
      titleColor = 'text-green-400';
  }

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in backdrop-blur-md">
      <div className="bg-[#1a1510] border-4 border-[#b8860b] rounded-2xl p-16 text-center shadow-[0_0_80px_rgba(184,134,11,0.5)]">
        <h2 className={`text-6xl font-black mb-10 tracking-tighter ${titleColor}`} style={{ textShadow: '0 4px 0px rgba(0,0,0,0.5)' }}>{title}</h2>
        <button onClick={onAction} className="bg-[#ffd700] text-[#3e2723] px-16 py-5 text-3xl font-black rounded-xl hover:bg-[#ffeb3b] hover:scale-105 active:scale-95 transition-all shadow-xl border-b-4 border-[#b8860b]">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const LevelSelect: React.FC<{ onSelect: (index: number) => void, onBack: () => void }> = ({ onSelect, onBack }) => {
    return (
        <div className="absolute inset-0 bg-[#1c0f2b]/90 flex flex-col items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
            <h2 className="text-4xl font-black text-[#ffd700] mb-8 tracking-widest uppercase drop-shadow-md">Select Zone</h2>
            <div className="grid grid-cols-2 gap-4 max-w-4xl w-full px-8">
                {WORLD_LEVELS.map((level, i) => (
                    <button 
                        key={i} 
                        onClick={() => onSelect(i)}
                        className="bg-[#3e2723] border-2 border-[#b8860b] p-4 rounded-xl hover:bg-[#5d4037] hover:scale-105 transition-all text-left flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 bg-[#ffd700] rounded-full flex items-center justify-center text-[#3e2723] font-black text-xl shadow-inner group-hover:bg-white transition-colors">
                            {i + 1}
                        </div>
                        <span className="text-xl font-bold text-[#EBB55F] group-hover:text-white uppercase tracking-wider">{level.name}</span>
                    </button>
                ))}
            </div>
            <button onClick={onBack} className="mt-8 text-[#EBB55F]/60 hover:text-white text-sm font-bold uppercase tracking-[0.2em] border-b border-transparent hover:border-white transition-all">Back to Title</button>
        </div>
    );
};

const StartScreen: React.FC<{ onStart: () => void, onOpenLevelSelect: () => void }> = ({ onStart, onOpenLevelSelect }) => {
  return (
    <div className="w-screen h-screen bg-[#1c0f2b] flex flex-col items-center justify-center p-4 font-mono text-gray-200 overflow-hidden relative">
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#261C2C] via-[#5C2A52] to-[#EBB55F] opacity-80"></div>
      
      {/* Atmospheric Particles Overlay */}
      <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==')] animate-pulse"></div>

      <div className="text-center animate-fade-in relative z-10 flex flex-col items-center">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#ffd700] blur-[100px] rounded-full opacity-40"></div>
        <div className="mb-6 text-[#ffd700] font-black tracking-[0.5em] uppercase text-sm drop-shadow-md">Alpha Tactical v4.0</div>
        
        <h1 className="text-7xl sm:text-[10rem] font-black tracking-tighter text-white mb-8 leading-[0.85]" style={{ textShadow: '0 10px 0 #3e2723, 0 20px 40px rgba(0,0,0,0.5)' }}>
          JUNGLE<br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#ff6f00]">HIJINX</span>
        </h1>
        
        <p className="text-[#EBB55F] mb-12 text-xl tracking-widest font-bold max-w-lg mx-auto leading-relaxed drop-shadow-md">
          RETRO-KINETIC ACTION. <br/> LUSH ATMOSPHERICS.
        </p>
        
        <div className="flex gap-4">
            <button
            onClick={onStart}
            className="group relative bg-[#ffd700] text-[#3e2723] px-12 py-6 text-3xl font-black rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(255,215,0,0.3)] border-b-8 border-[#b8860b]"
            >
            <span className="relative z-10">NEW GAME</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>

            <button
            onClick={onOpenLevelSelect}
            className="group relative bg-[#3e2723] text-[#ffd700] px-8 py-6 text-2xl font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl border-b-8 border-[#2d1b18]"
            >
            <span className="relative z-10">LEVEL SELECT</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </button>
        </div>
      </div>
      
       <footer className="absolute bottom-6 text-[#EBB55F]/50 text-xs font-black uppercase tracking-[0.5em]">
        Alpha Tactical Engine v4.0 // High Fidelity Mode
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<'title' | 'levelSelect' | 'playing'>('title');
  const [gameKey, setGameKey] = useState(Date.now());
  const [gameState, setGameState] = useState<GameState>({
    status: 'playing',
    paused: false,
    playerHealth: 3,
    playerMaxHealth: 3,
    gemsCollected: 0,
    currentLevelIndex: 0,
  });
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const input = useInput(gameContainerRef);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleStateUpdate = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);
  
  const handleAction = useCallback(() => {
    if (gameState.status === 'levelComplete') {
        const nextLevelIndex = gameState.currentLevelIndex + 1;
        if (nextLevelIndex < WORLD_LEVELS.length) {
            // Next Level
            setGameState(prev => ({
                ...prev,
                status: 'playing',
                currentLevelIndex: nextLevelIndex,
            }));
            setGameKey(Date.now());
        } else {
            // World Complete
            setGameState(prev => ({ ...prev, status: 'gameComplete' }));
        }
    } else if (gameState.status === 'gameComplete') {
        // Return to title
        setAppStatus('title');
        setGameState(prev => ({ ...prev, currentLevelIndex: 0, status: 'playing' }));
    } else {
        // Restart current level (GameOver)
        setGameKey(Date.now());
        setGameState(prev => ({
            ...prev,
            status: 'playing',
            paused: false,
            playerHealth: 3,
            playerMaxHealth: 3,
        }));
    }
  }, [gameState.status, gameState.currentLevelIndex]);
  
  const handleStartGame = useCallback(() => {
      setAppStatus('playing');
      setGameState(prev => ({ ...prev, currentLevelIndex: 0, status: 'playing', playerHealth: 3 }));
      setGameKey(Date.now());
  }, []);

  const handleLevelSelect = useCallback((index: number) => {
      setAppStatus('playing');
      setGameState(prev => ({ ...prev, currentLevelIndex: index, status: 'playing', playerHealth: 3 }));
      setGameKey(Date.now());
  }, []);

  if (appStatus === 'title') return <StartScreen onStart={handleStartGame} onOpenLevelSelect={() => setAppStatus('levelSelect')} />;
  if (appStatus === 'levelSelect') return <LevelSelect onSelect={handleLevelSelect} onBack={() => setAppStatus('title')} />;

  return (
    <div className="w-screen h-screen bg-[#1c0f2b] flex flex-col items-center justify-center p-4 font-mono overflow-hidden">
      <div ref={gameContainerRef} className="relative w-full max-w-6xl aspect-[16/9] bg-black border-[8px] border-[#3e2723] rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden touch-none select-none ring-4 ring-[#5d4037]">
        <GameCanvas
          key={gameKey}
          onStateUpdate={handleStateUpdate}
          gameState={gameState}
          input={input}
        />
        
        {isTouchDevice && <TouchControls input={input} />}

        <GameOverlay 
            status={gameState.status} 
            onAction={handleAction} 
            isFinal={gameState.currentLevelIndex === WORLD_LEVELS.length - 1}
        />

        {/* TOP HUD */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col gap-4">
            <div className="bg-black/60 border-2 border-white/10 p-4 rounded-2xl backdrop-blur-xl flex items-center gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                {Array.from({ length: gameState.playerMaxHealth }).map((_, i) => (
                  <Heart key={i} filled={i < gameState.playerHealth} isNew={false} />
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#ffd700] to-[#ffa000] border-2 border-[#b8860b] px-6 py-2 rounded-xl flex items-center gap-4 shadow-xl self-start transform -rotate-1">
               <div className="w-4 h-4 bg-white rotate-45"></div>
               <span className="text-3xl font-black text-[#3e2723] leading-none drop-shadow-sm">{gameState.gemsCollected}</span>
            </div>
          </div>

          <div className="bg-black/60 border-2 border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl text-[#EBB55F] font-black text-sm tracking-widest uppercase">
            {WORLD_LEVELS[gameState.currentLevelIndex]?.name || 'Unknown Zone'}
          </div>
        </div>
      </div>

      <div className="flex gap-8 mt-10 text-[#EBB55F]/60 text-xs font-black tracking-[0.2em] uppercase">
        <div className="flex items-center gap-2"><span className="text-[#3e2723] bg-[#ffd700] px-2 py-1 rounded shadow-lg">ARROWS</span> MOVE</div>
        <div className="flex items-center gap-2"><span className="text-[#3e2723] bg-[#ffd700] px-2 py-1 rounded shadow-lg">SPACE</span> JUMP</div>
        <div className="flex items-center gap-2"><span className="text-[#3e2723] bg-[#ffd700] px-2 py-1 rounded shadow-lg">SHIFT</span> ROLL</div>
        <div className="flex items-center gap-2"><span className="text-[#3e2723] bg-[#ffd700] px-2 py-1 rounded shadow-lg">C</span> BLAST</div>
      </div>
    </div>
  );
};

export default App;
