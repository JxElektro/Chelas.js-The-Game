import { TopicCategory } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';

export interface SubInterest {
  id: string;       // Se utilizará para guardarlo en la BD
  label: string;    // Nombre que se mostrará en la interfaz
}

export interface Category {
  categoryId: string;         // "movies", "music", "food", etc.
  label: string;              // Nombre que se muestra en la UI ("Películas", "Música", etc.)
  subInterests?: SubInterest[]; // Subgéneros o subcategorías
}

export interface InterestTab {
  label: string;        // Nombre de la pestaña principal ("General", "Ocio", etc.)
  categories: Category[]; // Categorías y subcategorías que contiene
}

// Lista de tabs con sus categorías y subcategorías fijas
export const interestTabs: InterestTab[] = [
  {
    label: "General",
    categories: [
      {
        categoryId: "movies",
        label: "Películas",
        subInterests: [
          { id: "terror", label: "Terror" },
          { id: "accion", label: "Acción" },
          { id: "comedia", label: "Comedia" },
          { id: "drama", label: "Drama" },
          { id: "romance", label: "Romance" },
          { id: "documentales", label: "Documentales" },
          { id: "animacion", label: "Animación" },
          { id: "fantastico", label: "Fantástico" },
          { id: "ciencia-ficcion", label: "Ciencia Ficción" },
        ],
      },
      {
        categoryId: "music",
        label: "Música",
        subInterests: [
          { id: "rock", label: "Rock" },
          { id: "pop", label: "Pop" },
          { id: "rap", label: "Rap / Hip Hop" },
          { id: "electronica", label: "Electrónica" },
          { id: "jazz", label: "Jazz" },
          { id: "reggaeton", label: "Reggaetón" },
          { id: "salsa", label: "Salsa" },
          { id: "clasica", label: "Clásica" },
        ],
      },
      {
        categoryId: "books",
        label: "Libros",
        subInterests: [
          { id: "novelas", label: "Novelas" },
          { id: "terror-books", label: "Terror" },
          { id: "scifi-books", label: "Ciencia Ficción" },
          { id: "poesia", label: "Poesía" },
          { id: "historia", label: "Historia" },
          { id: "biografias", label: "Biografías" },
          { id: "ensayos", label: "Ensayos" },
          { id: "comics-manga", label: "Cómics / Manga" },
        ],
      },
    ],
  },
  {
    label: "Ocio",
    categories: [
      {
        categoryId: "food",
        label: "Gastronomía",
        subInterests: [
          { id: "cocina-internacional", label: "Cocina Internacional" },
          { id: "reposteria", label: "Repostería" },
          { id: "comida-saludable", label: "Comida Saludable" },
          { id: "comida-vegana", label: "Comida Vegana" },
          { id: "comida-exotica", label: "Comida Exótica" },
          { id: "street-food", label: "Street Food" },
        ],
      },
      {
        categoryId: "travel",
        label: "Viajes",
        subInterests: [
          { id: "playa", label: "Destinos de Playa" },
          { id: "montana", label: "Destinos de Montaña" },
          { id: "ciudades-historicas", label: "Ciudades Históricas" },
          { id: "ecoturismo", label: "Ecoturismo" },
          { id: "turismo-cultural", label: "Turismo Cultural" },
          { id: "cruceros", label: "Cruceros" },
        ],
      },
      {
        categoryId: "sports",
        label: "Deportes",
        subInterests: [
          { id: "futbol", label: "Fútbol" },
          { id: "baloncesto", label: "Baloncesto" },
          { id: "tenis", label: "Tenis" },
          { id: "running", label: "Running" },
          { id: "natacion", label: "Natación" },
          { id: "ciclismo", label: "Ciclismo" },
          { id: "artes-marciales", label: "Artes Marciales" },
        ],
      },
      {
        categoryId: "hobbies",
        label: "Hobbies Varios",
        subInterests: [
          { id: "gaming", label: "Gaming" },
          { id: "diy", label: "DIY (Hazlo Tú Mismo)" },
          { id: "jardineria", label: "Jardinería" },
          { id: "coleccionismo", label: "Coleccionismo" },
          { id: "manualidades", label: "Manualidades" },
          { id: "modelismo", label: "Modelismo" },
          { id: "podcasting", label: "Podcasting" },
        ],
      },
    ],
  },
  {
    label: "Cultura",
    categories: [
      {
        categoryId: "art",
        label: "Arte",
        subInterests: [
          { id: "pintura", label: "Pintura" },
          { id: "fotografia", label: "Fotografía" },
          { id: "teatro", label: "Teatro" },
          { id: "escultura", label: "Escultura" },
          { id: "cine-arte", label: "Cine Arte" },
        ],
      },
      {
        categoryId: "tech",
        label: "Tecnología",
        subInterests: [
          { id: "programacion", label: "Programación" },
          { id: "ia", label: "Inteligencia Artificial" },
          { id: "gadgets", label: "Gadgets" },
          { id: "blockchain", label: "Blockchain" },
          { id: "realidad-virtual", label: "Realidad Virtual / AR" },
        ],
      },
      {
        categoryId: "trends",
        label: "Actualidad",
        subInterests: [
          { id: "noticias", label: "Noticias Internacionales" },
          { id: "startups", label: "Startups" },
          { id: "redes-sociales", label: "Redes Sociales" },
          { id: "economia", label: "Economía" },
          { id: "politica-global", label: "Política Global" },
        ],
      },
      {
        categoryId: "humor",
        label: "Humor",
        subInterests: [
          { id: "memes", label: "Memes" },
          { id: "chistes", label: "Chistes" },
          { id: "standup", label: "Stand-Up Comedy" },
          { id: "satira", label: "Sátira" },
        ],
      },
    ],
  },
  {
    label: "Otros",
    categories: [
      {
        categoryId: "other",
        label: "Varios",
        subInterests: [
          { id: "filosofia", label: "Filosofía" },
          { id: "psicologia", label: "Psicología" },
          { id: "politica", label: "Política" },
          { id: "emprendimiento", label: "Emprendimiento" },
          { id: "desarrollo-personal", label: "Desarrollo Personal" },
          { id: "autoayuda", label: "Autoayuda" },
        ],
      },
    ],
  },
  {
    label: "Evitar",
    categories: [
      {
        categoryId: "avoid",
        label: "Temas a Evitar",
        subInterests: [
          { id: "spoilers", label: "Spoilers" },
          { id: "temas-sensibles", label: "Temas Sensibles" },
          { id: "religion-controversia", label: "Religión" },
          { id: "politica-extrema", label: "Política Extrema" },
        ],
      },
    ],
  },
  {
    label: "Opciones Avanzadas IA",
    categories: [
      {
        categoryId: "externalAnalysis",
        label: "Análisis Externo",
        subInterests: [],
      },
    ],
  },
];

