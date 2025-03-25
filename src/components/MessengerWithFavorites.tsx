
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Lobby from '@/pages/Lobby';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FavoriteUser {
  id: string;
  name: string;
  avatar?: string;
}

const MessengerWithFavorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteUser[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (session?.session?.user?.id) {
          // Aquí se implementaría la consulta a la base de datos para obtener favoritos
          // Por ahora, mostramos un estado "sin favoritos"
          setFavorites([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, []);
  
  return (
    <div className="flex flex-col h-full w-full">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full border-b border-chelas-gray-dark flex-shrink-0"
      >
        <div className="flex items-center justify-between p-2 bg-chelas-button-face">
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-black" />
            <span className="text-sm font-bold text-black">Favoritos</span>
          </div>
          <CollapsibleTrigger className="win95-button p-0.5 h-5 w-5 flex items-center justify-center">
            {isOpen ? (
              <ChevronUp className="h-3 w-3 text-black" />
            ) : (
              <ChevronDown className="h-3 w-3 text-black" />
            )}
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <ScrollArea className="max-h-20 w-full">
            {loading ? (
              <div className="p-2 text-center text-xs text-black bg-white">
                Cargando favoritos...
              </div>
            ) : favorites.length > 0 ? (
              <div className="p-1">
                {favorites.map(favorite => (
                  <div 
                    key={favorite.id}
                    className="flex items-center p-1 hover:bg-chelas-gray-light cursor-pointer rounded text-black"
                  >
                    <div className="w-6 h-6 rounded-full bg-chelas-gray-light flex items-center justify-center mr-2">
                      {favorite.avatar || '👤'}
                    </div>
                    <span className="text-xs">{favorite.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-center text-xs text-black bg-white">
                No tienes contactos favoritos
              </div>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Contenedor para el Lobby con altura flexible que toma el espacio restante */}
      <div className="flex-grow min-h-0 overflow-hidden">
        <Lobby />
      </div>
    </div>
  );
};

export default MessengerWithFavorites;
