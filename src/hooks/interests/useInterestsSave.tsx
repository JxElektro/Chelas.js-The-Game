
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { updateSuperProfileFromSelections } from '@/utils/superProfileUtils';
import { useNavigate } from 'react-router-dom';

export const useInterestsSave = () => {
  const navigate = useNavigate();

  const handleSave = async (
    profileId: string | null, 
    selectedInterests: string[], 
    avoidInterests: string[],
    aiAnalysis: string | undefined,
    personalNote: string,
    profileData: {
      name: string;
      instagram: string;
      twitter: string;
      facebook: string;
    },
    setLoading: (loading: boolean) => void
  ) => {
    if (!profileId) return;
    
    try {
      setLoading(true);

      // Actualizamos el SuperProfile con las selecciones actuales
      const result = await updateSuperProfileFromSelections(
        profileId,
        selectedInterests,
        avoidInterests,
        aiAnalysis
      );

      if (!result.success) {
        throw result.error;
      }
      
      // Obtenemos el super_profile actual para actualizarlo con las redes sociales
      const { data: currentProfileData } = await supabase
        .from('profiles')
        .select('super_profile')
        .eq('id', profileId)
        .single();
      
      const currentSuperProfile = currentProfileData?.super_profile || {};
      
      // Actualizamos el super_profile para incluir redes sociales
      const updatedSuperProfile: any = {
        ...(typeof currentSuperProfile === 'object' ? currentSuperProfile : {}),
        redes_sociales: {
          instagram: profileData.instagram || '',
          twitter: profileData.twitter || '',
          facebook: profileData.facebook || ''
        }
      };
      
      // También actualizamos los datos de perfil básico
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          descripcion_personal: personalNote,
          analisis_externo: aiAnalysis,
          super_profile: updatedSuperProfile
        })
        .eq('id', profileId);
      
      if (profileError) throw profileError;

      toast.success('Preferencias guardadas correctamente');
      navigate('/');
    } catch (err) {
      console.error('Error al guardar intereses:', err);
      toast.error('No se pudieron guardar los intereses');
    } finally {
      setLoading(false);
    }
  };

  return { handleSave };
};
