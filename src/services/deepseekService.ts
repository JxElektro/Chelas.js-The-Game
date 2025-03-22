import axios from 'axios';
import { SuperProfile } from '@/utils/superProfileUtils';
import { Json } from '@/integrations/supabase/types';

// En la primera versión, estamos utilizando la API key directamente como se especificó en los requisitos
const DEEPSEEK_API_KEY = 'sk-c01fb7d8647b401c877020522f9a6c22';

interface GenerateTopicParams {
  userAInterests: string[];
  userBInterests: string[];
  avoidTopics: string[];
  matchPercentage: number;
}

interface GenerateTopicWithOptionsParams {
  userAProfile: any;
  userBProfile: any;
  matchPercentage: number;
}

interface TopicWithOptions {
  question: string;
  options: {
    emoji: string;
    text: string;
  }[];
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

// Nueva función para generar temas con opciones de respuesta
export const generateTopicWithOptions = async ({
  userAProfile,
  userBProfile,
  matchPercentage
}: GenerateTopicWithOptionsParams): Promise<TopicWithOptions[]> => {
  try {
    // Extraer información relevante de los perfiles
    const profileA = typeof userAProfile.super_profile === 'string' 
      ? JSON.parse(userAProfile.super_profile) 
      : userAProfile.super_profile;
    
    const profileB = typeof userBProfile.super_profile === 'string' 
      ? JSON.parse(userBProfile.super_profile) 
      : userBProfile.super_profile;
    
    const descriptionA = userAProfile.descripcion_personal || '';
    const descriptionB = userBProfile.descripcion_personal || '';

    const prompt = `
      Perfil Usuario A: ${JSON.stringify(profileA)}
      Descripción Personal Usuario A: ${descriptionA}
      
      Perfil Usuario B: ${JSON.stringify(profileB)}
      Descripción Personal Usuario B: ${descriptionB}
      
      Porcentaje de coincidencia: ${matchPercentage}%
      
      Basándote en los perfiles detallados de ambos usuarios, genera 3 preguntas de conversación interesantes.
      Para cada pregunta, proporciona 3 opciones de respuesta que sean relevantes para los intereses de ambos.
      
      El formato de tu respuesta debe ser en JSON con la siguiente estructura:
      [
        {
          "question": "¿Pregunta interesante basada en ambos perfiles?",
          "options": [
            { "emoji": "emoji relevante", "text": "Primera opción de respuesta" },
            { "emoji": "emoji relevante", "text": "Segunda opción de respuesta" },
            { "emoji": "emoji relevante", "text": "Tercera opción de respuesta" }
          ]
        },
        // más preguntas con opciones...
      ]
      
      Las preguntas deben ser abiertas, específicas y fomentar una conversación profunda.
      Todas las preguntas y opciones deben estar en español, ser concisas y atractivas.
      Usa emojis relevantes para cada opción.
    `;

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'Eres un generador de preguntas de conversación que crea temas personalizados con opciones de respuesta basadas en los perfiles de los usuarios.' 
        },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content.trim();
    try {
      // Intentamos parsear el JSON devuelto por la API
      return JSON.parse(content);
    } catch (e) {
      console.error('Error al parsear la respuesta JSON:', e);
      // Si hay un error en el parseo, devolvemos un tema predeterminado
      return mockTopicsWithOptions();
    }
  } catch (error) {
    console.error('Error generando temas con opciones:', error);
    return mockTopicsWithOptions();
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

// Nueva función mock para temas con opciones
export const mockTopicsWithOptions = (): TopicWithOptions[] => {
  return [
    {
      question: "¿Qué actividad te gustaría aprender o probar que nunca hayas hecho antes?",
      options: [
        { emoji: "🎨", text: "Aprender una habilidad artística, como pintura o escultura." },
        { emoji: "🪂", text: "Realizar un deporte extremo, como paracaidismo o escalada." },
        { emoji: "🌊", text: "Probar una actividad acuática, como buceo o surf." }
      ]
    },
    {
      question: "¿Cómo crees que la inteligencia artificial cambiará tu campo profesional?",
      options: [
        { emoji: "🚀", text: "Automatizará tareas repetitivas y me permitirá enfocarme en trabajo creativo." },
        { emoji: "🔄", text: "Transformará completamente los flujos de trabajo actuales." },
        { emoji: "👥", text: "Servirá como asistente que potenciará mis capacidades actuales." }
      ]
    },
    {
      question: "Si pudieras trabajar en cualquier proyecto tecnológico, ¿cuál elegirías?",
      options: [
        { emoji: "🧠", text: "Un proyecto de inteligencia artificial aplicada a educación." },
        { emoji: "🌐", text: "Una plataforma que conecte personas con intereses similares." },
        { emoji: "🛠️", text: "Una herramienta que ayude a desarrolladores a ser más productivos." }
      ]
    }
  ];
};

// Nueva función para formatear el análisis del perfil con DeepSeek API
export const formatProfileAnalysis = async (profileText: string): Promise<string> => {
  try {
    const prompt = `
      Formatea el siguiente texto de perfil de usuario para que tenga una estructura clara y legible,
      manteniendo su contenido original pero mejorando su presentación y organización.
      Asegúrate de mantener los títulos de sección y resaltar información importante.
      
      Texto a formatear:
      ${profileText}
    `;

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Eres un asistente que formatea perfiles de usuario para mejor legibilidad, manteniendo su estructura y contenido original pero mejorando su presentación.' },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const formattedText = response.data.choices[0].message.content.trim();
    return formattedText;
  } catch (error) {
    console.error('Error formateando el perfil:', error);
    // En caso de error, devolvemos el texto original sin formatear
    return profileText;
  }
};
