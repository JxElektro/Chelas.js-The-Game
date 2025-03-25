
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Mountain, Cloud, Rabbit, Cactus } from 'lucide-react';

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

// Score structure
interface HighScore {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  created_at: string;
}

export default function DinoGame() {
  // Game state
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);

  // User data
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

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
  
  // Initialize user and high scores
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUserId(data.session.user.id);
        // Get profile name
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.session.user.id)
          .single();
        if (profileData) {
          setUserName(profileData.name);
        }
      }
    };
    checkUser();
    fetchHighScores();
  }, []);

  // Fetch high scores
  const fetchHighScores = async () => {
    setLoadingScores(true);
    try {
      // Call the correct RPC function
      const { data, error } = await supabase.rpc('get_dino_high_scores');
      if (error) throw error;
      if (data) {
        setHighScores(data as HighScore[]);
        // Find user's high score
        if (userId) {
          const userScore = data.find((s: HighScore) => s.user_id === userId);
          if (userScore) {
            setHighScore(userScore.score);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching high scores:', error);
      toast.error('Error loading scores');
      setHighScores([]);
    } finally {
      setLoadingScores(false);
    }
  };

  // Save high score
  const saveHighScore = async (newScore: number) => {
    if (!userId || !userName) return;
    try {
      // Call the correct RPC function
      const { error } = await supabase.rpc('add_dino_high_score', {
        user_id_param: userId,
        user_name_param: userName,
        score_param: newScore,
      });
      if (error) throw error;
      toast.success('Score saved!');
      fetchHighScores();
    } catch (error) {
      console.error('Error saving high score:', error);
      toast.error('Error saving score');
    }
  };

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
    ctx.fillText(`High Score: ${Math.max(highScore, score)}`, 10, 50);
    
  }, [dinoY, obstacles, score, highScore]);

  // Game over handler
  const handleGameOver = useCallback(() => {
    setIsRunning(false);
    setGameOver(true);
    cancelAnimationFrame(animationFrameRef.current);
    
    // Save score if higher than high score
    if (score > highScore && userId && userName) {
      saveHighScore(score);
      setHighScore(score);
    }
  }, [score, highScore, userId, userName]);

  // Check collisions
  const checkCollisions = useCallback(() => {
    for (const obstacle of obstacles) {
      // Simplified hitbox
      if (
        obstacle.x < 50 + DINO_WIDTH && 
        obstacle.x + obstacle.width > 50 && 
        GAME_HEIGHT - GROUND_HEIGHT - obstacle.height > GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT - dinoY &&
        GAME_HEIGHT - GROUND_HEIGHT - dinoY < GAME_HEIGHT - GROUND_HEIGHT
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

      {/* High scores */}
      <div className="border-2 border-chelas-gray-dark flex-grow overflow-auto p-2">
        <h3 className="font-bold text-sm mb-2">High Scores</h3>
        {loadingScores ? (
          <p className="text-center text-sm">Loading...</p>
        ) : highScores.length > 0 ? (
          <div className="win95-inset p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-chelas-gray-dark">
                  <th className="text-left p-1">Player</th>
                  <th className="text-right p-1">Score</th>
                  <th className="text-right p-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map(score => (
                  <tr key={score.id} className="border-b border-gray-200">
                    <td className="p-1">{score.user_name}</td>
                    <td className="text-right p-1">{score.score}</td>
                    <td className="text-right p-1 text-xs">
                      {new Date(score.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm">
            No high scores yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
}
