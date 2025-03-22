
import axios from 'axios';

// En la primera versión, estamos utilizando la API key directamente como se especificó en los requisitos
const DEEPSEEK_API_KEY = 'sk-c01fb7d8647b401c877020522f9a6c22';

interface GenerateTopicParams {
  userAInterests: string[];
  userBInterests: string[];
  avoidTopics: string[];
  matchPercentage: number;
}

export const generateConversationTopic = async ({
  userAInterests,
  userBInterests,
  avoidTopics,
  matchPercentage
}: GenerateTopicParams): Promise<string> => {
  try {
    const prompt = `
      Intereses de Usuario A: ${userAInterests.join(', ')}.
      Intereses de Usuario B: ${userBInterests.join(', ')}.
      Temas a evitar: ${avoidTopics.join(', ')}.
      Porcentaje de coincidencia: ${matchPercentage}%.
      
      Genera una pregunta interesante para iniciar una conversación que considere los intereses compartidos de los usuarios.
      La pregunta debe ser específica, abierta y fomentar una conversación profunda.
      Prioriza temas donde hay coincidencias (${matchPercentage}% de coincidencia).
      La respuesta debe ser una sola pregunta en español, concisa y atractiva.
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
    return "¿Qué proyectos tecnológicos o creativos te gustaría desarrollar en el futuro cercano?";
  }
};

// Función simulada para pruebas cuando la API no está disponible
export const generateMockTopic = (): string => {
  const topics = [
    // Preguntas basadas en intereses comunes
    "¿Cómo crees que la inteligencia artificial cambiará nuestra forma de programar en los próximos 5 años?",
    "Si pudieras recomendar una película o serie que haya cambiado tu perspectiva, ¿cuál sería y por qué?",
    "¿Qué estrategias has encontrado más efectivas para mantenerte actualizado con las nuevas tecnologías?",
    "¿Qué género musical te inspira más cuando estás programando o siendo creativo?",
    "¿Cuál ha sido tu experiencia de viaje más memorable y qué la hizo especial?",
    "¿Tienes algún hobby o pasatiempo que te ayude a equilibrar tu vida profesional con la personal?",
    "¿Cuál es tu opinión sobre el balance entre el código abierto y el software propietario?",
    "Si pudieras elegir cualquier tecnología para dominar en los próximos meses, ¿cuál sería y por qué?",
    "¿Qué libro o recurso recomendarías a alguien que quiera aprender sobre tu área de experiencia?",
    "¿Qué tendencias tecnológicas te parecen más prometedoras actualmente?",
    "¿Cómo abordas el síndrome del impostor en tu vida profesional?",
    "¿Qué tipo de proyectos personales estás desarrollando o te gustaría desarrollar?",
    "¿Cuál es tu enfoque para mantener un buen equilibrio entre trabajo y vida personal?",
    "¿Qué comunidades o recursos online has encontrado más valiosos para tu desarrollo profesional?",
    "¿Qué consejo le darías a alguien que está comenzando en el mundo de la programación?"
  ];
  
  return topics[Math.floor(Math.random() * topics.length)];
};
