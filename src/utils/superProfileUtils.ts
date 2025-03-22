
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

/**
 * Interfaz que define el súper objeto (SuperProfile) con todas las pestañas,
 * categorías y subcategorías necesarias para representar los intereses y el
 * perfil de la persona.
 */
export interface SuperProfile {
  general: {
    movies: {
      terror: boolean;
      accion: boolean;
      comedia: boolean;
      drama: boolean;
      romance: boolean;
      documentales: boolean;
      animacion: boolean;
      fantastico: boolean;
      'ciencia-ficcion': boolean;
    };
    music: {
      rock: boolean;
      pop: boolean;
      rap: boolean;
      electronica: boolean;
      jazz: boolean;
      reggaeton: boolean;
      salsa: boolean;
      clasica: boolean;
    };
    books: {
      novelas: boolean;
      'terror-books': boolean;
      'scifi-books': boolean;
      poesia: boolean;
      historia: boolean;
      biografias: boolean;
      ensayos: boolean;
      'comics-manga': boolean;
    };
  };
  ocio: {
    food: {
      'cocina-internacional': boolean;
      reposteria: boolean;
      'comida-saludable': boolean;
      'comida-vegana': boolean;
      'comida-exotica': boolean;
      'street-food': boolean;
    };
    travel: {
      playa: boolean;
      montana: boolean;
      'ciudades-historicas': boolean;
      ecoturismo: boolean;
      'turismo-cultural': boolean;
      cruceros: boolean;
    };
    sports: {
      futbol: boolean;
      baloncesto: boolean;
      tenis: boolean;
      running: boolean;
      natacion: boolean;
      ciclismo: boolean;
      'artes-marciales': boolean;
    };
    hobbies: {
      gaming: boolean;
      diy: boolean;
      jardineria: boolean;
      coleccionismo: boolean;
      manualidades: boolean;
      modelismo: boolean;
      podcasting: boolean;
    };
  };
  cultura: {
    art: {
      pintura: boolean;
      fotografia: boolean;
      teatro: boolean;
      escultura: boolean;
      'cine-arte': boolean;
    };
    tech: {
      programacion: boolean;
      ia: string; // Texto de análisis de IA
      gadgets: boolean;
      blockchain: boolean;
      'realidad-virtual': boolean;
    };
    trends: {
      noticias: boolean;
      startups: boolean;
      'redes-sociales': boolean;
      economia: boolean;
      'politica-global': boolean;
    };
    humor: {
      memes: boolean;
      chistes: boolean;
      standup: boolean;
      satira: boolean;
    };
  };
  otros: {
    other: {
      filosofia: boolean;
      psicologia: boolean;
      politica: boolean;
      emprendimiento: boolean;
      'desarrollo-personal': boolean;
      autoayuda: boolean;
    };
  };
  evitar: {
    avoid: {
      spoilers: boolean;
      'temas-sensibles': boolean;
      'religion-controversia': boolean;
      'politica-extrema': boolean;
    };
  };
  'opciones-avanzadas-ia': {
    externalAnalysis: {
      isEnabled?: boolean;
    };
  };
  trabajo: {
    javascriptTech: {
      react: boolean;
      nodejs: boolean;
      express: boolean;
      typescript: boolean;
      angular: boolean;
      vue: boolean;
      svelte: boolean;
    };
  };
}

/**
 * Crea una instancia inicial del súper objeto con valores en false y el campo 'ia' en ''.
 */
