
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserList from '@/components/UserList';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import Avatar, { AvatarType } from '@/components/Avatar';

// ID del bot predefinido
const BOT_ID = '00000000-0000-0000-0000-000000000000';

const Lobby = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatar: AvatarType;
    is_available: boolean;
  } | null>(null);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProfiles();
      // Configurar un intervalo para actualizar la lista cada 30 segundos
      const interval = setInterval(fetchProfiles, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const checkAuthStatus = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('Debes iniciar sesión para acceder a esta página');
        navigate('/login');
        return;
      }

      const userId = sessionData.session.user.id;
      
      // Obtener el perfil del usuario actual
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // Si el perfil no existe, creemos uno básico
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              name: sessionData.session.user.email?.split('@')[0] || 'Usuario',
              avatar: 'user',
              is_available: true,
              temas_preferidos: [],
              descripcion_personal: ''
            });

          if (insertError) {
            console.error('Error creando perfil:', insertError);
            toast.error('Error al crear tu perfil');
            return;
          }
          
          // Establecer un perfil por defecto mientras se crea en la BD
          setCurrentUser({
            id: userId,
            name: sessionData.session.user.email?.split('@')[0] || 'Usuario',
            avatar: 'user',
            is_available: true
          });
        } else {
          console.error('Error al obtener perfil:', profileError);
          toast.error('Error al cargar tu perfil');
          return;
        }
      } else {
        // Perfil encontrado
        setCurrentUser({
          id: userProfile.id,
          name: userProfile.name || 'Usuario',
          avatar: userProfile.avatar as AvatarType || 'user',
          is_available: userProfile.is_available || true
        });
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      toast.error('Error al verificar tu sesión');
      navigate('/login');
    }
  };

  const fetchProfiles = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Primero, obtenemos los usuarios reales disponibles
      const { data: realUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'eq', currentUser.id)
        .not('id', 'eq', BOT_ID)
        .eq('is_available', true);
      
      if (usersError) {
        console.error('Error al cargar perfiles:', usersError);
        toast.error('Error al cargar perfiles de usuarios');
        setUsers([]);
        return;
      }
      
      // Luego, obtenemos el perfil del bot
      const { data: botProfile, error: botError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', BOT_ID)
        .single();
      
      if (botError && botError.code !== 'PGRST116') {
        // PGRST116 significa "no se encontraron resultados"
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
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    console.log('Iniciando conversación con el usuario:', userId);
    navigate(`/conversation/${userId}`);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p>Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        <div className="flex items-center mb-4">
          <Users size={16} className="mr-2" />
          <h2 className="text-black text-sm font-bold">PERSONAS DISPONIBLES</h2>
        </div>

        {loading ? (
          <p className="text-sm text-black mb-3">Cargando usuarios...</p>
        ) : (
          <>
            <p className="text-xs text-black mb-3">
              {users.length > 0 
                ? 'Estas personas están disponibles para chatear ahora:' 
                : 'No hay personas disponibles para chatear en este momento.'}
            </p>
            
            {users.length > 0 ? (
              <UserList 
                users={[...users.map(user => ({
                  id: user.id,
                  name: user.name,
                  avatar: user.avatar as AvatarType,
                  isAvailable: user.is_available
                })), {
                  id: currentUser.id,
                  name: currentUser.name,
                  avatar: currentUser.avatar,
                  isAvailable: currentUser.is_available
                }]} 
                onSelectUser={handleSelectUser}
                currentUserId={currentUser.id}
              />
            ) : (
              <div className="p-4 bg-chelas-gray-light border border-chelas-gray-dark text-center">
                <p className="text-black text-xs">
                  No hay otros usuarios disponibles en este momento. 
                  Vuelve a intentarlo más tarde o puedes hablar con nuestro Bot.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Lobby;
