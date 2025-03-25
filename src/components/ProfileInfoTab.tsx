
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ProfileInfoTabProps {
  profileData: {
    name: string;
    instagram: string;
    twitter: string;
    facebook: string;
  };
  onProfileDataChange: (data: {
    name?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  }) => void;
  personalNote: string;
  onPersonalNoteChange: (value: string) => void;
}

const ProfileInfoTab: React.FC<ProfileInfoTabProps> = ({
  profileData,
  onProfileDataChange,
  personalNote,
  onPersonalNoteChange
}) => {
  // Añadimos console.log para depuración
  console.log("ProfileInfoTab - profileData:", profileData);
  console.log("ProfileInfoTab - personalNote:", personalNote);

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="social">Redes Sociales</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <div>
          <Label htmlFor="user-name">Nombre de Usuario</Label>
          <Input
            id="user-name"
            value={profileData.name || ''}
            onChange={(e) => onProfileDataChange({ name: e.target.value })}
            placeholder="Tu nombre de usuario"
          />
        </div>
        
        <div>
          <Label htmlFor="personal-note">Descripción Personal</Label>
          <Textarea
            id="personal-note"
            className="min-h-[120px] win95-inset p-2"
            value={personalNote || ''}
            onChange={(e) => onPersonalNoteChange(e.target.value)}
            placeholder="Escribe una breve descripción sobre ti..."
          />
        </div>
      </TabsContent>
      
      <TabsContent value="social" className="space-y-4">
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={profileData.instagram || ''}
            onChange={(e) => onProfileDataChange({ instagram: e.target.value })}
            placeholder="@usuario"
          />
        </div>
        
        <div>
          <Label htmlFor="twitter">Twitter / X</Label>
          <Input
            id="twitter"
            value={profileData.twitter || ''}
            onChange={(e) => onProfileDataChange({ twitter: e.target.value })}
            placeholder="@usuario"
          />
        </div>
        
        <div>
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            value={profileData.facebook || ''}
            onChange={(e) => onProfileDataChange({ facebook: e.target.value })}
            placeholder="URL o nombre de usuario"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileInfoTab;
