
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
      email: string;
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
      
      // También actualizamos los datos de perfil básico
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          descripcion_personal: personalNote,
          analisis_externo: aiAnalysis
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
