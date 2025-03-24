
import { SuperProfile } from '@/types/supabase';

/**
 * Extracts random interests from a SuperProfile object
 * @param superProfile The user's SuperProfile data
 * @param count Maximum number of interests to extract
 * @returns Array of interest strings
 */
export const getRandomInterestsFromSuperProfile = (superProfile: any, count: number): string[] => {
  if (!superProfile || typeof superProfile !== 'object') {
    return [];
  }

  try {
    // Collect all valid interests from the superProfile
    const allInterests: string[] = [];
    
    // Check each major category in the SuperProfile
    const categories = ['general', 'ocio', 'cultura', 'otros'];
    
    categories.forEach(category => {
      if (superProfile[category] && typeof superProfile[category] === 'object') {
        // Look for arrays or objects containing interests
        Object.values(superProfile[category]).forEach((value: any) => {
          if (Array.isArray(value)) {
            // If the value is an array, add all string elements
            value.forEach((item: any) => {
              if (typeof item === 'string' && item.trim() !== '') {
                allInterests.push(item);
              }
            });
          } else if (typeof value === 'string' && value.trim() !== '') {
            // If the value itself is a string, add it
            allInterests.push(value);
          }
        });
      }
    });

    // If no interests were found, return empty array
    if (allInterests.length === 0) {
      return [];
    }

    // Shuffle and select random interests
    const shuffled = [...allInterests].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  } catch (error) {
    console.error('Error extracting interests:', error);
    return [];
  }
};

/**
 * Creates a summary string based on random interests from a user's profile
 * @param superProfile The user's SuperProfile or Json data
 * @returns A formatted string with interests or a default message
 */
export const createInterestSummary = (superProfile: any): string => {
  // Validate if superProfile has the expected structure before attempting to use it
  if (!superProfile || typeof superProfile !== 'object') {
    return "Compañero ideal para conversar y descubrir nuevos temas.";
  }
  
  try {
    const randomInterests = getRandomInterestsFromSuperProfile(superProfile, 3);
    
    if (randomInterests.length === 0) {
      return "Compañero ideal para conversar y descubrir nuevos temas.";
    }
    
    if (randomInterests.length === 1) {
      return `Le interesa: ${randomInterests[0]}.`;
    }
    
    const lastInterest = randomInterests.pop();
    return `Le interesa: ${randomInterests.join(', ')} y ${lastInterest}.`;
  } catch (error) {
    console.error('Error al procesar el super_profile:', error);
    return "Compañero ideal para conversar y descubrir nuevos temas.";
  }
};
