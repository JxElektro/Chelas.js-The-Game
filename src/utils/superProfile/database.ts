
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { SuperProfile, OperationResult } from './types';
import { createEmptySuperProfile } from './factory';
import { resetAllInterests, setInterestValue } from './helpers';

/**
 * Guarda el súper objeto en la columna 'super_profile' de la tabla 'profiles'.
 * @param userId string con el ID del usuario (UUID en Supabase).
 * @param superProfile instancia de SuperProfile que deseamos guardar.
 */
export async function saveSuperProfile(userId: string, superProfile: SuperProfile): Promise<OperationResult> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ super_profile: superProfile as unknown as Json })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error al guardar SuperProfile:', error);
    return { success: false, error };
  }
}

/**
 * Carga el súper objeto desde la columna 'super_profile' de la tabla 'profiles'.
 * @param userId string con el ID del usuario (UUID en Supabase).
 * @returns SuperProfile o null si no existe en la BD.
 */
export async function loadSuperProfile(userId: string): Promise<SuperProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('super_profile')
      .eq('id', userId)
      .single();

    if (error) {
      // Si el error es "PGRST116" quiere decir que no encontró registro, no es crítico.
      if (error.code !== 'PGRST116') {
        console.error('Error al cargar SuperProfile:', error);
      }
      return null;
    }

    if (data && data.super_profile) {
      return data.super_profile as unknown as SuperProfile;
    }

    return null;
  } catch (error) {
    console.error('Error al consultar la tabla profiles:', error);
    return null;
  }
}

/**
 * Actualiza el perfil del usuario en base a las selecciones realizadas en la UI
 * @param userId ID del usuario
 * @param selectedInterests Array de IDs de intereses seleccionados
 * @param avoidInterests Array de IDs de intereses a evitar
 * @param aiAnalysis Texto de análisis de IA
 * @returns Objeto con resultado de la operación
 */
export async function updateSuperProfileFromSelections(
  userId: string, 
  selectedInterests: string[], 
  avoidInterests: string[],
  aiAnalysis?: string
): Promise<OperationResult> {
  try {
    // Primero cargamos el perfil existente o creamos uno nuevo
    let profile = await loadSuperProfile(userId);
    
    if (!profile) {
      profile = createEmptySuperProfile();
    }
    
    // Resetear todos los valores a false primero
    // Esto evita inconsistencias si un interés fue deseleccionado
    resetAllInterests(profile);
    
    // Marcar los intereses seleccionados como true
    for (const interestId of selectedInterests) {
      setInterestValue(profile, interestId, true);
    }
    
    // Marcar los intereses a evitar como true
    for (const avoidId of avoidInterests) {
      setInterestValue(profile, avoidId, true);
    }
    
    // Actualizar el análisis de IA si se proporciona
    if (aiAnalysis !== undefined) {
      profile.cultura.tech.ia = aiAnalysis;
    }
    
    // Guardar el perfil actualizado
    return await saveSuperProfile(userId, profile);
  } catch (error) {
    console.error('Error al actualizar el SuperProfile:', error);
    return { success: false, error };
  }
}
