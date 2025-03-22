// FILE: src/utils/interestsData.ts
// Este archivo define de manera centralizada todos los intereses y subintereses,
// organizados en tabs y categorías. Se han agregado muchos más elementos en cada categoría.

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
