
import { SuperProfile } from './superProfileUtils';

/**
 * Extracts a specified number of random interests from a user's SuperProfile
 * @param superProfile The user's SuperProfile object
 * @param count Number of interests to extract (default: 3)
 * @returns Array of interest names or empty array if none found
 */
export const getRandomInterestsFromSuperProfile = (
  superProfile: SuperProfile | null | undefined,
  count: number = 3
): string[] => {
  if (!superProfile) return [];
  
  // Collect all enabled interests from the SuperProfile
  const enabledInterests: string[] = [];
  
  // Loop through all tabs and categories to find enabled interests
  Object.keys(superProfile).forEach(tabKey => {
    const tab = superProfile[tabKey as keyof SuperProfile];
    
    // Skip 'evitar' tab (avoid interests)
    if (tabKey === 'evitar') return;
    
    Object.keys(tab).forEach(categoryKey => {
      const category = tab[categoryKey as string];
      
      Object.keys(category).forEach(interestKey => {
        // Skip the special 'ia' field which is a string
        if (interestKey === 'ia') return;
        
        // If this interest is enabled (true), add its formatted name to our list
        if (category[interestKey as keyof typeof category] === true) {
          // Format the interest name to be more readable
          const formattedName = interestKey
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          enabledInterests.push(formattedName);
        }
      });
    });
  });
  
  // If no interests found, return empty array
  if (enabledInterests.length === 0) return [];
  
  // Shuffle array and take the first 'count' elements
  const shuffled = [...enabledInterests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * Creates a summary string based on random interests from a user's profile
 * @param superProfile The user's SuperProfile
 * @returns A formatted string with interests or a default message
 */
export const createInterestSummary = (superProfile: SuperProfile | null | undefined): string => {
  const randomInterests = getRandomInterestsFromSuperProfile(superProfile, 3);
  
  if (randomInterests.length === 0) {
    return "Compañero de conversación para practicar tus habilidades sociales.";
  }
  
  if (randomInterests.length === 1) {
    return `Le interesa: ${randomInterests[0]}.`;
  }
  
  const lastInterest = randomInterests.pop();
  return `Le interesa: ${randomInterests.join(', ')} y ${lastInterest}.`;
};
