
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Rabbit } from 'lucide-react';
import HighScoreTable from './highscores/HighScoreTable';
import { useHighScores } from '@/hooks/useHighScores';

// Game configuration
const GAME_HEIGHT = 150;
const DINO_WIDTH = 44;
const DINO_HEIGHT = 48;
const CACTUS_WIDTH = 17;
const CACTUS_HEIGHT = 35;
const GROUND_HEIGHT = 20;
const JUMP_FORCE = 12;
const GRAVITY = 0.6;
const INITIAL_SPEED = 5;
const SPEED_INCREMENT = 0.001;

export default function DinoGame() {
  // Game state
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  // Hook to handle high scores
  const { 
    highScores,
    userHighScore, 
    loading: loadingScores, 
    saveScore,
    userInfo
  } = useHighScores('dino');

  // Game elements
  const [dinoY, setDinoY] = useState(0);
  const [obstacles, setObstacles] = useState<{ x: number; width: number; height: number }[]>([]);
  
  // Game loop references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastObstacleTimeRef = useRef<number>(0);
  const gameSpeedRef = useRef(INITIAL_SPEED);
  const jumpVelocityRef = useRef(0);
  const isJumpingRef = useRef(false);
  
  // Responsive sizing
  const isMobile = useIsMobile();
  const gameWidth = isMobile ? 320 : 600;

  // Game rendering
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background elements (clouds, mountains)
    ctx.fillStyle = '#f0f0f0';
    
    // Draw ground
    ctx.fillStyle = '#555';
    ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    
    // Draw dino - using Rabbit icon as replacement for the black rectangle
    ctx.save();
    ctx.fillStyle = '#4CAF50';
    
    // Position for the dino
    const dinoX = 50;
    const dinoY_position = GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT - dinoY;
    
    // Draw dino body
    ctx.beginPath();
    ctx.roundRect(dinoX, dinoY_position, DINO_WIDTH, DINO_HEIGHT, 8);
    ctx.fill();
    
    // Draw dino features (eyes, legs)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(dinoX + DINO_WIDTH - 10, dinoY_position + 10, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw legs
    ctx.fillStyle = '#3a8c3a';
    ctx.fillRect(dinoX + 5, dinoY_position + DINO_HEIGHT - 10, 8, 10);
    ctx.fillRect(dinoX + DINO_WIDTH - 13, dinoY_position + DINO_HEIGHT - 10, 8, 10);
    
    ctx.restore();
    
    // Draw obstacles - using Cactus-inspired shapes
    ctx.fillStyle = '#8B4513'; // Brown color for cactus
    obstacles.forEach(obstacle => {
      const obstacleX = obstacle.x;
      const obstacleY = GAME_HEIGHT - GROUND_HEIGHT - obstacle.height;
      
      // Draw cactus main body
      ctx.beginPath();
      ctx.fillRect(
        obstacleX, 
        obstacleY, 
        obstacle.width, 
        obstacle.height
      );
      
      // Draw cactus arms for larger obstacles
      if (obstacle.height > CACTUS_HEIGHT) {
        // Left arm
        ctx.beginPath();
        ctx.fillRect(
          obstacleX - 5, 
          obstacleY + 10, 
          5, 
          obstacle.height / 3
        );
        
        // Right arm
        ctx.beginPath();
        ctx.fillRect(
          obstacleX + obstacle.width, 
          obstacleY + obstacle.height / 3, 
          5, 
          obstacle.height / 3
        );
      }
    });
    
    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`High Score: ${Math.max(userHighScore, score)}`, 10, 50);
    
  }, [dinoY, obstacles, score, userHighScore]);

  // Game over handler
  const handleGameOver = useCallback(() => {
    setIsRunning(false);
    setGameOver(true);
    cancelAnimationFrame(animationFrameRef.current);
    
    // Save score if higher than high score
    if (score > userHighScore) {
      saveScore(score);
    }
  }, [score, userHighScore, saveScore]);

  // Check collisions
  const checkCollisions = useCallback(() => {
    for (const obstacle of obstacles) {
      // Dino hitbox
      const dinoLeft = 50;
      const dinoRight = 50 + DINO_WIDTH;
      const dinoTop = GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT - dinoY;
      const dinoBottom = GAME_HEIGHT - GROUND_HEIGHT - dinoY;
      
      // Obstacle hitbox
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleTop = GAME_HEIGHT - GROUND_HEIGHT - obstacle.height;
      const obstacleBottom = GAME_HEIGHT - GROUND_HEIGHT;
      
      // Check for collision
      if (
        dinoRight > obstacleLeft && 
        dinoLeft < obstacleRight && 
        dinoBottom > obstacleTop && 
        dinoTop < obstacleBottom
      ) {
        handleGameOver();
        return true;
      }
    }
    return false;
  }, [obstacles, dinoY, handleGameOver]);

  // Game update logic
  const updateGame = useCallback(() => {
    if (!isRunning) return;
    
    // Update score
    setScore(prev => prev + 1);
    
    // Update dino position
    if (isJumpingRef.current) {
      jumpVelocityRef.current -= GRAVITY;
      setDinoY(prev => {
        const newY = prev + jumpVelocityRef.current;
        if (newY <= 0) {
          isJumpingRef.current = false;
          return 0;
        }
        return newY;
      });
    }
    
    // Update obstacle positions
    setObstacles(prev => {
      const updatedObstacles = prev
        .map(obs => ({ ...obs, x: obs.x - gameSpeedRef.current }))
        .filter(obs => obs.x > -obs.width);
      
      return updatedObstacles;
    });
    
    // Generate new obstacles
    const now = Date.now();
    if (now - lastObstacleTimeRef.current > 1500) {
      const randomDelay = Math.floor(Math.random() * 1000);
      if (randomDelay < 50) {
        setObstacles(prev => [
          ...prev, 
          { 
            x: gameWidth, 
            width: CACTUS_WIDTH, 
            height: CACTUS_HEIGHT + Math.floor(Math.random() * 15)
          }
        ]);
        lastObstacleTimeRef.current = now;
      }
    }
    
    // Increase game speed
    gameSpeedRef.current += SPEED_INCREMENT;
    
    // Check for collisions
    checkCollisions();
    
  }, [isRunning, gameWidth, checkCollisions]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;
    
    const gameLoop = () => {
      updateGame();
      drawGame();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, updateGame, drawGame]);

  // Start/restart game
  const startGame = () => {
    setIsRunning(true);
    setGameOver(false);
    setScore(0);
    setDinoY(0);
    setObstacles([]);
    isJumpingRef.current = false;
    jumpVelocityRef.current = 0;
    gameSpeedRef.current = INITIAL_SPEED;
    lastObstacleTimeRef.current = Date.now();
  };

  // Jump function
  const jump = () => {
    if (!isRunning) {
      startGame();
      return;
    }
    
    if (!isJumpingRef.current) {
      isJumpingRef.current = true;
      jumpVelocityRef.current = JUMP_FORCE;
    }
  };

  // Key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 p-2 text-black">
      {/* Title and score */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-sm sm:text-base">
          DINO RUNNER - Score: {score}
        </h2>
        <span className="text-xs sm:text-sm">
          {gameOver ? 'Game Over' : isRunning ? 'Running' : 'Ready'}
        </span>
      </div>

      {/* Game canvas */}
      <div 
        className="flex justify-center mb-2 cursor-pointer border border-chelas-gray-dark rounded-md overflow-hidden" 
        onClick={jump}
      >
        <canvas
          ref={canvasRef}
          width={gameWidth}
          height={GAME_HEIGHT}
          style={{ backgroundColor: '#f7f7f7' }}
        />
      </div>
      
      {/* Instructions */}
      <div className="text-xs mb-2 text-center">
        {gameOver ? 'Click or press Space to restart' : isRunning ? 'Click or press Space to jump' : 'Click or press Space to start'}
      </div>

      {/* Controls */}
      <div className="flex justify-center mb-4">
        <button className="win95-button px-4 flex items-center gap-2" onClick={startGame}>
          <Rabbit size={16} />
          {gameOver ? 'Restart' : isRunning ? 'Restart' : 'Start Game'}
        </button>
      </div>

      {/* High scores table - using the reusable component */}
      <HighScoreTable 
        scores={highScores} 
        loading={loadingScores} 
        title="High Scores"
      />
    </div>
  );
}
