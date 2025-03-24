
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Wifi, WifiOff, ChevronUp } from 'lucide-react';
import WindowFrame from './WindowFrame';
import { supabase } from '@/integrations/supabase/client';
import Lobby from '@/pages/Lobby';
import { toast } from 'sonner';

// Desktop application icons
interface DesktopIcon {
  id: string;
  title: string;
  icon: string;
  component: React.ReactNode;
}

const Desktop: React.FC = () => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [time, setTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Desktop applications
  const applications: DesktopIcon[] = [
    {
      id: 'msn',
      title: 'MSN Messenger',
      icon: '💬',
      component: <Lobby />
    },
    {
      id: 'excel',
      title: 'Excel',
      icon: '📊',
      component: <div className="p-4">Excel module will be implemented here</div>
    },
    {
      id: 'mypc',
      title: 'My PC',
      icon: '💻',
      component: <div className="p-4">My PC module will be implemented here</div>
    },
    {
      id: 'snake',
      title: 'Snake',
      icon: '🐍',
      component: <div className="p-4">Snake game will be implemented here</div>
    },
    {
      id: 'downloads',
      title: 'Descargas',
      icon: '📁',
      component: <div className="p-4">Downloads folder will be implemented here</div>
    }
  ];

  useEffect(() => {
    // Update clock every minute
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 60000);

    // Check authentication status
    checkAuthStatus();

    return () => clearInterval(intervalId);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return;
      }

      const userId = sessionData.session.user.id;
      
      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, is_available')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }
      
      if (userProfile) {
        setCurrentUser({
          id: userProfile.id,
          name: userProfile.name || 'Usuario'
        });
        setIsAvailable(userProfile.is_available || true);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const handleToggleAvailability = async () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para cambiar tu disponibilidad');
      return;
    }
    
    try {
      const newStatus = !isAvailable;
      setIsAvailable(newStatus);
      
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_available: newStatus })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      toast.success(newStatus 
        ? 'Ahora estás disponible para chatear' 
        : 'Ya no estás disponible para chatear');
        
    } catch (err) {
      console.error('Error changing availability:', err);
      setIsAvailable(!isAvailable); // Revert local change
      toast.error('Error al cambiar tu estado de disponibilidad');
    }
  };

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const openApplication = (appId: string) => {
    if (!openWindows.includes(appId)) {
      setOpenWindows([...openWindows, appId]);
    }
    setActiveWindow(appId);
    setIsStartMenuOpen(false);
  };

  const closeApplication = (appId: string) => {
    setOpenWindows(openWindows.filter(id => id !== appId));
    if (activeWindow === appId) {
      setActiveWindow(openWindows.length > 1 ? openWindows[openWindows.length - 2] : null);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-chelas-window-bg overflow-hidden">
      {/* Desktop area */}
      <div className="flex-grow relative p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start">
        {/* Desktop icons */}
        {applications.map((app) => (
          <div 
            key={app.id}
            className="flex flex-col items-center cursor-pointer p-2 hover:bg-chelas-button-face/30"
            onClick={() => openApplication(app.id)}
            onDoubleClick={() => openApplication(app.id)}
          >
            <div className="text-4xl mb-1">{app.icon}</div>
            <span className="text-sm text-center font-ms-sans">{app.title}</span>
          </div>
        ))}

        {/* Application windows */}
        <AnimatePresence>
          {openWindows.map((appId) => {
            const app = applications.find(a => a.id === appId);
            if (!app) return null;
            
            return (
              <motion.div
                key={appId}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  zIndex: activeWindow === appId ? 10 : 1
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute top-10 left-10 w-4/5 h-4/5 md:w-3/4 md:h-3/4"
                onClick={() => setActiveWindow(appId)}
              >
                <WindowFrame 
                  title={app.title}
                  onClose={() => closeApplication(appId)}
                  className={`h-full ${activeWindow === appId ? 'shadow-lg' : 'opacity-90'}`}
                >
                  <div className="h-full overflow-auto">
                    {app.component}
                  </div>
                </WindowFrame>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Taskbar */}
      <div className="w-full bg-chelas-button-face border-t-2 border-chelas-button-highlight">
        <div className="flex items-center justify-between h-10 px-2">
          {/* Start button */}
          <div className="flex items-center space-x-2">
            <button 
              className={`win95-button flex items-center space-x-1 ${isStartMenuOpen ? 'shadow-win95-button-pressed' : ''}`}
              onClick={toggleStartMenu}
            >
              <span className="font-bold">Inicio</span>
              {isStartMenuOpen && <ChevronUp size={12} />}
            </button>
            
            {/* Open application tabs */}
            <div className="flex space-x-1">
              {openWindows.map((appId) => {
                const app = applications.find(a => a.id === appId);
                if (!app) return null;
                
                return (
                  <button 
                    key={appId}
                    className={`win95-button px-2 py-1 text-xs truncate max-w-[100px] sm:max-w-xs 
                      ${activeWindow === appId ? 'shadow-win95-button-pressed' : ''}`}
                    onClick={() => setActiveWindow(appId)}
                  >
                    <span className="mr-1">{app.icon}</span>
                    {app.title}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* System tray */}
          <div className="flex items-center space-x-2">
            {/* Availability toggle */}
            <button 
              className="h-8 w-8 flex items-center justify-center hover:bg-chelas-button-highlight/20"
              onClick={handleToggleAvailability}
              title={isAvailable ? 'Disponible' : 'No disponible'}
            >
              {isAvailable ? (
                <Wifi size={16} className="text-green-600" />
              ) : (
                <WifiOff size={16} className="text-red-600" />
              )}
            </button>
            
            {/* Clock */}
            <div className="win95-inset px-2 py-1 text-sm">
              {formatTime(time)}
            </div>
          </div>
        </div>
        
        {/* Start menu */}
        <AnimatePresence>
          {isStartMenuOpen && (
            <motion.div 
              className="absolute bottom-10 left-0 w-64 bg-chelas-button-face border-2 shadow-win95 z-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-chelas-window-title py-4 px-2 flex items-center">
                <div className="font-bold text-white">Windows 95</div>
              </div>
              <div className="p-2 space-y-1">
                {applications.map((app) => (
                  <div 
                    key={app.id}
                    className="flex items-center p-2 hover:bg-chelas-window-title hover:text-white cursor-pointer"
                    onClick={() => openApplication(app.id)}
                  >
                    <div className="text-xl mr-3">{app.icon}</div>
                    <span>{app.title}</span>
                  </div>
                ))}
                <div className="border-t border-chelas-gray-dark my-2"></div>
                <div 
                  className="flex items-center p-2 hover:bg-chelas-window-title hover:text-white cursor-pointer"
                  onClick={() => {
                    setIsStartMenuOpen(false);
                    supabase.auth.signOut().then(() => {
                      window.location.href = '/login';
                    });
                  }}
                >
                  <div className="text-xl mr-3">🚪</div>
                  <span>Cerrar sesión</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Desktop;
