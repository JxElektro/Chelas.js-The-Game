
import { SuperProfile } from './types';

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