export function createEmptySuperProfile(): SuperProfile {
  return {
    general: {
      movies: {
        terror: false,
        accion: false,
        comedia: false,
        drama: false,
        romance: false,
        documentales: false,
        animacion: false,
        fantastico: false,
        'ciencia-ficcion': false,
      },
      music: {
        rock: false,
        pop: false,
        rap: false,
        electronica: false,
        jazz: false,
        reggaeton: false,
        salsa: false,
        clasica: false,
      },
      books: {
        novelas: false,
        'terror-books': false,
        'scifi-books': false,
        poesia: false,
        historia: false,
        biografias: false,
        ensayos: false,
        'comics-manga': false,
      },
    },
    ocio: {
      food: {
        'cocina-internacional': false,
        reposteria: false,
        'comida-saludable': false,
        'comida-vegana': false,
        'comida-exotica': false,
        'street-food': false,
      },
      travel: {
        playa: false,
        montana: false,
        'ciudades-historicas': false,
        ecoturismo: false,
        'turismo-cultural': false,
        cruceros: false,
      },
      sports: {
        futbol: false,
        baloncesto: false,
        tenis: false,
        running: false,
        natacion: false,
        ciclismo: false,
        'artes-marciales': false,
      },
      hobbies: {
        gaming: false,
        diy: false,
        jardineria: false,
        coleccionismo: false,
        manualidades: false,
        modelismo: false,
        podcasting: false,
      },
    },
    cultura: {
      art: {
        pintura: false,
        fotografia: false,
        teatro: false,
        escultura: false,
        'cine-arte': false,
      },
      tech: {
        programacion: false,
        ia: '', // Texto de análisis de IA
        gadgets: false,
        blockchain: false,
        'realidad-virtual': false,
      },
      trends: {
        noticias: false,
        startups: false,
        'redes-sociales': false,
        economia: false,
        'politica-global': false,
      },
      humor: {
        memes: false,
        chistes: false,
        standup: false,
        satira: false,
      },
    },
    otros: {
      other: {
        filosofia: false,
        psicologia: false,
        politica: false,
        emprendimiento: false,
        'desarrollo-personal': false,
        autoayuda: false,
      },
    },
    evitar: {
      avoid: {
        spoilers: false,
        'temas-sensibles': false,
        'religion-controversia': false,
        'politica-extrema': false,
      },
    },
    'opciones-avanzadas-ia': {
      externalAnalysis: {
        isEnabled: false,
      },
    },
    trabajo: {
      javascriptTech: {
        react: false,
        nodejs: false,
        express: false,
        typescript: false,
        angular: false,
        vue: false,
        svelte: false,
      },
    },
  };
}

/**
 * Guarda el súper objeto en la columna 'super_profile' de la tabla 'profiles'.
 * @param userId string con el ID del usuario (UUID en Supabase).
 * @param superProfile instancia de SuperProfile que deseamos guardar.
 */
export async function saveSuperProfile(userId: string, superProfile: SuperProfile) {
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
) {
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

/**
 * Establece todos los valores booleanos del perfil a false
 */
function resetAllInterests(profile: SuperProfile) {
  // Recorremos la estructura y reseteamos todos los booleanos a false
  Object.keys(profile).forEach(tabKey => {
    const tab = profile[tabKey as keyof SuperProfile];
    
    Object.keys(tab).forEach(categoryKey => {
      const category = tab[categoryKey as string];
      
      Object.keys(category).forEach(interestKey => {
        // Saltamos el campo 'ia' que es string
        if (interestKey === 'ia') return;
        
        // @ts-ignore - Sabemos que es un objeto con propiedades booleanas
        if (typeof category[interestKey] === 'boolean') {
          // @ts-ignore
          category[interestKey] = false;
        }
      });
    });
  });
}

/**
 * Establece el valor de un interés específico en el perfil
 */
function setInterestValue(profile: SuperProfile, interestId: string, value: boolean) {
  // Recorremos la estructura para encontrar y actualizar el interés específico
  Object.keys(profile).forEach(tabKey => {
    const tab = profile[tabKey as keyof SuperProfile];
    
    Object.keys(tab).forEach(categoryKey => {
      const category = tab[categoryKey as string];
      
      // Si la categoría tiene este interés, lo actualizamos
      if (Object.prototype.hasOwnProperty.call(category, interestId)) {
        // @ts-ignore - Sabemos que existe la propiedad
        if (typeof category[interestId] === 'boolean') {
          // @ts-ignore
          category[interestId] = value;
        }
      }
    });
  });
}
