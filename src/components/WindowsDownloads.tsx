import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useSystem } from '@/context/SystemContext';
import { FolderOpen, FileText, Download, HardDrive, Monitor, Cpu, Database, Image, Camera, Calendar, FileCode } from 'lucide-react';

interface DownloadFile {
  id: string;
  title: string;
  type: 'manual' | 'driver' | 'system' | 'data' | 'image' | 'snapshot' | 'word';
  date: string;
  size: string;
  description: string;
  thumbnail?: string;
}

const WindowsDownloads: React.FC = () => {
  const { userInfo } = useSystem();
  const [downloadFiles, setDownloadFiles] = useState<DownloadFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  
  // Simular archivos de descarga generados por el instalador de Windows
  useEffect(() => {
    // Estos archivos se generarían cuando se completa la instalación de Windows
    // Incluyen snapshots de la noche y reportes de instalación
    const generatedFiles: DownloadFile[] = [
      {
        id: '1',
        title: 'Informe_Instalacion.log',
        type: 'system',
        date: new Date().toLocaleDateString('es-ES'),
        size: '128 KB',
        description: 'Registro detallado del proceso de instalación'
      },
      {
        id: '2',
        title: 'Snapshot_Inicio.jpg',
        type: 'snapshot',
        date: new Date().toLocaleDateString('es-ES'),
        size: '1.8 MB',
        description: 'Captura del inicio de la noche'
      },
      {
        id: '3',
        title: 'Snapshot_Amigos.jpg',
        type: 'snapshot',
        date: new Date().toLocaleDateString('es-ES'),
        size: '2.1 MB',
        description: 'Momento con amigos durante la noche'
      },
      {
        id: '4',
        title: 'Datos_Usuario.dat',
        type: 'data',
        date: new Date().toLocaleDateString('es-ES'),
        size: '64 KB',
        description: 'Datos de configuración del usuario'
      },
      {
        id: '5',
        title: 'Informe_Noche_1.docx',
        type: 'word',
        date: new Date().toLocaleDateString('es-ES'),
        size: '32 KB',
        description: 'Resumen de los eventos de la noche'
      },
      {
        id: '6',
        title: 'Snapshot_Bebidas.jpg',
        type: 'snapshot',
        date: new Date().toLocaleDateString('es-ES'),
        size: '1.5 MB',
        description: 'Registro de bebidas consumidas'
      },
      {
        id: '7',
        title: 'Gastos_Noche.xlsx',
        type: 'data',
        date: new Date().toLocaleDateString('es-ES'),
        size: '45 KB',
        description: 'Registro de gastos de la noche'
      },
      {
        id: '8',
        title: 'Snapshot_Final.jpg',
        type: 'snapshot',
        date: new Date().toLocaleDateString('es-ES'),
        size: '1.9 MB',
        description: 'Captura del final de la noche'
      },
      {
        id: '9',
        title: 'Informe_Noche_2.docx',
        type: 'word',
        date: new Date().toLocaleDateString('es-ES'),
        size: '38 KB',
        description: 'Informe detallado de la noche'
      },
      {
        id: '10',
        title: 'Informe_Noche_3.docx',
        type: 'word',
        date: new Date().toLocaleDateString('es-ES'),
        size: '42 KB',
        description: 'Memorias de la noche'
      }
    ];
    
    setDownloadFiles(generatedFiles);
  }, []);
  
  // Cargar contenido del archivo seleccionado
  const loadFileContent = (fileId: string) => {
    setSelectedFile(fileId);
    const file = downloadFiles.find(f => f.id === fileId);
    
    if (!file) {
      setFileContent(null);
      return;
    }
    
    // Generar contenido simulado basado en el tipo de archivo
    let content = '';
    
    switch (file.type) {
      case 'word':
      case 'manual':
        if (file.title.includes('Informe_Noche')) {
          content = `INFORME DE LA NOCHE - ${new Date().toLocaleDateString('es-ES')}

Usuario: ${userInfo.userName || 'Usuario'}

Este documento contiene un resumen de los eventos registrados durante la noche:

1. INICIO DE LA NOCHE
   - Hora de inicio: ${new Date().setHours(21, 0, 0)}
   - Ubicación inicial: Bar Las Chelas
   - Asistentes iniciales: 5 personas

2. ACTIVIDADES
   - Conversaciones registradas: 12
   - Bebidas consumidas: ${Math.floor(Math.random() * 10) + 5}
   - Fotos tomadas: 8

3. GASTOS
   - Total gastado: $${(Math.random() * 500 + 300).toFixed(2)}
   - Gasto promedio por persona: $${(Math.random() * 100 + 50).toFixed(2)}

4. FINALIZACIÓN
   - Hora de finalización: ${new Date().setHours(2, 30, 0)}
   - Estado final: Excelente noche

Gracias por utilizar el sistema de registro de noches.`;
        } else {
          content = `README - INFORMACIÓN IMPORTANTE

Esta instalación de Windows ha sido configurada específicamente para ${userInfo.userName || 'Usuario'}.

NOTAS IMPORTANTES:
- Mantenga su sistema actualizado
- Realice copias de seguridad regularmente
- No elimine los archivos de sistema

Todos los datos de usuario han sido configurados según las preferencias detectadas durante la instalación.`;
        }
        break;
        
      case 'driver':
        content = `ARCHIVO DE CONTROLADORES COMPRIMIDO

Este archivo contiene los siguientes controladores:
- Controlador de gráficos
- Controlador de audio
- Controlador de red
- Controladores de dispositivos USB
- Controladores de impresora

Estos controladores son necesarios para el funcionamiento óptimo de su hardware.`;
        break;
        
      case 'system':
        content = `LOG DE INSTALACIÓN - ${new Date().toLocaleString('es-ES')}

[INFO] Iniciando registro de noche
[INFO] Detectando ubicación
[INFO] Configurando sistema de registro
[INFO] Iniciando captura de momentos
[INFO] Activando sistema de seguimiento de gastos
[INFO] Configurando registro de bebidas
[INFO] Creando perfil de noche para: ${userInfo.userName || 'Usuario'}
[INFO] Configurando preferencias de usuario
[INFO] Finalizando registro
[SUCCESS] Registro de noche completado correctamente

Resumen:
- Duración total: ${Math.floor(Math.random() * 5) + 3} horas
- Momentos capturados: ${Math.floor(Math.random() * 15) + 5}
- Bebidas registradas: ${Math.floor(Math.random() * 10) + 3}
- Estado final: Noche memorable`;
        break;
        
      case 'data':
        if (file.title === 'Gastos_Noche.xlsx') {
          content = `REGISTRO DE GASTOS - ${new Date().toLocaleDateString('es-ES')}

Usuario: ${userInfo.userName || 'Usuario'}
ID de Sesión: ${userInfo.userId || 'No disponible'}

DETALLE DE GASTOS:

1. Bebidas: $${(Math.random() * 300 + 200).toFixed(2)}
   - Cervezas: $${(Math.random() * 150 + 100).toFixed(2)}
   - Cócteles: $${(Math.random() * 100 + 50).toFixed(2)}
   - Shots: $${(Math.random() * 50 + 30).toFixed(2)}

2. Comida: $${(Math.random() * 150 + 100).toFixed(2)}

3. Transporte: $${(Math.random() * 80 + 50).toFixed(2)}

4. Otros gastos: $${(Math.random() * 70 + 30).toFixed(2)}

TOTAL: $${(Math.random() * 500 + 300).toFixed(2)}

Este registro fue generado automáticamente.`;
        } else {
          content = `DATOS DE USUARIO - ARCHIVO DE CONFIGURACIÓN

ID de Usuario: ${userInfo.userId || 'No disponible'}
Nombre: ${userInfo.userName || 'Usuario'}
Preferencia de tema: ${userInfo.darkMode ? 'Oscuro' : 'Claro'}

Configuraciones guardadas:
- Preferencias de bebidas
- Límite de gastos
- Contactos favoritos
- Ubicaciones frecuentes

Este archivo contiene datos sensibles. No lo modifique manualmente.`;
        }
        break;
        
      case 'snapshot':
        content = `[Esta es una imagen capturada durante la noche]

Nombre: ${file.title}
Fecha: ${file.date}
Tamaño: ${file.size}

Descripción: ${file.description}

[Para ver la imagen completa, haga doble clic en el archivo]`;
        break;
        
      default:
        content = 'No se puede mostrar el contenido de este archivo.';
    }
    
    setFileContent(content);
  };
  
  // Renderizar icono según el tipo de archivo
  const renderFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'word':
        return <FileCode className="w-5 h-5 text-blue-700" />;
      case 'manual':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'driver':
        return <Cpu className="w-5 h-5 text-green-500" />;
      case 'system':
        return <Monitor className="w-5 h-5 text-yellow-500" />;
      case 'data':
        return <Database className="w-5 h-5 text-purple-500" />;
      case 'snapshot':
        return <Camera className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-indigo-500" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white p-2 border-b border-gray-300">
        <div className="flex items-center">
          <FolderOpen className="text-yellow-600 mr-2" size={20} />
          <h3 className="text-black font-bold">Snapshots de la Noche</h3>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-grow flex overflow-hidden">
        {/* File list - styled like a classic white Windows folder */}
        <div className="w-1/2 border-r border-gray-300">
          <div className="bg-gray-100 p-1 border-b border-gray-300">
            <span className="text-xs text-black font-bold">Archivos ({downloadFiles.length})</span>
          </div>
          
          <ScrollArea className="h-[calc(100%-1.75rem)] bg-white">
            <div className="p-2 grid grid-cols-3 gap-2">
              {downloadFiles.map((file) => (
                <div 
                  key={file.id} 
                  className={`cursor-pointer flex flex-col items-center p-2 rounded ${selectedFile === file.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => loadFileContent(file.id)}
                >
                  <div className="mb-1">{renderFileIcon(file.type)}</div>
                  <span className="text-xs text-center truncate w-full">{file.title}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* File content */}
        <div className="w-1/2">
          <div className="bg-gray-100 p-1 border-b border-gray-300">
            <span className="text-xs text-black font-bold">
              {selectedFile ? downloadFiles.find(f => f.id === selectedFile)?.title : 'Vista previa'}
            </span>
          </div>
          
          <ScrollArea className="h-[calc(100%-1.75rem)] bg-white p-2">
            {fileContent ? (
              <div>
                {downloadFiles.find(f => f.id === selectedFile)?.type === 'snapshot' ? (
                  <div className="flex flex-col items-center">
                    <div className="border border-gray-300 p-1 mb-3 bg-gray-50 w-full max-w-md mx-auto">
                      <div className="bg-gray-200 h-48 flex items-center justify-center">
                        <Camera size={48} className="text-gray-400" />
                      </div>
                    </div>
                    <pre className="text-xs font-mono whitespace-pre-wrap w-full">{fileContent}</pre>
                  </div>
                ) : (
                  <pre className="text-xs font-mono whitespace-pre-wrap">{fileContent}</pre>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <HardDrive className="w-16 h-16 mb-4" />
                <p className="text-sm">Seleccione un archivo para ver su contenido</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-100 p-2 border-t border-gray-300 flex justify-between">
        <div className="text-xs text-black">
          {selectedFile && (
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{downloadFiles.find(f => f.id === selectedFile)?.date}</span>
              <span className="mx-2">|</span>
              <span>{downloadFiles.find(f => f.id === selectedFile)?.description}</span>
            </div>
          )}
        </div>
        
        {selectedFile && (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-gray-200 hover:bg-gray-300 text-black border border-gray-400"
            onClick={() => console.log(`Guardando: ${downloadFiles.find(f => f.id === selectedFile)?.title}`)}
          >
            <Download size={14} className="mr-1" />
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
};

export default WindowsDownloads;