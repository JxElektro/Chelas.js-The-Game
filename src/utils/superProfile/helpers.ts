
import { SuperProfile } from './types';

/**
 * Establece todos los valores booleanos del perfil a false
 */
export function resetAllInterests(profile: SuperProfile) {
  // Recorremos la estructura y reseteamos todos los booleanos a false
  Object.keys(profile).forEach(tabKey => {
    const tab = profile[tabKey as keyof SuperProfile];
    
    Object.keys(tab).forEach(categoryKey => {
      const category = tab[categoryKey as string];
      
      Object.keys(category).forEach(interestKey => {
        // Saltamos el campo 'ia' que es string
        if (interestKey === 'ia') return;
        
        // @ts-ignore - Sabemos que es un objeto con propiedades booleanas
        if (typeof category[interestKey] === 'boolean') {
          // @ts-ignore
          category[interestKey] = false;
        }
      });
    });
  });
}

/**
 * Establece el valor de un interés específico en el perfil
 */
export function setInterestValue(profile: SuperProfile, interestId: string, value: boolean) {
  // Recorremos la estructura para encontrar y actualizar el interés específico
  Object.keys(profile).forEach(tabKey => {
    const tab = profile[tabKey as keyof SuperProfile];
    
    Object.keys(tab).forEach(categoryKey => {
      const category = tab[categoryKey as string];
      
      // Si la categoría tiene este interés, lo actualizamos
      if (Object.prototype.hasOwnProperty.call(category, interestId)) {
        // @ts-ignore - Sabemos que existe la propiedad
        if (typeof category[interestId] === 'boolean') {
          // @ts-ignore
          category[interestId] = value;
        }
      }
    });
  });
}

/**
 * Extrae intereses seleccionados del perfil en arrays separados
 */
export function extractInterestsFromSuperProfile(
  profile: SuperProfile,
  selectedArr: string[],
  avoidArr: string[]
) {
  // Recorremos todo el perfil
  Object.keys(profile).forEach(tabKey => {
    const tab = profile[tabKey as keyof SuperProfile];
    
    Object.keys(tab).forEach(categoryKey => {
      const category = tab[categoryKey as string];
      
      Object.keys(category).forEach(interestKey => {
        // Saltamos el campo 'ia' que es string
        if (interestKey === 'ia') return;
        
        // @ts-ignore - Sabemos que es un objeto con propiedades booleanas
        if (category[interestKey] === true) {
          // Si es de la categoría "avoid", va al array de evitar
          if (categoryKey === 'avoid') {
            avoidArr.push(interestKey);
          } else {
            selectedArr.push(interestKey);
          }
        }
      });
    });
  });
}
