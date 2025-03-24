
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

// Export Operation Result type for functions that perform database operations
export interface OperationResult {
  success: boolean;
  error?: any;
}
