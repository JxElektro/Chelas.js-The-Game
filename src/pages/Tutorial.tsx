
import React from 'react';
import { motion } from 'framer-motion';
import WindowFrame from '@/components/WindowFrame';
import { ChevronRight } from 'lucide-react';

type AppTutorial = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

const apps: AppTutorial[] = [
  {
    id: 'mypc',
    name: 'Mi PC',
    icon: '💻',
    description: 'Guarda tus preferencias y personaliza tu perfil'
  },
  {
    id: 'excel',
    name: 'Excel',
    icon: '📊',
    description: 'Cuantas chelas llevas y registra tus gastos'
  },
  {
    id: 'msn',
    name: 'MSN Messenger',
    icon: '💬',
    description: 'Encuentra preguntas y toma notas para conversaciones'
  },
  {
    id: 'snake',
    name: 'Snake',
    icon: '🐍',
    description: 'La Culebrita, juega para desestresarte'
  },
  {
    id: 'nightsaver',
    name: 'Jhdjsjksh.exe',
    icon: '🌙',
    description: 'Guarda la noche y recuerda momentos especiales'
  },
  {
    id: 'downloads',
    name: 'Descargas',
    icon: '📁',
    description: 'Tus noches pasadas y eventos guardados'
  }
];

const Tutorial = () => {
  const [selectedApp, setSelectedApp] = React.useState<string | null>(null);

  const getSelectedAppDetails = () => {
    return apps.find(app => app.id === selectedApp);
  };

  return (
    <div className="w-full h-full p-2 overflow-hidden">
      <WindowFrame title="Administrador de Tareas - Tutorial">
        <div className="flex h-full">
          {/* Sidebar with app list */}
          <div className="w-1/3 border-r-2 border-chelas-gray-dark">
            <div className="win95-window-title text-sm px-2 py-1">
              Aplicaciones
            </div>
            <div className="overflow-auto h-[calc(100%-30px)]">
              {apps.map((app) => (
                <div 
                  key={app.id}
                  className={`flex items-center p-2 cursor-pointer hover:bg-chelas-gray-light border-b border-chelas-gray-dark 
                    ${selectedApp === app.id ? 'bg-chelas-gray-light' : ''}`}
                  onClick={() => setSelectedApp(app.id)}
                >
                  <div className="text-xl mr-2">{app.icon}</div>
                  <div className="flex-grow">
                    <div className="text-sm font-bold text-black">{app.name}</div>
                    <div className="text-xs text-black truncate">{app.description}</div>
                  </div>
                  <ChevronRight size={14} className="text-black" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="w-2/3 p-3 h-full overflow-auto">
            {selectedApp ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TutorialContent appId={selectedApp} />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-4">📚</div>
                <h2 className="text-lg font-bold mb-2 text-black">Bienvenido al Tutorial</h2>
                <p className="text-sm text-black mb-4">
                  Selecciona una aplicación de la lista para ver cómo usarla.
                </p>
                <p className="text-xs text-chelas-gray-dark">
                  Windows 95 - Tutorial Manager v1.0
                </p>
              </div>
            )}
          </div>
        </div>
      </WindowFrame>
    </div>
  );
};

// Componente para mostrar el contenido del tutorial según la app seleccionada
const TutorialContent = ({ appId }: { appId: string }) => {
  const tutorialContent: Record<string, React.ReactNode> = {
    mypc: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-black">Mi PC - Perfil y Preferencias</h2>
        <div className="win95-inset p-3">
          <p className="text-sm text-black mb-3">
            Tu PC personal te permite gestionar tu perfil y configurar tus preferencias para mejorar la experiencia social.
          </p>
          
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold text-black mb-2">Cómo usar:</h3>
            <ol className="text-xs text-black space-y-2 list-decimal pl-4">
              <li>Haz clic en el icono "Mi PC" en el escritorio principal</li>
              <li>Verás tu perfil con tu avatar y estado actual</li>
              <li>Puedes editar tus preferencias haciendo clic en "Editar preferencias"</li>
              <li>Configura tu disponibilidad usando el botón de estado en la barra inferior</li>
            </ol>
          </div>
          
          <div className="text-xs text-black">
            <p className="font-bold">Consejo:</p>
            <p>Mantén tu perfil actualizado para conectar mejor con otras personas con intereses similares.</p>
          </div>
        </div>
      </div>
    ),
    excel: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-black">Excel - Control de Gastos</h2>
        <div className="win95-inset p-3">
          <p className="text-sm text-black mb-3">
            Excel te permite llevar un registro de tus bebidas y gastos durante el evento.
          </p>
          
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold text-black mb-2">Cómo usar:</h3>
            <ol className="text-xs text-black space-y-2 list-decimal pl-4">
              <li>Ingresa la descripción de tu bebida (ej. "Cerveza Corona")</li>
              <li>Añade el precio que pagaste</li>
              <li>Haz clic en "Agregar" para registrar el gasto</li>
              <li>Consulta el "Total gastado" para ver cuánto llevas en la noche</li>
              <li>Puedes eliminar entradas si cometiste un error</li>
            </ol>
          </div>
          
          <div className="text-xs text-black">
            <p className="font-bold">Consejo:</p>
            <p>Registra tus gastos inmediatamente para mantener un control preciso de tu consumo.</p>
          </div>
        </div>
      </div>
    ),
    msn: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-black">MSN Messenger - Conexiones</h2>
        <div className="win95-inset p-3">
          <p className="text-sm text-black mb-3">
            MSN te permite encontrar personas con intereses similares y ofrece temas de conversación.
          </p>
          
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold text-black mb-2">Cómo usar:</h3>
            <ol className="text-xs text-black space-y-2 list-decimal pl-4">
              <li>Abre MSN Messenger desde el escritorio</li>
              <li>Verás una lista de personas disponibles para chatear</li>
              <li>El sistema mostrará el porcentaje de compatibilidad basado en intereses comunes</li>
              <li>Selecciona una persona para iniciar una conversación</li>
              <li>Utiliza los temas de conversación sugeridos por la IA</li>
            </ol>
          </div>
          
          <div className="text-xs text-black">
            <p className="font-bold">Consejo:</p>
            <p>Las preguntas generadas por IA se basan en sus intereses compartidos, ¡úsalas como punto de partida!</p>
          </div>
        </div>
      </div>
    ),
    snake: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-black">Snake - El Juego Clásico</h2>
        <div className="win95-inset p-3">
          <p className="text-sm text-black mb-3">
            Relájate jugando al clásico juego de la serpiente mientras tomas un descanso.
          </p>
          
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold text-black mb-2">Cómo jugar:</h3>
            <ol className="text-xs text-black space-y-2 list-decimal pl-4">
              <li>Abre Snake desde el escritorio</li>
              <li>Usa las teclas de flecha para controlar la dirección de la serpiente</li>
              <li>Come los puntos para crecer y ganar puntos</li>
              <li>Evita chocar contra los bordes o contra ti mismo</li>
              <li>Intenta conseguir la mayor puntuación posible</li>
            </ol>
          </div>
          
          <div className="text-xs text-black">
            <p className="font-bold">Consejo:</p>
            <p>Es un buen juego para romper el hielo si estás con alguien nuevo. ¡Rétale a una partida!</p>
          </div>
        </div>
      </div>
    ),
    nightsaver: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-black">Jhdjsjksh.exe - Guardado de Noches</h2>
        <div className="win95-inset p-3">
          <p className="text-sm text-black mb-3">
            Esta misteriosa aplicación te permite guardar momentos especiales de tu noche.
          </p>
          
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold text-black mb-2">Cómo usar:</h3>
            <ol className="text-xs text-black space-y-2 list-decimal pl-4">
              <li>Abre Jhdjsjksh.exe (icono puede variar según versión)</li>
              <li>Toma fotos o notas de momentos especiales</li>
              <li>Añade etiquetas para recordar personas y lugares</li>
              <li>Guarda la noche con un nombre reconocible</li>
              <li>Revisa tus noches guardadas en la carpeta "Descargas"</li>
            </ol>
          </div>
          
          <div className="text-xs text-black">
            <p className="font-bold">Consejo:</p>
            <p>Esta aplicación está en fase beta. Si encuentras errores, es parte de la experiencia Windows 95.</p>
          </div>
        </div>
      </div>
    ),
    downloads: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-black">Descargas - Historial de Noches</h2>
        <div className="win95-inset p-3">
          <p className="text-sm text-black mb-3">
            Accede al historial de tus noches y eventos guardados anteriormente.
          </p>
          
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold text-black mb-2">Cómo usar:</h3>
            <ol className="text-xs text-black space-y-2 list-decimal pl-4">
              <li>Abre la carpeta "Descargas" desde el escritorio</li>
              <li>Navega por las diferentes noches guardadas</li>
              <li>Haz clic en una noche para ver sus detalles</li>
              <li>Revisa fotos, notas y contactos de esa noche</li>
              <li>Exporta memorias o compártelas si lo deseas</li>
            </ol>
          </div>
          
          <div className="text-xs text-black">
            <p className="font-bold">Consejo:</p>
            <p>Las noches más antiguas se archivan automáticamente, pero siempre puedes acceder a ellas.</p>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="h-full overflow-auto">
      {tutorialContent[appId] || (
        <div className="text-center p-4 text-black">
          Contenido no disponible para esta aplicación.
        </div>
      )}
    </div>
  );
};

export default Tutorial;
