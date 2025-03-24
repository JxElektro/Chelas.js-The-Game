import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

// Define the game grid size
const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_DELAY = 150;

// Snake direction
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Game state
interface GameState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  direction: Direction;
  nextDirection: Direction;
  isGameOver: boolean;
  isPaused: boolean;
  score: number;
}

// High score entry
interface HighScore {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  created_at: string;
}

const Snake: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 5, y: 5 },
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    isGameOver: false,
    isPaused: true,
    score: 0,
  });
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  
  // Game canvas dimensions (responsive)
  const canvasWidth = Math.min(GRID_SIZE * CELL_SIZE, isMobile ? 300 : 400);
  const canvasHeight = Math.min(GRID_SIZE * CELL_SIZE, isMobile ? 300 : 400);
  
  // Adjust cell size based on canvas dimensions
  const actualCellSize = Math.min(
    canvasWidth / GRID_SIZE,
    canvasHeight / GRID_SIZE
  );

  // Check current user on component mount
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
        
        // Get user's name from profile
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

  // Fetch high scores from the database
  const fetchHighScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_snake_high_scores')
        
      if (error) throw error;
      
      if (data) {
        setHighScores(data as HighScore[]);
      }
    } catch (error) {
      console.error('Error fetching high scores:', error);
      toast.error('Error al cargar las puntuaciones');
      
      // Fallback to empty array
      setHighScores([]);
    } finally {
      setLoading(false);
    }
  };

  // Save high score to the database
  const saveHighScore = async (score: number) => {
    if (!userId || !userName) return;
    
    try {
      const { error } = await supabase.rpc('add_snake_high_score', {
        user_id_param: userId,
        user_name_param: userName,
        score_param: score
      });
        
      if (error) throw error;
        
      toast.success('¡Puntuación guardada!');
      fetchHighScores();
    } catch (error) {
      console.error('Error saving high score:', error);
      toast.error('Error al guardar la puntuación');
    }
  };

  // Initialize game
  const initGame = useCallback(() => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      food: {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      },
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      isGameOver: false,
      isPaused: false,
      score: 0,
    });
  }, []);

  // Place food randomly on the grid
  const placeFood = useCallback(() => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    return { x, y };
  }, []);

  // Handle game over
  const handleGameOver = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      isPaused: true,
    }));
    
    // Save high score if logged in
    if (userId && userName && gameState.score > 0) {
      saveHighScore(gameState.score);
    }
  }, [gameState.score, saveHighScore, userId, userName]);

  // Game loop
  const gameLoop = useCallback(() => {
    const { snake, food, direction, nextDirection, isGameOver, isPaused, score } = gameState;
    
    if (isGameOver || isPaused) return;
    
    // Update snake position
    const head = { ...snake[0] };
    
    // Set direction based on nextDirection
    const currentDirection = nextDirection;
    
    // Move the head based on direction
    switch (currentDirection) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    
    // Check for collisions with walls
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      handleGameOver();
      return;
    }
    
    // Check for collisions with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }
    
    // Create new snake array with new head
    const newSnake = [head, ...snake];
    
    // Check if snake ate food
    let newFood = food;
    let newScore = score;
    
    if (head.x === food.x && head.y === food.y) {
      // Increase score
      newScore += 10;
      // Place new food
      newFood = placeFood();
    } else {
      // Remove tail if snake didn't eat
      newSnake.pop();
    }
    
    // Update game state
    setGameState({
      snake: newSnake,
      food: newFood,
      direction: currentDirection,
      nextDirection: currentDirection,
      isGameOver: false,
      isPaused: false,
      score: newScore,
    });
    
    // Draw game
    drawGame(newSnake, newFood, newScore);
    
    // Calculate game speed based on score
    const delay = Math.max(50, INITIAL_DELAY - Math.floor(newScore / 100) * 10);
    
    // Schedule next frame
    gameLoopRef.current = setTimeout(() => {
      requestAnimationFrame(gameLoop);
    }, delay) as unknown as number;
  }, [gameState, handleGameOver, placeFood]);

  // Draw game on canvas
  const drawGame = useCallback((
    snake: { x: number; y: number }[],
    food: { x: number; y: number },
    score: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#3a86ff'; // Blue for the snake
    snake.forEach(segment => {
      ctx.fillRect(
        segment.x * actualCellSize,
        segment.y * actualCellSize,
        actualCellSize,
        actualCellSize
      );
      
      // Add border to make the snake segments visible
      ctx.strokeStyle = '#000';
      ctx.strokeRect(
        segment.x * actualCellSize,
        segment.y * actualCellSize,
        actualCellSize,
        actualCellSize
      );
    });
    
    // Draw food
    ctx.fillStyle = '#ff006e'; // Pink for the food
    ctx.fillRect(
      food.x * actualCellSize,
      food.y * actualCellSize,
      actualCellSize,
      actualCellSize
    );
    
    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText(`Score: ${score}`, 5, 15);
  }, [actualCellSize]);

  // Handle key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent arrow keys from scrolling the page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    if (gameState.isGameOver) return;
    
    // Toggle pause with spacebar
    if (e.key === ' ') {
      setGameState(prev => ({
        ...prev,
        isPaused: !prev.isPaused,
      }));
      return;
    }
    
    // Don't change direction if game is paused
    if (gameState.isPaused) return;
    
    // Change direction based on key press
    const { direction } = gameState;
    
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') {
          setGameState(prev => ({
            ...prev,
            nextDirection: 'UP',
          }));
        }
        break;
      case 'ArrowDown':
        if (direction !== 'UP') {
          setGameState(prev => ({
            ...prev,
            nextDirection: 'DOWN',
          }));
        }
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT') {
          setGameState(prev => ({
            ...prev,
            nextDirection: 'LEFT',
          }));
        }
        break;
      case 'ArrowRight':
        if (direction !== 'LEFT') {
          setGameState(prev => ({
            ...prev,
            nextDirection: 'RIGHT',
          }));
        }
        break;
    }
  }, [gameState]);

  // Handle touch controls for mobile
  const handleTouchControl = (direction: Direction) => {
    if (gameState.isGameOver || gameState.isPaused) return;
    
    const { direction: currentDirection } = gameState;
    
    // Prevent reversing direction
    if (
      (direction === 'UP' && currentDirection === 'DOWN') ||
      (direction === 'DOWN' && currentDirection === 'UP') ||
      (direction === 'LEFT' && currentDirection === 'RIGHT') ||
      (direction === 'RIGHT' && currentDirection === 'LEFT')
    ) {
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      nextDirection: direction,
    }));
  };

  // Start or restart game
  const startGame = useCallback(() => {
    // Clear any existing game loop
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Initialize game
    initGame();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
  }, [initGame, gameLoop]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clear game loop on unmount
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [handleKeyDown]);

  // Start game loop when game is not paused
  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver) {
      requestAnimationFrame(gameLoop);
    }
  }, [gameState.isPaused, gameState.isGameOver, gameLoop]);

  // Draw initial game state
  useEffect(() => {
    drawGame(gameState.snake, gameState.food, gameState.score);
  }, [gameState.snake, gameState.food, gameState.score, drawGame]);

  return (
    <div className="flex flex-col items-center">
      <div className="win95-window mb-4 p-2 w-full">
        <div className="win95-window-title font-bold text-sm">
          SNAKE - PUNTUACIÓN: {gameState.score}
        </div>
        <div className="flex justify-center mt-4">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border-2 border-chelas-button-shadow"
          />
        </div>
        
        {/* Game controls */}
        <div className="flex justify-center mt-4 space-x-2">
          <button 
            className="win95-button px-4"
            onClick={startGame}
          >
            {gameState.isGameOver ? 'Reiniciar' : 'Nuevo Juego'}
          </button>
          
          <button 
            className="win95-button px-4"
            onClick={togglePause}
            disabled={gameState.isGameOver}
          >
            {gameState.isPaused ? 'Continuar' : 'Pausa'}
          </button>
        </div>
        
        {/* Mobile touch controls */}
        {isMobile && (
          <div className="mt-4">
            <div className="flex justify-center">
              <button 
                className="win95-button w-12 h-12 flex items-center justify-center"
                onClick={() => handleTouchControl('UP')}
              >
                ▲
              </button>
            </div>
            <div className="flex justify-center space-x-4 my-2">
              <button 
                className="win95-button w-12 h-12 flex items-center justify-center"
                onClick={() => handleTouchControl('LEFT')}
              >
                ◄
              </button>
              <button 
                className="win95-button w-12 h-12 flex items-center justify-center"
                onClick={() => handleTouchControl('RIGHT')}
              >
                ►
              </button>
            </div>
            <div className="flex justify-center">
              <button 
                className="win95-button w-12 h-12 flex items-center justify-center"
                onClick={() => handleTouchControl('DOWN')}
              >
                ▼
              </button>
            </div>
          </div>
        )}
        
        {/* Game instructions */}
        <div className="text-center mt-4 p-2 win95-inset text-xs">
          <p className="mb-1 font-bold">Controles:</p>
          <p>Teclas de dirección: Mover la serpiente</p>
          <p>Barra espaciadora: Pausar/Continuar</p>
          {isMobile && <p>O usa los botones de dirección en pantalla</p>}
        </div>
      </div>
      
      {/* High scores */}
      <div className="win95-window w-full p-2">
        <div className="win95-window-title font-bold text-sm">
          MEJORES PUNTUACIONES
        </div>
        <div className="mt-2">
          {loading ? (
            <p className="text-center p-2">Cargando puntuaciones...</p>
          ) : highScores.length > 0 ? (
            <div className="win95-inset p-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-chelas-gray-dark">
                    <th className="text-left p-1">Jugador</th>
                    <th className="text-right p-1">Puntuación</th>
                    <th className="text-right p-1">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((score, index) => (
                    <tr 
                      key={score.id} 
                      className={`${index % 2 === 0 ? 'bg-chelas-gray-light/30' : ''}`}
                    >
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
            <p className="text-center p-2 text-sm">No hay puntuaciones todavía. ¡Sé el primero!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Snake;
