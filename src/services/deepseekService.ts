
import axios from 'axios';

// In the first version, we're hardcoding the API key as specified in the requirements
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
      User A interests: ${userAInterests.join(', ')}.
      User B interests: ${userBInterests.join(', ')}.
      Topics to avoid: ${avoidTopics.join(', ')}.
      Generate a fun, engaging conversation starter topic that combines these interests. 
      Keep it concise (1-2 sentences), friendly, and appropriate for a social event for JavaScript programmers. 
      Make it something that both users can relate to based on their shared interests.
    `;

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a friendly conversation starter generator for a social networking app at a JavaScript conference.' },
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
    console.error('Error generating conversation topic:', error);
    return "How do you feel about JavaScript frameworks? Do you have a favorite one?";
  }
};

// Mock function for testing when API is not available
export const generateMockTopic = (): string => {
  const topics = [
    "If you could combine any two programming languages to create the perfect language, what would they be and why?",
    "What's a tech gadget you can't live without, and what would you improve about it?",
    "If you could solve one programming challenge forever, which one would you choose?",
    "What's your favorite coding Easter egg or hidden feature you've discovered?",
    "If JavaScript was a person, what would their personality be like?",
    "What's the most overrated and underrated web development trend right now?",
    "If you could add one feature to JavaScript, what would it be?",
    "What's a non-tech hobby that has surprisingly improved your programming skills?",
  ];
  
  return topics[Math.floor(Math.random() * topics.length)];
};
