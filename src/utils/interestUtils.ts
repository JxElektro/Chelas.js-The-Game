
import { TopicCategory } from '@/types/supabase';

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
  ]
};

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
    otros: 'other'
  };
  
  return categoryMap[category] || 'other';
};

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
