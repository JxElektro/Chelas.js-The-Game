
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import WindowFrame from '@/components/WindowFrame';
import Button from '@/components/Button';
import Avatar, { AvatarType } from '@/components/Avatar';
import UserList from '@/components/UserList';
import { UserCog, Users, Power, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

// ID del bot predefinido
const BOT_ID = '00000000-0000-0000-0000-000000000000';

const Lobby = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAvailable, setIsAvailable] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // En una aplicación real, esto sería el ID del usuario actual que inició sesión
  // Por ahora, usamos un ID ficticio para el ejemplo
  const currentUserId = '7';
  const currentUser = {
    id: currentUserId,
    name: 'Tú',
    avatar: 'user' as AvatarType,
    is_available: isAvailable
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        
        // Primero, obtenemos los usuarios reales disponibles
        const { data: realUsers, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .not('id', 'eq', currentUserId)
          .not('id', 'eq', BOT_ID)
          .eq('is_available', true);
        
        if (usersError) throw usersError;
        
        // Luego, obtenemos el perfil del bot
        const { data: botProfile, error: botError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', BOT_ID)
          .single();
        
        if (botError && botError.code !== 'PGRST116') {
          // PGRST116 significa "no se encontraron resultados", lo que está bien si el bot no existe
          console.error('Error al cargar el perfil del bot:', botError);
        }
        
        // Combinamos los usuarios reales con el bot (si existe)
        const allProfiles = [...(realUsers || [])];
        if (botProfile) {
          allProfiles.push(botProfile);
        }
        
        setUsers(allProfiles);
      } catch (error) {
        console.error('Error al cargar perfiles:', error);
        toast.error('Error al cargar los perfiles');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
    
    // Configurar un intervalo para actualizar la lista cada 30 segundos
    const interval = setInterval(fetchProfiles, 30000);
    
    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleStatusToggle = () => {
    setIsAvailable(!isAvailable);
    // En una aplicación real, actualizaríamos el estado en Supabase
  };

  const handleSelectUser = (userId: string) => {
    // En una aplicación real, esto crearía una conversación en Supabase
    console.log('Iniciando conversación con el usuario:', userId);
    navigate(`/conversation/${userId}`);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col min-h-[90vh] w-full"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
          <h1 className="text-chelas-yellow text-2xl">¡Bienvenido!</h1>
          <Button
            variant={isAvailable ? 'primary' : 'default'}
            onClick={handleStatusToggle}
            className="flex items-center w-full sm:w-auto"
          >
            {isAvailable ? (
              <>
                <Wifi size={16} className="mr-1" />
                Disponible
              </>
            ) : (
              <>
                <WifiOff size={16} className="mr-1" />
                No disponible
              </>
            )}
          </Button>
        </div>

        <WindowFrame title="TU PERFIL" className="mb-6">
          <div className="flex items-center">
            <Avatar type={currentUser.avatar as AvatarType} size="lg" />
            <div className="ml-4">
              <h2 className="text-black text-lg font-bold">{currentUser.name}</h2>
              <p className="text-sm text-chelas-gray-dark">
                Estado: {isAvailable ? 'Disponible para chatear' : 'No disponible'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate('/interests')}
            >
              <UserCog size={14} className="mr-1" />
              Preferencias
            </Button>
          </div>
        </WindowFrame>

        <WindowFrame title="PERSONAS DISPONIBLES" className="flex-grow mb-4">
          {loading ? (
            <p className="text-sm text-black mb-3">Cargando usuarios...</p>
          ) : (
            <>
              <p className="text-sm text-black mb-3">
                Estas personas están disponibles para chatear ahora:
              </p>
              
              <UserList 
                users={[...users.map(user => ({
                  id: user.id,
                  name: user.name,
                  avatar: user.avatar as AvatarType,
                  isAvailable: user.is_available
                })), {
                  id: currentUserId,
                  name: currentUser.name,
                  avatar: currentUser.avatar as AvatarType,
                  isAvailable: currentUser.is_available
                }]} 
                onSelectUser={handleSelectUser}
                currentUserId={currentUserId}
              />
            </>
          )}
        </WindowFrame>
      </motion.div>
    </Layout>
  );
};

export default Lobby;
