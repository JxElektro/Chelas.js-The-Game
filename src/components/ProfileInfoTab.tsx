
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileInfoTabProps {
  profileData: {
    name: string;
    email: string;
    instagram: string;
    twitter: string;
    facebook: string;
  };
  onProfileDataChange: (data: Partial<ProfileInfoTabProps['profileData']>) => void;
  personalNote: string;
  onPersonalNoteChange: (value: string) => void;
}

const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
  profileData,
  onProfileDataChange,
  personalNote,
  onPersonalNoteChange
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4 p-2">
      <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-black mb-2`}>Información Personal</h3>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-black text-sm">Nombre</Label>
          <Input
            id="name"
            value={profileData.name}
            onChange={(e) => onProfileDataChange({ name: e.target.value })}
            className="border-chelas-gray-dark text-black"
            placeholder="Tu nombre"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-black text-sm">Email</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => onProfileDataChange({ email: e.target.value })}
            className="border-chelas-gray-dark text-black"
            placeholder="tu@email.com"
          />
        </div>
      </div>
      
      <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-black mt-4 mb-2`}>Redes Sociales</h3>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <Label htmlFor="instagram" className="text-black text-sm flex items-center">
            <Instagram size={16} className="mr-1" /> Instagram
          </Label>
          <Input
            id="instagram"
            value={profileData.instagram}
            onChange={(e) => onProfileDataChange({ instagram: e.target.value })}
            className="border-chelas-gray-dark text-black"
            placeholder="@tu_usuario"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="twitter" className="text-black text-sm flex items-center">
            <Twitter size={16} className="mr-1" /> Twitter
          </Label>
          <Input
            id="twitter"
            value={profileData.twitter}
            onChange={(e) => onProfileDataChange({ twitter: e.target.value })}
            className="border-chelas-gray-dark text-black"
            placeholder="@tu_usuario"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="facebook" className="text-black text-sm flex items-center">
            <Facebook size={16} className="mr-1" /> Facebook
          </Label>
          <Input
            id="facebook"
            value={profileData.facebook}
            onChange={(e) => onProfileDataChange({ facebook: e.target.value })}
            className="border-chelas-gray-dark text-black"
            placeholder="facebook.com/tu_usuario"
          />
        </div>
      </div>
      
      <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-black mt-4 mb-2`}>Sobre Mí</h3>
      
      <div className="space-y-2">
        <Label htmlFor="personal-note" className="text-black text-sm">Descripción personal</Label>
        <Textarea
          id="personal-note"
          value={personalNote}
          onChange={(e) => onPersonalNoteChange(e.target.value)}
          className="border-chelas-gray-dark text-black min-h-[100px]"
          placeholder="Cuéntanos un poco sobre ti..."
        />
      </div>
    </div>
  );
};

export default ProfileInfoTab;
