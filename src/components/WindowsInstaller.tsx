import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, X, HardDrive, User, Calendar, FileText, Star, Trophy, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useSystem } from '@/context/SystemContext';

const WindowsInstaller: React.FC = () => {
  // Get data from SystemContext
  const {
    userInfo,
    expenses,
    totalExpenses,
    gameScores,
    conversationPreferences,
    conversationNotes,
    darkMode
  } = useSystem();

  // Installation state
  const [currentStep, setCurrentStep] = useState(0);
  const [installProgress, setInstallProgress] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Steps for the installation wizard
  const steps = [
    { id: 'welcome', title: 'Bienvenido al Instalador de Windows' },
    { id: 'user', title: 'Información de Usuario' },
    { id: 'expenses', title: 'Datos Financieros' },
    { id: 'games', title: 'Puntuaciones de Juegos' },
    { id: 'conversations', title: 'Preferencias de Conversación' },
    { id: 'notes', title: 'Notas de Conversación' },
    { id: 'install', title: 'Instalación' },
    { id: 'complete', title: 'Instalación Completa' }
  ];

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Start installation process when reaching the install step
      if (steps[currentStep + 1].id === 'install') {
        startInstallation();
      }
    } else if (isComplete) {
      // Si estamos en el último paso y la instalación está completa,
      // generamos los archivos que aparecerán en la carpeta de descargas
      console.log('Instalación finalizada - Archivos de documentación generados');
      
      // Aquí podríamos implementar alguna lógica para guardar los datos en localStorage
      // o en una base de datos para que persistan entre sesiones
      localStorage.setItem('windows_installation_complete', 'true');
      localStorage.setItem('windows_installation_date', new Date().toISOString());
      
      // También podríamos disparar un evento para notificar a otros componentes
      const event = new CustomEvent('windows-installation-complete', {
        detail: {
          userInfo,
          expenses,
          gameScores,
          conversationPreferences,
          conversationNotes
        }
      });
      window.dispatchEvent(event);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0 && !isInstalling) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Simulate installation process
  const startInstallation = () => {
    setIsInstalling(true);
    setInstallProgress(0);
    
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsInstalling(false);
          setIsComplete(true);
          setCurrentStep(currentStep + 1); // Move to complete step
          return 100;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 300);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render step content based on current step
  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center p-4">
            <div className="flex justify-center mb-6">
              <HardDrive size={64} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold mb-4">Bienvenido al Asistente de Instalación de Windows</h2>
            <p className="mb-6">Este asistente le guiará a través del proceso de instalación de Windows en su computadora.</p>
            <p className="mb-6">Durante este proceso, se mostrarán los datos que hemos recopilado sobre su uso del sistema.</p>
            <p>Haga clic en "Siguiente" para continuar.</p>
          </div>
        );
        
      case 'user':
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <User size={32} className="text-blue-600 mr-4" />
              <h2 className="text-xl font-bold">Información de Usuario</h2>
            </div>
            
            <div className="win95-inset p-4 mb-4">
              <div className="mb-4">
                <p className="font-bold">Nombre de usuario:</p>
                <p>{userInfo.userName || 'Usuario no identificado'}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-bold">ID de usuario:</p>
                <p className="text-sm font-mono">{userInfo.userId || 'No disponible'}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-bold">Estado de autenticación:</p>
                <p>{userInfo.isAuthenticated ? 'Autenticado' : 'No autenticado'}</p>
              </div>
              
              <div>
                <p className="font-bold">Preferencia de tema:</p>
                <p>{darkMode ? 'Modo oscuro' : 'Modo claro'}</p>
              </div>
            </div>
          </div>
        );
        
      case 'expenses':
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <FileText size={32} className="text-blue-600 mr-4" />
              <h2 className="text-xl font-bold">Datos Financieros</h2>
            </div>
            
            <div className="win95-inset p-4 mb-4">
              <div className="mb-4">
                <p className="font-bold">Total de gastos:</p>
                <p className="text-lg">${totalExpenses.toFixed(2)}</p>
              </div>
              
              <div>
                <p className="font-bold mb-2">Últimos gastos:</p>
                {expenses.length > 0 ? (
                  <ScrollArea className="h-40 win95-inset p-2">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-400">
                          <th className="text-left p-1">Descripción</th>
                          <th className="text-right p-1">Precio</th>
                          <th className="text-right p-1">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.slice(0, 5).map((expense) => (
                          <tr key={expense.id} className="border-b border-gray-200">
                            <td className="p-1">{expense.description}</td>
                            <td className="text-right p-1">${expense.price.toFixed(2)}</td>
                            <td className="text-right p-1 text-xs">{formatDate(expense.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                ) : (
                  <p>No hay gastos registrados</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'games':
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Trophy size={32} className="text-blue-600 mr-4" />
              <h2 className="text-xl font-bold">Puntuaciones de Juegos</h2>
            </div>
            
            <div className="win95-inset p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="win95-inset p-3">
                  <p className="font-bold mb-2">Dino Runner</p>
                  <div className="flex justify-between mb-1">
                    <span>Puntuación actual:</span>
                    <span>{gameScores.dino?.score || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puntuación más alta:</span>
                    <span>{gameScores.dino?.highScore || 0}</span>
                  </div>
                </div>
                
                <div className="win95-inset p-3">
                  <p className="font-bold mb-2">Snake</p>
                  <div className="flex justify-between mb-1">
                    <span>Puntuación actual:</span>
                    <span>{gameScores.snake?.score || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puntuación más alta:</span>
                    <span>{gameScores.snake?.highScore || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'conversations':
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Star size={32} className="text-blue-600 mr-4" />
              <h2 className="text-xl font-bold">Preferencias de Conversación</h2>
            </div>
            
            <div className="win95-inset p-4 mb-4">
              {conversationPreferences.length > 0 ? (
                <ScrollArea className="h-48 win95-inset p-2">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-400">
                        <th className="text-left p-1">ID Conversación</th>
                        <th className="text-center p-1">Favorito</th>
                        <th className="text-center p-1">Seguimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversationPreferences.map((pref) => (
                        <tr key={pref.conversationId} className="border-b border-gray-200">
                          <td className="p-1 text-xs font-mono">{pref.conversationId.substring(0, 8)}...</td>
                          <td className="text-center p-1">
                            {pref.isFavorite ? <Check size={16} className="inline text-green-600" /> : <X size={16} className="inline text-red-600" />}
                          </td>
                          <td className="text-center p-1">
                            {pref.followUp ? <Check size={16} className="inline text-green-600" /> : <X size={16} className="inline text-red-600" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              ) : (
                <p>No hay preferencias de conversación guardadas</p>
              )}
            </div>
          </div>
        );
        
      case 'notes':
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <FileText size={32} className="text-blue-600 mr-4" />
              <h2 className="text-xl font-bold">Notas de Conversación</h2>
            </div>
            
            <div className="win95-inset p-4 mb-4">
              {conversationNotes.length > 0 ? (
                <ScrollArea className="h-48 win95-inset p-2">
                  {conversationNotes.map((note) => (
                    <div key={note.conversationId} className="mb-4 p-2 border-b border-gray-300">
                      <p className="font-bold text-xs mb-1">ID: {note.conversationId.substring(0, 8)}...</p>
                      <p className="text-sm">{note.notes}</p>
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <p>No hay notas de conversación guardadas</p>
              )}
            </div>
          </div>
        );
        
      case 'install':
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Cpu size={32} className="text-blue-600 mr-4" />
              <h2 className="text-xl font-bold">Instalando Windows</h2>
            </div>
            
            <div className="win95-inset p-4 mb-4">
              <p className="mb-4">Instalando componentes del sistema...</p>
              
              <Progress value={installProgress} className="mb-2" />
              <p className="text-right text-sm">{installProgress}% completado</p>
              
              <div className="mt-6">
                <p className="text-sm font-mono">
                  {installProgress < 30 && 'Copiando archivos...'}
                  {installProgress >= 30 && installProgress < 60 && 'Configurando componentes...'}
                  {installProgress >= 60 && installProgress < 90 && 'Registrando datos de usuario...'}
                  {installProgress >= 90 && 'Finalizando instalación...'}
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div className="text-center p-4">
            <div className="flex justify-center mb-6">
              <Check size={64} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-4">¡Instalación Completa!</h2>
            <p className="mb-6">Windows se ha instalado correctamente en su sistema.</p>
            <p className="mb-6">Todos sus datos han sido configurados y están listos para usar.</p>
            <p>Haga clic en "Finalizar" para comenzar a usar su sistema.</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with step indicator */}
      <div className="bg-chelas-button-face p-2 border-b border-chelas-gray-dark">
        <div className="flex justify-between items-center">
          <h3 className="text-black font-bold">{steps[currentStep].title}</h3>
          <div className="text-xs text-black">
            Paso {currentStep + 1} de {steps.length}
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-grow overflow-auto bg-chelas-window p-2">
        {renderStepContent()}
      </div>
      
      {/* Footer with navigation buttons */}
      <div className="bg-chelas-button-face p-2 border-t border-chelas-gray-dark flex justify-between">
        <Button 
          variant="default" 
          size="sm" 
          onClick={handlePrevious}
          disabled={currentStep === 0 || isInstalling}
          className="win95-button"
        >
          <ArrowLeft size={16} className="mr-2" />
          Anterior
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleNext}
          disabled={isInstalling}
          className="win95-button"
        >
          {isComplete ? 'Finalizar' : 'Siguiente'}
          {!isComplete && <ArrowRight size={16} className="ml-2" />}
        </Button>
      </div>
    </div>
  );
};

export default WindowsInstaller;