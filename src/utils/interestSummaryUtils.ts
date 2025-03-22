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
    const randomInterests = getRandomInterestsFromSuperProfile(superProfile as SuperProfile, 3);
    
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
