
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Button from '@/components/Button';
import { Upload, Check, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageUploaded?: (url: string) => void;
  bucketName?: string;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUploaded, 
  bucketName = 'screenshots',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);
    setError(null);

    try {
      // Subir archivo a Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setUploadedImage(publicUrl);
      if (onImageUploaded) {
        onImageUploaded(publicUrl);
      }
      toast.success('Imagen subida correctamente');
    } catch (error: any) {
      console.error('Error al subir la imagen:', error);
      setError(error.message || 'Error al subir la imagen');
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`p-4 border border-chelas-gray-dark bg-chelas-button-face ${className}`}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-black mb-2">
          Subir imagen
        </label>
        
        <div className="flex items-center space-x-2">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer shadow-win95-button px-4 py-2 bg-chelas-gray-medium hover:bg-chelas-gray-light flex items-center"
          >
            <Upload size={16} className="mr-2" />
            Seleccionar imagen
          </label>
          
          {isUploading && <span className="text-sm text-black">Subiendo...</span>}
        </div>
        
        {error && (
          <div className="mt-2 flex items-center text-red-500">
            <X size={16} className="mr-1" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {uploadedImage && (
          <div className="mt-4">
            <div className="flex items-center text-green-600 mb-2">
              <Check size={16} className="mr-1" />
              <span className="text-sm">Imagen subida correctamente</span>
            </div>
            <img 
              src={uploadedImage} 
              alt="Imagen subida" 
              className="max-w-full h-auto border border-chelas-gray-dark shadow-win95-inset p-1 bg-white" 
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
