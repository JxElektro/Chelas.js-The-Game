
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  type SuperProfile, 
  createEmptySuperProfile, 
  loadSuperProfile,
  extractInterestsFromSuperProfile 
} from '@/utils/superProfileUtils';

export const useInterestsState = () => {
  const navigate = useNavigate();
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avoidInterests, setAvoidInterests] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [superProfile, setSuperProfile] = useState<SuperProfile | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    instagram: '',
    twitter: '',
    facebook: ''
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error('Debes iniciar sesión para acceder a esta página');
      navigate('/login');
      return;
    }
    
    // Verificar si es admin (para propósitos de desarrollo)
    const email = sessionData.session.user.email;
    setIsAdmin(email === 'admin@example.com' || email === 'test@example.com');
    
    setUserAuthenticated(true);
    setProfileId(sessionData.session.user.id);
    // Cargar los intereses del usuario, si ya existen
    fetchUserProfile(sessionData.session.user.id);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Cargar el SuperProfile
      const profile = await loadSuperProfile(userId);
      
      if (profile) {
        setSuperProfile(profile);
        
        // Si hay un análisis de IA, lo cargamos
        if (profile.cultura.tech.ia) {
          setAiAnalysis(profile.cultura.tech.ia);
        }
        
        // Convertimos el SuperProfile a arrays de IDs seleccionados
        const selected: string[] = [];
        const avoided: string[] = [];
        
        // Recorremos el SuperProfile para extraer los intereses seleccionados
        extractInterestsFromSuperProfile(profile, selected, avoided);
        
        setSelectedInterests(selected);
        setAvoidInterests(avoided);
      } else {
        // Si no hay perfil, creamos uno vacío
        setSuperProfile(createEmptySuperProfile());
      }
      
      // También cargamos el perfil básico para la descripción personal
      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar, descripcion_personal, analisis_externo')
        .eq('id', userId)
        .single();

      if (error) {
        // Si el error es "PGRST116" quiere decir que no encontró registro, no es crítico.
        if (error.code !== 'PGRST116') {
          console.error('Error al cargar perfil de usuario:', error);
          toast.error('Error al cargar tu perfil');
        }
        return;
      }

      if (data) {
        // Solo accedemos a las propiedades si data es un objeto válido
        setPersonalNote(data.descripcion_personal || '');
        if (data.analisis_externo && !aiAnalysis) {
          setAiAnalysis(data.analisis_externo);
        }
        
        // Cargar datos de perfil con valores predeterminados
        setProfileData({
          name: data.name || '',
          email: '', // No tenemos acceso a email en la tabla de perfiles
          instagram: '', // Estos campos aún no existen en la tabla
          twitter: '', 
          facebook: ''
        });
      }
      
    } catch (err) {
      console.error('Error al cargar perfil de usuario:', err);
      toast.error('Error al cargar tu perfil');
    } finally {
      setLoading(false);
    }
  };

  return {
    currentTabIndex,
    setCurrentTabIndex,
    selectedInterests,
    setSelectedInterests,
    avoidInterests, 
    setAvoidInterests,
    personalNote,
    setPersonalNote,
    aiAnalysis,
    setAiAnalysis,
    loading,
    setLoading,
    isAdmin,
    userAuthenticated,
    profileId,
    superProfile,
    setSuperProfile,
    profileData,
    setProfileData
  };
};
