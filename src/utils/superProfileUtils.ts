
// Este archivo actúa como punto de entrada para la API del SuperProfile
// Re-exporta todas las funcionalidades de los archivos más pequeños
// para mantener compatibilidad con el código existente

import { createEmptySuperProfile } from './superProfile/factory';
import { resetAllInterests, setInterestValue, extractInterestsFromSuperProfile } from './superProfile/helpers';
import { saveSuperProfile, loadSuperProfile, updateSuperProfileFromSelections } from './superProfile/database';

// Re-export types correctly with "export type"
export type { SuperProfile, OperationResult } from './superProfile/types';
  
// Factory functions
export { createEmptySuperProfile };
  
// Helper functions
export { resetAllInterests, setInterestValue, extractInterestsFromSuperProfile };
  
// Database operations
export { saveSuperProfile, loadSuperProfile, updateSuperProfileFromSelections };
