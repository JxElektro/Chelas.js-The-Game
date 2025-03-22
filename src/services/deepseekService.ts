
import axios from 'axios';

// En la primera versión, estamos utilizando la API key directamente como se especificó en los requisitos
const DEEPSEEK_API_KEY = 'sk-c01fb7d8647b401c877020522f9a6c22';

interface GenerateTopicParams {
  userAInterests: string[];
  userBInterests: string[];
  avoidTopics: string[];
}

export const generateConversationTopic = async ({
  userAInterests,
  userBInterests,
  avoidTopics
}: GenerateTopicParams): Promise<string> => {
  try {
    const prompt = `
      Intereses de Usuario A: ${userAInterests.join(', ')}.
      Intereses de Usuario B: ${userBInterests.join(', ')}.
      Temas a evitar: ${avoidTopics.join(', ')}.
      Genera un tema de conversación divertido y atractivo que combine estos intereses. 
      Mantén el tema conciso (1-2 oraciones), amigable y apropiado para un evento social de programadores JavaScript. 
      Que sea algo con lo que ambos usuarios puedan relacionarse basado en sus intereses compartidos.
      La respuesta debe estar en español.
    `;

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Eres un generador amigable de temas de conversación para una app de networking en un evento de JavaScript.' },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generando tema de conversación:', error);
    return "¿Qué opinas de los frameworks de JavaScript? ¿Tienes algún favorito?";
  }
};

// Función simulada para pruebas cuando la API no está disponible
export const generateMockTopic = (): string => {
  const topics = [
    // Tech
    "Si pudieras combinar dos lenguajes de programación para crear el lenguaje perfecto, ¿cuáles serían y por qué?",
    "¿Qué gadget tecnológico no puedes vivir sin él, y qué mejorarías?",
    "Si JavaScript fuera una persona, ¿cómo sería su personalidad?",
    
    // Movies
    "¿Cuál es tu película favorita y por qué?",
    "¿Qué opinas sobre las últimas películas de superhéroes?",
    "¿Prefieres el cine de autor o el comercial?",
    
    // Music
    "¿Qué género musical te identifica más?",
    "¿Has asistido a algún concierto memorable?",
    "¿Qué artista te gustaría ver en vivo?",
    
    // Series and Anime
    "¿Qué serie recomendarías ver?",
    "¿Cuál es tu anime favorito?",
    "¿Qué opinas de las adaptaciones live-action?",
    
    // Books
    "¿Qué libro te ha cambiado la vida?",
    "¿Prefieres novelas o ensayos?",
    "¿Digital o papel?",
    
    // Travel
    "¿Cuál ha sido tu viaje más sorprendente?",
    "Si pudieras viajar a cualquier lugar, ¿a dónde irías?",
    "¿Prefieres playa o montaña?",
    
    // Food
    "¿Cuál es tu plato favorito?",
    "¿Te gusta probar comidas exóticas?",
    "¿Cocinas? ¿Cuál es tu especialidad?",
    
    // Hobbies
    "¿Qué actividad disfrutas en tu tiempo libre?",
    "¿Tienes algún hobby inusual?",
    "¿Qué te gustaría aprender?",
  ];
  
  return topics[Math.floor(Math.random() * topics.length)];
};
