import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Wifi, WifiOff, ChevronUp, X, Minus, Star, Shield } from 'lucide-react';
import WindowFrame from './WindowFrame';
import { supabase } from '@/integrations/supabase/client';
import Lobby from '@/pages/Lobby';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import Avatar, { AvatarType } from '@/components/Avatar';
import DinoGame from '@/components/DinoGame';
import DrinkExpenses from '@/components/DrinkExpenses';
import Tutorial from '@/pages/Tutorial';
import ProfileInfoTab from '@/components/ProfileInfoTab';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessengerWithFavorites from '@/components/MessengerWithFavorites';
import VirusReport from '@/components/VirusReport';

interface DesktopIcon {
  id: string;
  title: string;
  icon: string;
  component: React.ReactNode;
}

const Desktop: React.FC = () => {
  const navigate = useNavigate();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [time, setTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatar?: AvatarType;
  } | null>(null);
  const [personalNote, setPersonalNote] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  const handleToggleAvailability = async () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para cambiar tu disponibilidad');
      return;
    }
    
    try {
      const newStatus = !isAvailable;
      setIsAvailable(newStatus);
      
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
      setIsAvailable(!isAvailable);
      toast.error('Error al cambiar tu estado de disponibilidad');
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para guardar tu perfil');
      return;
    }
    
    try {
      console.log("Guardando perfil con datos:", {
        nombre: profileData.name,
        descripcion: personalNote,
        redes: {
          instagram: profileData.instagram,
          twitter: profileData.twitter,
          linkedin: profileData.linkedin
        }
      });
      
      const { data: currentProfileData, error: fetchError } = await supabase
        .from('profiles')
        .select('super_profile')
        .eq('id', currentUser.id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }
      
      console.log("Current profile data:", currentProfileData);
      
      const currentSuperProfile = currentProfileData?.super_profile || {};
      
      const updatedSuperProfile: any = {
        ...(typeof currentSuperProfile === 'object' ? currentSuperProfile : {}),
        redes_sociales: {
          instagram: profileData.instagram || '',
          twitter: profileData.twitter || '',
          linkedin: profileData.linkedin || ''
        }
      };
      
      console.log("Updated super_profile:", updatedSuperProfile);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          descripcion_personal: personalNote,
          super_profile: updatedSuperProfile
        })
        .eq('id', currentUser.id);
      
      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      toast.success('Perfil actualizado correctamente');
      
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      toast.error('No se pudo guardar el perfil');
    }
  };

  const applications: DesktopIcon[] = [
    {
      id: 'msn',
      title: 'MSN Live',
      icon: '🦋',
      component: <MessengerWithFavorites />
    },
    {
      id: 'excel',
      title: 'Excel',
      icon: '📊',
      component: <DrinkExpenses />
    },
    {
      id: 'mypc',
      title: 'Mi PC',
      icon: '💻',
      component: 
        <ScrollArea className="h-full overflow-auto">
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-black text-lg">Cargando perfil...</p>
              </div>
            ) : currentUser ? (
              <div className="flex flex-col">
                <div className="flex items-center mb-4">
                  <Avatar type={currentUser.avatar || 'user'} size="lg" />
                  <div className="ml-4">
                    <h2 className="text-black text-lg font-bold">{profileData.name || currentUser.name || 'Usuario'}</h2>
                    <p className="text-sm text-chelas-gray-dark">
                      Estado: {isAvailable ? 'Disponible para chatear' : 'No disponible'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <ProfileInfoTab
                    profileData={profileData}
                    onProfileDataChange={(data) => {
                      console.log("Updating profile data:", data);
                      setProfileData({ ...profileData, ...data });
                    }}
                    personalNote={personalNote}
                    onPersonalNoteChange={(value) => {
                      console.log("Updating personal note:", value);
                      setPersonalNote(value);
                    }}
                  />
                  
                  <div className="flex justify-between mt-4">
                    <button 
                      className="win95-button mt-4"
                      onClick={handleSaveProfile}
                    >
                      Guardar cambios
                    </button>
                    
                    <button 
                      className="win95-button mt-4 flex items-center"
                      onClick={() => navigate('/interests')}
                    >
                      <Star size={18} className="mr-2 text-black" />
                      Preferencias
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-black text-lg">No se pudo cargar el perfil</p>
              </div>
            )}
          </div>
        </ScrollArea>
    },
    {
      id: 'dino',
      title: 'Dino Runner',
      icon: '🦖',
      component: <DinoGame />
    },
    {
      id: 'downloads',
      title: 'Descargas',
      icon: '📁',
      component: <VirusReport />
    },
    {
      id: 'tutorial',
      title: 'Tutorial',
      icon: '📚',
      component: <Tutorial />
    },
    {
      id: 'avast',
      title: 'Avast Antivirus',
      icon: '🛡️',
      component: <VirusReport />
    }
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    checkAuthStatus();

    return () => clearInterval(intervalId);
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        throw sessionError;
      }
      
      if (!sessionData.session) {
        console.log("No session found, redirecting to login");
        navigate('/login');
        return;
      }

      const userId = sessionData.session.user.id;
      console.log("User ID:", userId);
      
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, avatar, is_available, descripcion_personal, super_profile')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Error al cargar tu perfil');
        setIsLoading(false);
        return;
      }
      
      console.log("Loaded profile:", userProfile);
      
      if (userProfile) {
        setCurrentUser({
          id: userProfile.id,
          name: userProfile.name || 'Usuario',
          avatar: userProfile.avatar as AvatarType
        });
        
        setIsAvailable(userProfile.is_available || true);
        setPersonalNote(userProfile.descripcion_personal || '');
        
        const newProfileData = {
          name: userProfile.name || '',
          instagram: '',
          twitter: '',
          linkedin: ''
        };
        
        if (userProfile.super_profile) {
          console.log("Super profile found:", userProfile.super_profile);
          const superProfile = 
            typeof userProfile.super_profile === 'string' 
              ? JSON.parse(userProfile.super_profile)
              : userProfile.super_profile;
              
          if (superProfile && superProfile.redes_sociales) {
            console.log("Social networks found:", superProfile.redes_sociales);
            newProfileData.instagram = superProfile.redes_sociales.instagram || '';
            newProfileData.twitter = superProfile.redes_sociales.twitter || '';
            newProfileData.linkedin = superProfile.redes_sociales.linkedin || '';
          }
        }
        
        setProfileData(newProfileData);
        console.log("Profile data set:", newProfileData);
        
        if (!userProfile.is_available) {
          try {
            await supabase
              .from('profiles')
              .update({ is_available: true })
              .eq('id', userProfile.id);
            
            setIsAvailable(true);
          } catch (updateError) {
            console.error("Error updating availability:", updateError);
          }
        }
      } else {
        console.log("No profile found for user", userId);
        toast.error('No se encontró tu perfil');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      toast.error('Error al verificar tu sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const openApplication = (appId: string) => {
    if (minimizedWindows.includes(appId)) {
      setMinimizedWindows(minimizedWindows.filter(id => id !== appId));
      setActiveWindow(appId);
      return;
    }
    
    if (!openWindows.includes(appId)) {
      setOpenWindows([...openWindows, appId]);
    }
    setActiveWindow(appId);
    setIsStartMenuOpen(false);
  };

  const minimizeApplication = (appId: string) => {
    if (!minimizedWindows.includes(appId)) {
      setMinimizedWindows([...minimizedWindows, appId]);
    }
    
    const availableWindows = openWindows.filter(
      id => id !== appId && !minimizedWindows.includes(id)
    );
    
    if (availableWindows.length > 0) {
      setActiveWindow(availableWindows[availableWindows.length - 1]);
    } else {
      setActiveWindow(null);
    }
  };

  const closeApplication = (appId: string) => {
    setOpenWindows(openWindows.filter(id => id !== appId));
    setMinimizedWindows(minimizedWindows.filter(id => id !== appId));
    
    if (activeWindow === appId) {
      const availableWindows = openWindows.filter(
        id => id !== appId && !minimizedWindows.includes(id)
      );
      
      if (availableWindows.length > 0) {
        setActiveWindow(availableWindows[availableWindows.length - 1]);
      } else {
        setActiveWindow(null);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = async () => {
    if (currentUser) {
      try {
        await supabase
          .from('profiles')
          .update({ is_available: false })
          .eq('id', currentUser.id);
          
        await supabase.auth.signOut();
        
        toast.success('Sesión cerrada correctamente');
        navigate('/login');
      } catch (error) {
        console.error('Error during logout:', error);
        toast.error('Error al cerrar sesión');
      }
    } else {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  useEffect(() => {
    if (currentUser === null) {
      const checkAuth = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          navigate('/login');
        }
      };
      checkAuth();
    }
  }, [currentUser, navigate]);

  return (
    <div 
      className="h-screen w-full relative"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <h1 className="text-chelas-yellow text-9xl font-pixel tracking-tighter">JS</h1>
      </div>
      
      <div className="h-full pb-16 md:pb-10 p-2 md:p-4 overflow-y-auto noise-bg">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-4 content-start">
          {applications.map((app) => (
            <div 
              key={app.id}
              className="flex flex-col items-center cursor-pointer p-2 hover:bg-chelas-button-face/30 active:bg-chelas-button-face/50 rounded-md transition-colors"
              onClick={() => openApplication(app.id)}
            >
              <div className="text-3xl md:text-4xl mb-1">{app.icon}</div>
              <span className="text-xs md:text-sm text-center font-ms-sans text-white">{app.title}</span>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {openWindows.map((appId) => {
            const app = applications.find(a => a.id === appId);
            if (!app || minimizedWindows.includes(appId)) return null;
            
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
                className={`absolute inset-0 md:inset-auto ${isMobile ? 'w-full h-full' : 'md:top-10 md:left-10 md:w-3/4 md:h-3/4'}`}
                onClick={() => setActiveWindow(appId)}
              >
                <WindowFrame 
                  title={app.title}
                  onClose={() => closeApplication(appId)}
                  onMinimize={() => minimizeApplication(appId)}
                  className={`h-full ${activeWindow === appId ? 'shadow-lg' : 'opacity-90'}`}
                >
                  <div className="flex flex-col h-full min-h-0">
                    {app.component}
                  </div>
                </WindowFrame>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      <div className="fixed bottom-0 left-0 w-full bg-chelas-button-face border-t-2 border-chelas-button-highlight z-50">
        <div className="flex items-center justify-between h-12 md:h-10 px-2">
          <div className="flex items-center">
            <button 
              className={`win95-button flex items-center space-x-1 ${isStartMenuOpen ? 'shadow-win95-button-pressed' : ''}`}
              onClick={toggleStartMenu}
            >
              <span className="font-bold text-xs md:text-sm text-black">Inicio</span>
              {isStartMenuOpen && <ChevronUp size={12} className="text-black" />}
            </button>
            
            <div className="flex space-x-1 ml-1 overflow-x-auto scrollbar-none max-w-[60vw]">
              {openWindows.map((appId) => {
                const app = applications.find(a => a.id === appId);
                if (!app) return null;
                
                const isMinimized = minimizedWindows.includes(appId);
                
                return (
                  <button 
                    key={appId}
                    className={`win95-button px-2 py-1 text-xs truncate max-w-[100px] sm:max-w-xs 
                      ${activeWindow === appId && !isMinimized ? 'shadow-win95-button-pressed' : ''}
                      ${isMinimized ? 'opacity-70' : ''}`}
                    onClick={() => openApplication(appId)}
                  >
                    <span className="mr-1">{app.icon}</span>
                    <span className="text-black hidden sm:inline-block">{app.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2">
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
            
            <div className="win95-inset px-2 py-1 text-sm text-black">
              {formatTime(time)}
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isStartMenuOpen && (
            <motion.div 
              className="absolute bottom-12 md:bottom-10 left-0 w-48 md:w-64 bg-chelas-button-face border-2 shadow-win95 z-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-chelas-window-title py-2 px-2 flex items-center">
                <div className="font-bold text-white text-sm">Windows 95</div>
              </div>
              <div className="p-1 space-y-0.5">
                {applications.map((app) => (
                  <div 
                    key={app.id}
                    className="flex items-center p-1.5 hover:bg-chelas-window-title hover:text-white cursor-pointer"
                    onClick={() => openApplication(app.id)}
                  >
                    <div className="text-xl mr-2">{app.icon}</div>
                    <span className="text-sm text-black hover:text-white">{app.title}</span>
                  </div>
                ))}
                <div className="border-t border-chelas-gray-dark my-1"></div>
                <div 
                  className="flex items-center p-1.5 hover:bg-chelas-window-title hover:text-white cursor-pointer"
                  onClick={handleLogout}
                >
                  <div className="text-xl mr-2">🚪</div>
                  <span className="text-sm text-black hover:text-white">Cerrar sesión</span>
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

