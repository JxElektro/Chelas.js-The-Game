import React, { useState } from "react"
import { ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

// Definimos la interfaz de cada app.
type AppTutorial = {
  id: string
  name: string
  icon: string
  description: string
  comingSoon?: boolean // Propiedad para indicar si está "próximamente"
}

const apps: AppTutorial[] = [
  {
    id: "mypc",
    name: "Mi PC",
    icon: "💻",
    description: "Guarda tus preferencias y personaliza tu perfil",
  },
  {
    id: "excel",
    name: "Excel",
    icon: "📊",
    description: "Cuántas chelas llevas y registra tus gastos",
  },
  {
    id: "msn",
    name: "MSN Messenger",
    icon: "💬",
    description: "Encuentra preguntas y toma notas para conversaciones",
    comingSoon: false,
  },
  {
    id: "dino",
    name: "Dino Runner",
    icon: "🦖",
    description: "Juego del dinosaurio para desestresarte",
  },
  {
    id: "nightsaver",
    name: "Jhdjsjksh.exe",
    icon: "🌙",
    description: "Guarda la noche y recuerda momentos especiales",
    comingSoon: true,
  },
  {
    id: "downloads",
    name: "Descargas",
    icon: "📁",
    description: "Tus noches pasadas y eventos guardados",
  },
]

export default function Tutorial() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [message, setMessage] = useState<string>("")
  const isMobile = useIsMobile()

  const handleSelectApp = (appId: string, comingSoon?: boolean) => {
    if (comingSoon) {
      setMessage("Esta aplicación estará activa próximamente. ¡Mantente atento!")
      setSelectedApp(null)
      return
    }
    setSelectedApp(appId)
    setMessage("")
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        {/* Sidebar con la lista de aplicaciones */}
        <aside className={`${isMobile ? 'w-full' : 'w-1/3'} md:border-r border-chelas-gray-dark flex flex-col ${selectedApp && isMobile ? 'hidden' : 'flex'}`}>
          {/* Aquí cambiamos a text-white */}
          <div className="bg-chelas-window-title px-2 py-1 text-white font-bold text-xs">
            Aplicaciones
          </div>

          <div className="flex-grow overflow-auto">
            {apps.map((app) => (
              <div
                key={app.id}
                className={`
                  flex items-center p-2 cursor-pointer hover:bg-chelas-gray-light 
                  border-b border-chelas-gray-dark transition-colors
                  ${selectedApp === app.id ? "bg-chelas-gray-light" : ""}
                  ${app.comingSoon ? "opacity-70" : ""}
                `}
                onClick={() => handleSelectApp(app.id, app.comingSoon)}
              >
                <div className="text-xl mr-2">{app.icon}</div>
                <div className="flex-grow text-black">
                  <div className="text-sm font-bold">{app.name}</div>
                  <div className="text-xs truncate">{app.description}</div>
                </div>
                <ChevronRight size={14} className="text-black" />
              </div>
            ))}
          </div>
        </aside>

        {/* Contenido principal */}
        <main className={`${isMobile ? 'w-full' : 'w-2/3'} overflow-auto ${!selectedApp && isMobile ? 'hidden' : 'flex flex-col'}`}>
          {isMobile && selectedApp && (
            <button 
              onClick={() => setSelectedApp(null)} 
              className="win95-button text-black text-xs py-0.5 px-2 mb-2 self-start"
            >
              « Volver a la lista
            </button>
          )}
          
          {message && (
            <div className="mb-4 text-red-600 font-semibold text-sm">
              {message}
            </div>
          )}

          <div className="flex-grow">
            {selectedApp ? (
              <TutorialContent appId={selectedApp} />
            ) : !message && !isMobile ? (
              <EmptyState />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * Muestra el contenido del tutorial según la app seleccionada
 */
const TutorialContent: React.FC<{ appId: string }> = ({ appId }) => {
  const tutorialContent: Record<string, React.ReactNode> = {
    mypc: (
      <div className="space-y-4 text-black">
        <h2 className="text-lg font-bold">Mi PC - Perfil y Preferencias</h2>
        <div className="win95-inset p-3">
          <p className="text-sm mb-3">
            Tu PC personal te permite gestionar tu perfil y configurar tus preferencias
            para mejorar la experiencia social.
          </p>
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold mb-2">Cómo usar:</h3>
            <ol className="text-xs space-y-2 list-decimal pl-4">
              <li>Haz clic en el icono "Mi PC" en el escritorio principal</li>
              <li>Verás tu perfil con tu avatar y estado actual</li>
              <li>Puedes editar tus preferencias haciendo clic en "Editar preferencias"</li>
              <li>Configura tu disponibilidad usando el botón de estado en la barra inferior</li>
            </ol>
          </div>
          <div className="text-xs">
            <p className="font-bold">Consejo:</p>
            <p>Mantén tu perfil actualizado para conectar mejor con personas afines.</p>
          </div>
        </div>
      </div>
    ),
    excel: (
      <div className="space-y-4 text-black">
        <h2 className="text-lg font-bold">Excel - Control de Gastos</h2>
        <div className="win95-inset p-3">
          <p className="text-sm mb-3">
            Excel te permite llevar un registro de tus bebidas y gastos durante el evento.
          </p>
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold mb-2">Cómo usar:</h3>
            <ol className="text-xs space-y-2 list-decimal pl-4">
              <li>Ingresa la descripción de tu bebida (ej. "Cerveza Corona")</li>
              <li>Añade el precio que pagaste</li>
              <li>Haz clic en "Agregar" para registrar el gasto</li>
              <li>Consulta el "Total gastado" para ver cuánto llevas</li>
              <li>Puedes eliminar entradas si cometes un error</li>
            </ol>
          </div>
          <div className="text-xs">
            <p className="font-bold">Consejo:</p>
            <p>Registra tus gastos inmediatamente para mantener un control preciso.</p>
          </div>
        </div>
      </div>
    ),
    msn: (
      <div className="space-y-4 text-black">
        <h2 className="text-lg font-bold">MSN Messenger - Conexiones</h2>
        <div className="win95-inset p-3">
          <p className="text-sm mb-3">
            MSN te permite encontrar personas con intereses similares y ofrece
            temas de conversación iniciales.
          </p>
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold mb-2">Cómo usar:</h3>
            <ol className="text-xs space-y-2 list-decimal pl-4">
              <li>Abre MSN Messenger desde el escritorio</li>
              <li>Verás una lista de personas disponibles para chatear</li>
              <li>Selecciona a alguien para iniciar una conversación</li>
              <li>Utiliza los temas sugeridos por la IA como punto de partida</li>
              <li>Puedes agregar notas, aunque próximamente se guardarán automáticamente</li>
            </ol>
          </div>
          <div className="text-xs">
            <p className="font-bold">Consejo:</p>
            <p>
              Las preguntas generadas por IA se basan en sus intereses compartidos.
              ¡Te ayudarán a romper el hielo!
            </p>
          </div>
        </div>
      </div>
    ),
    dino: (
      <div className="space-y-4 text-black">
        <h2 className="text-lg font-bold">Dino Runner - El Juego del Dinosaurio</h2>
        <div className="win95-inset p-3">
          <p className="text-sm mb-3">
            Relájate jugando al clásico juego del dinosaurio de Chrome mientras tomas un descanso.
          </p>
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold mb-2">Cómo jugar:</h3>
            <ol className="text-xs space-y-2 list-decimal pl-4">
              <li>Abre Dino Runner desde el escritorio</li>
              <li>Presiona Espacio o haz clic para saltar</li>
              <li>Evita los cactus y otros obstáculos</li>
              <li>Tu puntuación aumenta con el tiempo que sobrevivas</li>
              <li>¡Compite por la mejor puntuación!</li>
            </ol>
          </div>
          <div className="text-xs">
            <p className="font-bold">Consejo:</p>
            <p>Es un buen juego para tomar un descanso. ¡Prueba a ver cuánto tiempo puedes sobrevivir!</p>
          </div>
        </div>
      </div>
    ),
    nightsaver: (
      <div className="space-y-4 text-black">
        <h2 className="text-lg font-bold">Jhdjsjksh.exe - Guardado de Noches</h2>
        <div className="win95-inset p-3">
          <p className="text-sm mb-3">
            Esta misteriosa app te permite guardar momentos especiales de tu noche.
          </p>
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold mb-2">Cómo usar:</h3>
            <ol className="text-xs space-y-2 list-decimal pl-4">
              <li>Abre Jhdjsjksh.exe (el icono puede variar)</li>
              <li>Toma fotos o notas de momentos especiales</li>
              <li>Añade etiquetas para recordar personas y lugares</li>
              <li>Guarda la noche con un nombre reconocible</li>
              <li>Revisa tus noches guardadas en la carpeta "Descargas"</li>
            </ol>
          </div>
          <div className="text-xs">
            <p className="font-bold">Consejo:</p>
            <p>
              Está en fase beta. Si encuentras errores, ¡es parte de la experiencia Windows 95!
            </p>
          </div>
        </div>
      </div>
    ),
    downloads: (
      <div className="space-y-4 text-black">
        <h2 className="text-lg font-bold">Descargas - Archivos de Windows</h2>
        <div className="win95-inset p-3">
          <p className="text-sm mb-3">
            Accede a los archivos generados por el instalador de Windows y documentación del sistema.
          </p>
          <div className="mb-3 border-b border-chelas-gray-dark pb-2">
            <h3 className="text-sm font-bold mb-2">Cómo usar:</h3>
            <ol className="text-xs space-y-2 list-decimal pl-4">
              <li>Abre la carpeta "Descargas" desde el escritorio</li>
              <li>Navega por los archivos generados por el instalador</li>
              <li>Haz clic en un archivo para ver su contenido</li>
              <li>Revisa manuales, controladores y registros de instalación</li>
              <li>Guarda los archivos importantes si lo deseas</li>
            </ol>
          </div>
          <div className="text-xs">
            <p className="font-bold">Consejo:</p>
            <p>Los archivos de documentación contienen información importante sobre tu sistema.</p>
          </div>
        </div>
      </div>
    ),
  }

  return (
    <div className="h-full overflow-auto text-sm">
      {tutorialContent[appId] || (
        <div className="p-4 text-black">
          <p>Contenido no disponible para esta aplicación.</p>
        </div>
      )}
    </div>
  )
}

/**
 * Componente de "Empty State" cuando no se ha seleccionado ninguna app
 */
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4 text-black">
    <div className="text-5xl mb-4">📚</div>
    <h2 className="text-lg font-bold mb-2">Bienvenido al Tutorial</h2>
    <p className="text-sm mb-4">
      Selecciona una aplicación de la lista para ver cómo usarla.
    </p>
    <p className="text-xs text-chelas-gray-dark">
      Windows 95 - Tutorial Manager v1.0
    </p>
  </div>
)
