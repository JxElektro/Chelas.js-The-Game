
// Este archivo actúa como punto de entrada para la API del SuperProfile
// Re-exporta todas las funcionalidades de los archivos más pequeños
// para mantener compatibilidad con el código existente

import { SuperProfile, OperationResult } from './superProfile/types';
import { createEmptySuperProfile } from './superProfile/factory';
import { resetAllInterests, setInterestValue, extractInterestsFromSuperProfile } from './superProfile/helpers';
import { saveSuperProfile, loadSuperProfile, updateSuperProfileFromSelections } from './superProfile/database';

export {
  // Types
  SuperProfile,
  OperationResult,
  
  // Factory functions
  createEmptySuperProfile,
  
  // Helper functions
  resetAllInterests,
  setInterestValue,
  extractInterestsFromSuperProfile,
  
  // Database operations
  saveSuperProfile,
  loadSuperProfile,
  updateSuperProfileFromSelections
};
