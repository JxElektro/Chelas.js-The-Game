
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
}: GenerateTopicParams): Promise<string[]> => {
  try {
    const prompt = `
      Intereses de Usuario A: ${userAInterests.join(', ')}.
      Intereses de Usuario B: ${userBInterests.join(', ')}.
      Temas a evitar: ${avoidTopics.join(', ')}.
      Porcentaje de coincidencia: ${matchPercentage}%.
      
      Genera 3-5 preguntas o temas interesantes para iniciar una conversación que considere los intereses compartidos de los usuarios.
      Las preguntas deben ser específicas, abiertas y fomentar una conversación profunda.
      Prioriza temas donde hay coincidencias (${matchPercentage}% de coincidencia).
      Formatea tu respuesta como una lista de preguntas separadas por saltos de línea, sin numeración ni viñetas.
      Todas las preguntas deben estar en español, ser concisas y atractivas.
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

    const content = response.data.choices[0].message.content.trim();
    // Split the content by newlines to get an array of topics
    return content.split('\n').filter(line => line.trim().length > 0);
  } catch (error) {
    console.error('Error generando temas de conversación:', error);
    return [
      "¿Qué proyectos tecnológicos o creativos te gustaría desarrollar en el futuro cercano?",
      "¿Cómo crees que la inteligencia artificial cambiará nuestra forma de programar?",
      "¿Cuál ha sido tu experiencia más interesante en un evento de tecnología?"
    ];
  }
};

// Función simulada para pruebas cuando la API no está disponible
export const generateMockTopic = (): string[] => {
  const topicSets = [
    [
      "¿Cómo crees que la inteligencia artificial cambiará nuestra forma de programar en los próximos 5 años?",
      "¿Qué herramientas o tecnologías has descubierto recientemente que te han facilitado el trabajo?",
      "¿Cuál es tu opinión sobre el equilibrio entre velocidad de desarrollo y calidad del código?"
    ],
    [
      "Si pudieras recomendar una película o serie que haya cambiado tu perspectiva, ¿cuál sería y por qué?",
      "¿Qué género cinematográfico te parece que mejor refleja nuestra sociedad actual?",
      "¿Prefieres leer el libro o ver la adaptación cinematográfica? ¿Por qué?"
    ],
    [
      "¿Qué música sueles escuchar mientras trabajas o estudias?",
      "¿Has asistido a algún concierto memorable últimamente?",
      "¿Cómo crees que la tecnología ha cambiado nuestra forma de descubrir y consumir música?"
    ],
    [
      "¿Cuál ha sido tu experiencia de viaje más memorable y qué la hizo especial?",
      "Si pudieras vivir en cualquier ciudad del mundo durante un año, ¿cuál elegirías y por qué?",
      "¿Prefieres planificar cada detalle de un viaje o dejarte llevar por la espontaneidad?"
    ],
    [
      "¿Tienes algún hobby o pasatiempo que te ayude a equilibrar tu vida profesional con la personal?",
      "¿Qué actividad te gustaría aprender o probar que nunca hayas hecho antes?",
      "¿Cómo encuentras tiempo para tus intereses personales en medio de un horario ocupado?"
    ]
  ];
  
  return topicSets[Math.floor(Math.random() * topicSets.length)];
};
