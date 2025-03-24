import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
  MouseEvent,
} from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

//
// Configuraciones generales del juego
//
const GRID_SIZE = 20;          // Cantidad de celdas horizontal y vertical
const INITIAL_DELAY = 150;     // Velocidad inicial (ms). Cuanto menor, más rápido
const SCORE_INCREMENT = 10;    // Puntos que sumas cada vez que comes comida

// Tipos de dirección
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Estado del juego
interface GameState {
  snake: { x: number; y: number }[];  // Piezas de la serpiente
  food: { x: number; y: number };     // Posición de la comida
  direction: Direction;               // Dirección actual
  nextDirection: Direction;           // Dirección siguiente (evita bugs de cambio simultáneo)
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

const Snake: React.FC = () => {
  //
  // Referencia al canvas donde dibujamos
  //
  const canvasRef = useRef<HTMLCanvasElement>(null);

  //
  // Estado del juego
  //
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 5, y: 5 },
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    isGameOver: false,
    isPaused: true,
    score: 0,
  });

  //
  // Lista de puntuaciones altas
  //
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(false);

  //
  // Datos del usuario (para guardar puntuaciones en Supabase)
  //
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  //
  // Control de animación
  //
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const currentDelayRef = useRef<number>(INITIAL_DELAY);

  //
  // Hook para detectar si es móvil
  //
  const isMobile = useIsMobile();

  //
  // Dimensiones del canvas
  // - Limito a un tamaño máximo de 400 en desktop o 300 en móvil para buena visibilidad
  //
  const canvasSize = isMobile ? 300 : 400;
  const cellSize = canvasSize / GRID_SIZE; // Tamaño de cada celda en pixeles

  //
  // Cargar usuario y puntuaciones altas al montar el componente
  //
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUserId(data.session.user.id);

        // Obtener el nombre del perfil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.session.user.id)
          .single();

        if (profileData) setUserName(profileData.name);
      }
    };

    checkUser();
    fetchHighScores();
  }, []);

  //
  // Función para obtener puntuaciones altas de Supabase
  //
  const fetchHighScores = async () => {
    setLoading(true);
    try {
      // Reemplaza 'get_snake_high_scores' con tu nombre de RPC o la query que uses
      const { data, error } = await supabase.rpc('get_snake_high_scores');
      if (error) throw error;
      if (data) {
        setHighScores(data as HighScore[]);
      }
    } catch (error) {
      console.error('Error fetching high scores:', error);
      toast.error('Error al cargar las puntuaciones');
      setHighScores([]);
    } finally {
      setLoading(false);
    }
  };

  //
  // Función para guardar la puntuación en Supabase
  //
  const saveHighScore = async (score: number) => {
    if (!userId || !userName) return;
    try {
      // Reemplaza 'add_snake_high_score' con tu RPC o insert directo
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

  //
  // Función para colocar comida en posición aleatoria
  //
  const placeFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  //
  // Manejo de Game Over
  //
  const handleGameOver = useCallback(() => {
    cancelAnimationFrame(requestRef.current);
    setGameState((prev) => ({
      ...prev,
      isGameOver: true,
      isPaused: true,
    }));
    // Guardar puntuación en DB
    if (userId && userName && gameState.score > 0) {
      saveHighScore(gameState.score);
    }
  }, [gameState.score, userId, userName, saveHighScore]);

  //
  // Función para dibujar todo en el canvas
  //
  const drawGame = useCallback(
    (snake: { x: number; y: number }[], food: { x: number; y: number }, score: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Limpio el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar la serpiente
      ctx.fillStyle = '#3a86ff';
      ctx.strokeStyle = '#000';
      snake.forEach((segment) => {
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
        ctx.strokeRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
      });

      // Dibujar la comida
      ctx.fillStyle = '#ff006e';
      ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);

      // Dibujar el score arriba a la izquierda
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Puntos: ${score}`, 5, 15);
    },
    [cellSize]
  );

  //
  // Lógica principal de actualizar la serpiente, colisiones, etc.
  //
  const updateGame = useCallback(
    (deltaTime: number) => {
      // No hago nada si está pausado o terminado
      if (gameState.isPaused || gameState.isGameOver) return;

      const { snake, food, direction, nextDirection, score } = gameState;
      let newSnake = [...snake];

      // Actualizo dirección
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

      // Comprobar colisiones con paredes
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver();
        return;
      }

      // Comprobar colisiones con uno mismo
      if (newSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        handleGameOver();
        return;
      }

      newSnake.unshift(head); // Agregar la nueva cabeza al inicio

      // Comer comida
      let newFood = { ...food };
      let newScore = score;
      if (head.x === food.x && head.y === food.y) {
        newScore += SCORE_INCREMENT;
        newFood = placeFood();
      } else {
        // Quitar la cola
        newSnake.pop();
      }

      // Ajustar velocidad en función de la puntuación
      currentDelayRef.current = Math.max(
        50,
        INITIAL_DELAY - Math.floor(newScore / 100) * 10
      );

      // Actualizar el estado y redibujar
      setGameState((prev) => ({
        ...prev,
        snake: newSnake,
        food: newFood,
        direction: currentDirection,
        nextDirection: currentDirection,
        score: newScore,
      }));
      drawGame(newSnake, newFood, newScore);
    },
    [gameState, drawGame, handleGameOver, placeFood]
  );

  //
  // Bucle de animación con requestAnimationFrame
  // DeltaTime controla la frecuencia de actualización según currentDelayRef
  //
  const animate = useCallback(
    (time: number) => {
      const deltaTime = time - previousTimeRef.current;
      previousTimeRef.current = time;
      accumulatedTimeRef.current += deltaTime;

      // Solo actualizo si pasa el "delay" configurado
      if (accumulatedTimeRef.current > currentDelayRef.current) {
        accumulatedTimeRef.current = 0;
        updateGame(deltaTime);
      }
      requestRef.current = requestAnimationFrame(animate);
    },
    [updateGame]
  );

  //
  // Función para iniciar o reiniciar el juego
  //
  const startGame = useCallback(() => {
    cancelAnimationFrame(requestRef.current);
    // Estado inicial
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

  //
  // Manejo de pausa
  //
  const togglePause = () => {
    if (gameState.isGameOver) return; // no pausar si ya terminó
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  //
  // Manejo de teclas (desktop)
  //
  const handleKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      const { isGameOver, isPaused, direction } = gameState;

      // Evitar scroll
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (isGameOver) return;

      // Barra espaciadora: pausa
      if (e.key === ' ') {
        togglePause();
        return;
      }

      // Si está en pausa, no cambio dirección
      if (isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') {
            setGameState((prev) => ({ ...prev, nextDirection: 'UP' }));
          }
          break;
        case 'ArrowDown':
          if (direction !== 'UP') {
            setGameState((prev) => ({ ...prev, nextDirection: 'DOWN' }));
          }
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') {
            setGameState((prev) => ({ ...prev, nextDirection: 'LEFT' }));
          }
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') {
            setGameState((prev) => ({ ...prev, nextDirection: 'RIGHT' }));
          }
          break;
      }
    },
    [gameState, togglePause]
  );

  //
  // Manejo de toques en pantalla (móvil)
  //
  const handleTouchControl = (newDir: Direction) => {
    if (gameState.isGameOver || gameState.isPaused) return;
    const { direction } = gameState;
    // Evitar direcciones opuestas
    if (
      (newDir === 'UP' && direction !== 'DOWN') ||
      (newDir === 'DOWN' && direction !== 'UP') ||
      (newDir === 'LEFT' && direction !== 'RIGHT') ||
      (newDir === 'RIGHT' && direction !== 'LEFT')
    ) {
      setGameState((prev) => ({ ...prev, nextDirection: newDir }));
    }
  };

  //
  // Listeners de teclado
  //
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  //
  // Dibujar el estado actual al montar y cada cambio
  //
  useEffect(() => {
    // Al inicio, dibujo el estado por si el canvas está en blanco
    drawGame(gameState.snake, gameState.food, gameState.score);
  }, [drawGame, gameState.snake, gameState.food, gameState.score]);

  //
  // Controlar la animación (arranca solo si no está pausado y no está game over)
  //
  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState.isPaused, gameState.isGameOver, animate]);

  //
  // Render
  //
  return (
    <div className="flex flex-col items-center w-full">
      {/* Ventana principal del juego */}
      <div className="win95-window mb-4 w-full p-2">
        <div className="win95-window-title font-bold text-sm">
          SNAKE - PUNTUACIÓN: {gameState.score}
        </div>

        {/* Contenedor del canvas */}
        <div className="flex justify-center mt-4">
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="border-2 border-chelas-button-shadow"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex justify-center mt-4 space-x-2">
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

        {/* Controles táctiles para móvil */}
        {isMobile && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex justify-center">
              <button
                className="win95-button w-12 h-12 flex items-center justify-center"
                onClick={() => handleTouchControl('UP')}
              >
                ▲
              </button>
            </div>
            <div className="flex justify-center w-full">
              <button
                className="win95-button w-12 h-12 flex items-center justify-center mr-8"
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

        {/* Instrucciones */}
        <div className="win95-inset text-xs p-2 mt-4">
          <p className="mb-1 font-bold">Controles:</p>
          <p>Flechas: Mover la serpiente</p>
          <p>Espacio: Pausar/Continuar</p>
          {isMobile && <p>O usa los botones de dirección en pantalla</p>}
        </div>
      </div>

      {/* Ventana de las puntuaciones altas */}
      <div className="win95-window w-full p-2">
        <div className="win95-window-title font-bold text-sm">
          PUNTUACIONES MÁXIMAS
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
                  {highScores.map((score) => (
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
            <p className="text-center p-2 text-sm">
              No hay puntuaciones todavía. ¡Sé el primero!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Snake;