// Lista de intereses predefinidos
export const PREDEFINED_INTERESTS: Record<string, string[]> = {
  entretenimiento: [
    'Películas', 'Series de TV', 'Anime', 'Documentales', 'Comedia', 
    'Dramáticos', 'Ciencia ficción', 'Fantasía'
  ],
  musica: [
    'Rock', 'Pop', 'Hip Hop / Rap', 'Electrónica', 'Jazz', 
    'Clásica', 'Reggaetón', 'Indie'
  ],
  libros: [
    'Novelas', 'Cuentos', 'Poesía', 'Ensayos', 'Ciencia ficción literaria',
    'Biografías', 'Autoconocimiento'
  ],
  gastronomia: [
    'Cocina internacional', 'Cocina local', 'Repostería', 
    'Comida saludable', 'Comida exótica', 'Restaurantes y food trucks'
  ],
  viajes: [
    'Destinos de playa', 'Destinos de montaña', 'Ciudades históricas',
    'Ecoturismo', 'Viajes de aventura', 'Turismo cultural'
  ],
  deportes: [
    'Fútbol', 'Baloncesto', 'Tenis', 'Correr', 'Gimnasio',
    'Deportes extremos', 'Yoga / Pilates'
  ],
  arte: [
    'Pintura', 'Escultura', 'Fotografía', 'Exposiciones y museos',
    'Teatro', 'Danza', 'Literatura y poesía'
  ],
  tecnologia: [
    'Innovación', 'Programación', 'Videojuegos', 'Gadgets',
    'Inteligencia Artificial', 'Robótica', 'Astronomía'
  ],
  hobbies: [
    'Moda', 'Fotografía', 'Jardinería', 'DIY (Hazlo tú mismo)',
    'Gaming', 'Meditación', 'Voluntariado'
  ],
  actualidad: [
    'Noticias internacionales', 'Redes sociales', 'Tendencias en marketing digital',
    'Emprendimiento', 'Startups', 'Economía'
  ],
  humor: [
    'Chistes', 'Datos curiosos', 'Memes', 'Curiosidades históricas', 'Anécdotas personales'
  ],
  otros: [
    'Filosofía', 'Psicología', 'Política', 'Medio ambiente', 'Desarrollo personal',
    'Relaciones y vida social'
  ],
  evitar: [
    'Polémicas religiosas', 'Política controversial', 'Deportes violentos',
    'Contenido sensible', 'Temas familiares personales'
  ]
};

// Función para mapear categorías a categorías de Supabase
export const mapCategoryToDbCategory = (category: string): TopicCategory => {
  const categoryMap: Record<string, TopicCategory> = {
    entretenimiento: 'movies',
    musica: 'music',
    libros: 'books',
    gastronomia: 'food',
    viajes: 'travel',
    deportes: 'sports',
    arte: 'art',
    tecnologia: 'tech',
    hobbies: 'hobbies',
    actualidad: 'trends',
    humor: 'humor',
    otros: 'other',
    evitar: 'avoid'
  };
  
  return categoryMap[category] || 'other';
};

