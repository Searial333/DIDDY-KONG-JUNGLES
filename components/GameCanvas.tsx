
import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState, World, InputState } from '../types';
import { createWorld, spawnActor, get } from '../game/ecs';
import { runSystems } from '../game/systems';
import type { Health, Input } from '../game/components';
import { CHARACTER_PRESETS } from '../constants/characters';
import { WORLD_LEVELS } from '../constants/levels';


interface GameCanvasProps {
  gameState: GameState;
  onStateUpdate: (newState: Partial<GameState>) => void;
  input: InputState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onStateUpdate, input }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<World | null>(null);
  
  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Select Level
    const currentLevel = WORLD_LEVELS[gameState.currentLevelIndex] || WORLD_LEVELS[0];

    const world = createWorld({
        onStateUpdate,
        level: currentLevel, 
    });
    worldRef.current = world;
    
    // Spawn Diddy Kong by default as requested
    const characterPreset = CHARACTER_PRESETS.DIDDY || CHARACTER_PRESETS.TEDDY;
    const player = spawnActor(world, characterPreset, currentLevel.playerStart);
    world.playerId = player;

  }, [onStateUpdate, gameState.currentLevelIndex]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let animationFrameId: number;
    const gameLoop = () => {
      if (!worldRef.current || !canvasRef.current) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      
      const world = worldRef.current;
      world.status = gameState.status;
      
      if (gameState.paused || (gameState.status !== 'playing' && gameState.status !== 'gameComplete')) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const now = performance.now();
      const dt = Math.min(0.033, (now - (world.lastTime || now)) / 1000); // Cap DT to prevent huge jumps
      world.lastTime = now;
      world.time += dt;
      world.dt = dt;

      // Sync player input into the ECS component for the painter
      const playerInput = get<Input>(world, 'input', world.playerId);
      if (playerInput) {
          playerInput.left = input.left;
          playerInput.right = input.right;
          playerInput.up = input.up;
          playerInput.down = input.down;
          playerInput.jump = input.jump;
          playerInput.roll = input.roll;
          playerInput.jumpDown = input.jumpDown;
          playerInput.rollDown = input.rollDown;
          playerInput.downDown = input.downDown;
      }

      runSystems(world, canvasRef.current, input);

      const playerHealth = get<Health>(world, 'health', world.playerId);
      if(playerHealth && (playerHealth.hp !== gameState.playerHealth || playerHealth.maxHp !== gameState.playerMaxHealth)) {
          onStateUpdate({
              playerHealth: playerHealth.hp,
              playerMaxHealth: playerHealth.maxHp,
          });
      }
      
      if (world.gemsCollected !== gameState.gemsCollected) {
        onStateUpdate({ gemsCollected: world.gemsCollected });
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [input, gameState.paused, gameState.status, gameState.gemsCollected, onStateUpdate]);

  return <canvas ref={canvasRef} width={960} height={540} className="w-full h-full" />;
};

export default GameCanvas;
