
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
    linkedin: string; // Changed from facebook to linkedin
  };
  onProfileDataChange: (data: {
    name?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string; // Changed from facebook to linkedin
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
      <TabsList className="mb-4 bg-chelas-button-face border border-chelas-gray-dark">
        <TabsTrigger 
          value="general" 
          className="text-black data-[state=active]:bg-chelas-button-face data-[state=active]:shadow-win95-button-pressed"
        >
          General
        </TabsTrigger>
        <TabsTrigger 
          value="social" 
          className="text-black data-[state=active]:bg-chelas-button-face data-[state=active]:shadow-win95-button-pressed"
        >
          Redes Sociales
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <div>
          <Label htmlFor="user-name" className="text-black">Nombre de Usuario</Label>
          <Input
            id="user-name"
            value={profileData.name || ''}
            onChange={(e) => onProfileDataChange({ name: e.target.value })}
            placeholder="Tu nombre de usuario"
            className="win95-inset bg-white text-black border-chelas-gray-dark"
          />
        </div>
        
        <div>
          <Label htmlFor="personal-note" className="text-black">Descripción Personal</Label>
          <Textarea
            id="personal-note"
            className="min-h-[120px] win95-inset bg-white text-black border-chelas-gray-dark p-2"
            value={personalNote || ''}
            onChange={(e) => onPersonalNoteChange(e.target.value)}
            placeholder="Escribe una breve descripción sobre ti..."
          />
        </div>
      </TabsContent>
      
      <TabsContent value="social" className="space-y-4">
        <div>
          <Label htmlFor="instagram" className="text-black">Instagram</Label>
          <Input
            id="instagram"
            value={profileData.instagram || ''}
            onChange={(e) => onProfileDataChange({ instagram: e.target.value })}
            placeholder="@usuario"
            className="win95-inset bg-white text-black border-chelas-gray-dark"
          />
        </div>
        
        <div>
          <Label htmlFor="twitter" className="text-black">Twitter / X</Label>
          <Input
            id="twitter"
            value={profileData.twitter || ''}
            onChange={(e) => onProfileDataChange({ twitter: e.target.value })}
            placeholder="@usuario"
            className="win95-inset bg-white text-black border-chelas-gray-dark"
          />
        </div>
        
        <div>
          <Label htmlFor="linkedin" className="text-black">LinkedIn</Label>
          <Input
            id="linkedin"
            value={profileData.linkedin || ''}
            onChange={(e) => onProfileDataChange({ linkedin: e.target.value })}
            placeholder="URL o nombre de usuario"
            className="win95-inset bg-white text-black border-chelas-gray-dark"
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileInfoTab;