// Función para transformar intereses predefinidos a formato de Supabase
export const transformPredefinedInterests = () => {
  const result = [];
  let id = 1;
  
  Object.entries(PREDEFINED_INTERESTS).forEach(([category, interests]) => {
    interests.forEach(interest => {
      result.push({
        id: `custom-${id++}`,
        label: interest,
        category: mapCategoryToDbCategory(category)
      });
    });
  });
  
  return result;
};

/**
 * Guarda los intereses seleccionados por el usuario en Supabase
 * @param userId ID del usuario en Supabase
 * @param selectedInterests Array de IDs de intereses seleccionados
 * @param avoidTopics Array de IDs de temas a evitar
 * @param aiAnalysis Texto del análisis de ChatGPT (opcional)
 * @param personalNote Descripción personal del usuario (opcional)
 */
export const saveUserInterests = async (
  userId: string,
  selectedInterests: string[],
  avoidTopics: string[],
  aiAnalysis?: string,
  personalNote?: string
) => {
  try {
    console.log('Guardando intereses para usuario:', userId);

    // 1. Primero actualizamos el perfil del usuario con el análisis y la descripción
    const profileUpdate: any = {};
    
    if (personalNote !== undefined) {
      profileUpdate.descripcion_personal = personalNote;
    }
    
    if (aiAnalysis !== undefined) {
      profileUpdate.analisis_externo = aiAnalysis;
    }
    
    // Guardar todos los intereses (seleccionados y evitar) en temas_preferidos
    const allInterests = [...selectedInterests, ...avoidTopics];
    if (allInterests.length > 0) {
      profileUpdate.temas_preferidos = allInterests;
    }
    
    // Solo actualizar si hay algo que actualizar
    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);
      
      if (profileError) throw profileError;
    }

    // 2. Luego creamos las relaciones usuario-interés en user_interests
    // Primero eliminamos las relaciones existentes para este usuario
    const { error: deleteError } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) throw deleteError;
    
    // Preparamos los registros para insertar
    const interestRelations = [
      ...selectedInterests.map(interestId => ({
        user_id: userId,
        interest_id: interestId,
        is_avoided: false
      })),
      ...avoidTopics.map(topicId => ({
        user_id: userId,
        interest_id: topicId,
        is_avoided: true
      }))
    ];
    
    // Solo insertamos si hay intereses para guardar
    if (interestRelations.length > 0) {
      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(interestRelations);
      
      if (insertError) throw insertError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error al guardar intereses:', error);
    return { success: false, error };
  }
};

// Nueva función para insertar los intereses en la base de datos
export const seedInterests = async () => {
  const interests = transformPredefinedInterests();
  const toInsert = interests.map(item => ({
    name: item.label,
    category: item.category
  }));

  // Insertar en la base de datos
  const { error } = await supabase
    .from('interests')
    .insert(toInsert);

  return { success: !error, error };
};

/**
 * Carga los intereses del usuario desde Supabase
 * @param userId ID del usuario
 * @returns Objeto con los intereses seleccionados y temas a evitar
 */
export const loadUserInterests = async (userId: string) => {
  try {
    // Primero intentamos cargar desde la tabla user_interests (relaciones)
    const { data: userInterests, error: relationsError } = await supabase
      .from('user_interests')
      .select('interest_id, is_avoided')
      .eq('user_id', userId);
    
    if (relationsError) throw relationsError;
    
    // Si no hay relaciones, intentamos cargar desde el array temas_preferidos
    if (!userInterests || userInterests.length === 0) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('temas_preferidos')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      if (profile && profile.temas_preferidos && Array.isArray(profile.temas_preferidos)) {
        // Por ahora no tenemos forma de distinguir entre intereses y temas a evitar
        // en el array temas_preferidos, así que los tratamos todos como intereses
        return {
          selectedInterests: profile.temas_preferidos,
          avoidTopics: []
        };
      }
      
      // Si no hay datos, devolvemos arrays vacíos
      return {
        selectedInterests: [],
        avoidTopics: []
      };
    }
    
    // Separamos intereses regulares de temas a evitar
    const selectedInterests = userInterests
      .filter(item => !item.is_avoided)
      .map(item => item.interest_id);
    
    const avoidTopics = userInterests
      .filter(item => item.is_avoided)
      .map(item => item.interest_id);
    
    return {
      selectedInterests,
      avoidTopics
    };
  } catch (error) {
    console.error('Error al cargar intereses:', error);
    return {
      selectedInterests: [],
      avoidTopics: [],
      error
    };
  }
};
