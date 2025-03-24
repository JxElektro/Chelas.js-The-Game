import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

// Configuraciones generales
const GRID_SIZE = 20;
const INITIAL_DELAY = 150; // Cuanto menor, más rápido
const SCORE_INCREMENT = 10;

// Tipos de dirección
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Estado del juego
interface GameState {
  snake: { x: number; y: number }[];  // Piezas de la serpiente
  food: { x: number; y: number };     // Posición de la comida
  direction: Direction;               // Dirección actual
  nextDirection: Direction;           // Dirección siguiente
  isGameOver: boolean;
  isPaused: boolean;
  score: number;
}

// Estructura de puntuación alta
interface HighScore {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  created_at: string;
}

export default function Snake() {
  // Referencia al canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estado del juego
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 5, y: 5 },
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    isGameOver: false,
    isPaused: true,
    score: 0,
  });

  // Lista de puntuaciones altas
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);

  // Datos del usuario
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Control de animación
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const currentDelayRef = useRef<number>(INITIAL_DELAY);

  // Ver si es móvil
  const isMobile = useIsMobile();

  // Ajustar tamaño del canvas
  const canvasSize = isMobile ? 300 : 400;
  const cellSize = canvasSize / GRID_SIZE;

  // Cargar usuario y puntuaciones
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUserId(data.session.user.id);
        // Obtener nombre de perfil
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

  // Obtener puntuaciones de Supabase
  const fetchHighScores = async () => {
    setLoadingScores(true);
    try {
      // Llama a tu RPC o a tu tabla
      const { data, error } = await supabase.rpc('get_snake_high_scores');
      if (error) throw error;
      if (data) setHighScores(data as HighScore[]);
    } catch (error) {
      console.error('Error fetching high scores:', error);
      toast.error('Error al cargar puntuaciones');
      setHighScores([]);
    } finally {
      setLoadingScores(false);
    }
  };

  // Guardar puntuación en Supabase
  const saveHighScore = async (score: number) => {
    if (!userId || !userName) return;
    try {
      const { error } = await supabase.rpc('add_snake_high_score', {
        user_id_param: userId,
        user_name_param: userName,
        score_param: score,
      });
      if (error) throw error;
      toast.success('¡Puntuación guardada!');
      fetchHighScores();
    } catch (error) {
      console.error('Error saving high score:', error);
      toast.error('Error al guardar la puntuación');
    }
  };

  // Colocar comida en posición aleatoria
  const placeFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  // Manejo de Game Over
  const handleGameOver = useCallback(() => {
    cancelAnimationFrame(requestRef.current);
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      isPaused: true,
    }));
    // Guardar puntuación si hay puntaje
    if (userId && userName && gameState.score > 0) {
      saveHighScore(gameState.score);
    }
  }, [gameState.score, userId, userName]);

  // Dibujar todo en el canvas
  const drawGame = useCallback((snake, food, score) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar serpiente
    ctx.fillStyle = '#3a86ff';
    ctx.strokeStyle = '#000';
    snake.forEach(segment => {
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
      ctx.strokeRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    });

    // Dibujar comida
    ctx.fillStyle = '#ff006e';
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);

    // Dibujar score en la esquina
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Puntos: ${score}`, 5, 15);
  }, [cellSize]);

  // Actualizar lógica
  const updateGame = useCallback((deltaTime: number) => {
    if (gameState.isPaused || gameState.isGameOver) return;

    const { snake, food, direction, nextDirection, score } = gameState;
    const newSnake = [...snake];

    // Actualizar dirección
    const currentDirection = nextDirection;
    // Calcular nueva cabeza
    const head = { ...newSnake[0] };
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

    // Colisión con paredes
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      handleGameOver();
      return;
    }

    // Colisión con sí misma
    if (newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
      handleGameOver();
      return;
    }

    // Agregar cabeza
    newSnake.unshift(head);

    let newFood = { ...food };
    let newScore = score;

    // Comer comida
    if (head.x === food.x && head.y === food.y) {
      newScore += SCORE_INCREMENT;
      newFood = placeFood();
    } else {
      // Quitar cola
      newSnake.pop();
    }

    // Ajustar velocidad en función del score
    currentDelayRef.current = Math.max(
      50,
      INITIAL_DELAY - Math.floor(newScore / 100) * 10
    );

    // Actualizar estado y redibujar
    setGameState(prev => ({
      ...prev,
      snake: newSnake,
      food: newFood,
      direction: currentDirection,
      nextDirection: currentDirection,
      score: newScore,
    }));
    drawGame(newSnake, newFood, newScore);
  }, [gameState, drawGame, handleGameOver, placeFood]);

  // Animación con requestAnimationFrame
  const animate = useCallback((time: number) => {
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;
    accumulatedTimeRef.current += deltaTime;

    if (accumulatedTimeRef.current > currentDelayRef.current) {
      accumulatedTimeRef.current = 0;
      updateGame(deltaTime);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [updateGame]);

  // Iniciar/Reiniciar
  const startGame = useCallback(() => {
    cancelAnimationFrame(requestRef.current);
    setGameState({
      snake: [{ x: 10, y: 10 }],
      food: placeFood(),
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      isGameOver: false,
      isPaused: false,
      score: 0,
    });
    accumulatedTimeRef.current = 0;
    previousTimeRef.current = 0;
    currentDelayRef.current = INITIAL_DELAY;
    requestRef.current = requestAnimationFrame(animate);
  }, [animate, placeFood]);

  // Pausar
  const togglePause = () => {
    if (gameState.isGameOver) return;
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  // Manejo de teclas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { isGameOver, isPaused, direction } = gameState;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (isGameOver) return;
      if (e.key === ' ') {
        togglePause();
        return;
      }
      if (isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') {
            setGameState(prev => ({ ...prev, nextDirection: 'UP' }));
          }
          break;
        case 'ArrowDown':
          if (direction !== 'UP') {
            setGameState(prev => ({ ...prev, nextDirection: 'DOWN' }));
          }
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') {
            setGameState(prev => ({ ...prev, nextDirection: 'LEFT' }));
          }
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') {
            setGameState(prev => ({ ...prev, nextDirection: 'RIGHT' }));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, togglePause]);

  // Dibujar en canvas al montar o cambiar
  useEffect(() => {
    drawGame(gameState.snake, gameState.food, gameState.score);
  }, [drawGame, gameState.snake, gameState.food, gameState.score]);

  // Controlar animación
  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState.isPaused, gameState.isGameOver, animate]);

  // Para controles táctiles
  const handleTouchControl = (newDir: Direction) => {
    if (gameState.isGameOver || gameState.isPaused) return;
    const { direction } = gameState;
    if (
      (newDir === 'UP' && direction !== 'DOWN') ||
      (newDir === 'DOWN' && direction !== 'UP') ||
      (newDir === 'LEFT' && direction !== 'RIGHT') ||
      (newDir === 'RIGHT' && direction !== 'LEFT')
    ) {
      setGameState(prev => ({ ...prev, nextDirection: newDir }));
    }
  };

  // Render
  return (
    <div className="flex flex-col h-full min-h-0 p-2 text-black">
      {/* Título y score */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-sm sm:text-base">
          SNAKE - Puntos: {gameState.score}
        </h2>
        {!gameState.isGameOver && (
          <span className="text-xs sm:text-sm">
            {gameState.isPaused ? 'Pausado' : 'En juego'}
          </span>
        )}
      </div>

      {/* Canvas centrado */}
      <div className="flex justify-center mb-2">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="border border-chelas-gray-dark"
        />
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-center space-x-2 mb-2">
        <button className="win95-button px-4" onClick={startGame}>
          {gameState.isGameOver ? 'Reiniciar' : 'Nuevo Juego'}
        </button>
        <button
          className="win95-button px-4"
          onClick={togglePause}
          disabled={gameState.isGameOver}
        >
          {gameState.isPaused ? 'Continuar' : 'Pausar'}
        </button>
      </div>

      {/* Si es móvil, controles táctiles (grid) */}
      {isMobile && (
        <div className="grid grid-cols-3 gap-2 items-center justify-items-center mb-4">
          {/* Botón Up en la fila de arriba */}
          <div />
          <button
            className="win95-button w-12 h-12"
            onClick={() => handleTouchControl('UP')}
          >
            ▲
          </button>
          <div />
          {/* Botón Left, Botón Right en la segunda fila */}
          <button
            className="win95-button w-12 h-12"
            onClick={() => handleTouchControl('LEFT')}
          >
            ◄
          </button>
          <div />
          <button
            className="win95-button w-12 h-12"
            onClick={() => handleTouchControl('RIGHT')}
          >
            ►
          </button>
          {/* Botón Down en la tercera fila */}
          <div />
          <button
            className="win95-button w-12 h-12"
            onClick={() => handleTouchControl('DOWN')}
          >
            ▼
          </button>
          <div />
        </div>
      )}

      {/* High scores (puntuaciones máximas) */}
      <div className="border-2 border-chelas-gray-dark flex-grow min-h-0 overflow-auto p-2">
        <h3 className="font-bold text-sm mb-2">Puntuaciones Máximas</h3>
        {loadingScores ? (
          <p className="text-center text-sm">Cargando...</p>
        ) : highScores.length > 0 ? (
          <div className="win95-inset p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-chelas-gray-dark">
                  <th className="text-left p-1">Jugador</th>
                  <th className="text-right p-1">Puntos</th>
                  <th className="text-right p-1">Fecha</th>
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
            No hay puntuaciones todavía. ¡Sé el primero!
          </p>
        )}
      </div>
    </div>
  );
}
