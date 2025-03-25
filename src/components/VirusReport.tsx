
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bug, RefreshCw, Download, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  fetchReportData,
  generateFormattedReport,
  saveReportToDatabase,
  getLatestReport,
  clearUserData
} from '@/services/dailyReportService';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const VirusReport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [threatCount, setThreatCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadLatestReport();
    }
  }, [currentUser]);

  // Simula un escaneo con progreso
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
        
        // Incrementar contador de amenazas aleatoriamente
        if (Math.random() > 0.7) {
          setThreatCount(prev => prev + 1);
        }
      }, 300);
      
      return () => clearInterval(interval);
    } else if (!isLoading && report) {
      setScanProgress(100);
    }
  }, [isGenerating, isLoading, report]);

  const checkAuthStatus = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user?.id) {
        toast.error('Debes iniciar sesión para acceder a esta función');
        setIsLoading(false);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
        
      setCurrentUser({
        id: userId,
        name: profile?.name || 'Usuario'
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      toast.error('Error al verificar la sesión');
      setIsLoading(false);
    }
  };
  
  const loadLatestReport = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      const latestReport = await getLatestReport(currentUser.id);
      
      if (latestReport) {
        setReport(latestReport);
      }
    } catch (error) {
      console.error('Error loading latest report:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateReport = async () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para generar un informe');
      return;
    }
    
    setIsGenerating(true);
    setScanProgress(0);
    setThreatCount(0);
    
    try {
      // Simular un pequeño retraso para la UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Obtener datos para el informe
      const reportData = await fetchReportData(currentUser.id);
      
      if (!reportData) {
        toast.error('Error al obtener datos para el informe');
        setIsGenerating(false);
        return;
      }
      
      // Generar informe formateado usando IA
      const formattedReport = await generateFormattedReport(reportData);
      
      // Guardar el informe en la base de datos
      await saveReportToDatabase(currentUser.id, reportData, formattedReport);
      
      // Actualizar el estado con el informe generado
      setReport(formattedReport);
      toast.success('Informe generado correctamente');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el informe');
    } finally {
      setIsGenerating(false);
      setScanProgress(100);
    }
  };
  
  const downloadReport = () => {
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-virus-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Informe descargado');
    
    // Mostrar confirmación para borrar datos
    setShowResetConfirm(true);
  };
  
  const resetUserData = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      const success = await clearUserData(currentUser.id);
      
      if (success) {
        toast.success('Datos eliminados correctamente. Se han borrado las notas y gastos registrados hoy.');
      } else {
        toast.error('Error al eliminar los datos');
      }
      
    } catch (error) {
      console.error('Error resetting user data:', error);
      toast.error('Error al eliminar los datos');
    } finally {
      setIsLoading(false);
      setShowResetConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <span className="ml-2 text-chelas-gray-dark">Inicializando análisis de virus...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black p-4 text-green-500 font-mono" style={{ fontFamily: 'monospace' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bug className="w-6 h-6 text-red-500 mr-2" />
          <h2 className="text-xl font-bold text-red-500">VIRUS SCAN v1.0</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-green-500 text-green-500 hover:bg-green-900"
            onClick={generateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Escaneando...' : 'Escanear ahora'}
          </Button>
          
          {report && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-green-500 text-green-500 hover:bg-green-900"
              onClick={downloadReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          )}
        </div>
      </div>
      
      {showResetConfirm && (
        <Alert variant="destructive" className="mb-4 bg-red-900 border-red-500 text-white">
          <AlertTitle>¿Borrar los datos de hoy?</AlertTitle>
          <AlertDescription>
            ¿Deseas borrar tus notas de conversación y registros de gastos de hoy?
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white text-white hover:bg-red-700"
                onClick={resetUserData}
              >
                Sí, borrar datos
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white text-white hover:bg-green-900"
                onClick={() => setShowResetConfirm(false)}
              >
                No, mantener datos
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-6 bg-chelas-gray-dark border border-green-500 relative overflow-hidden">
          <motion.div 
            className="h-full bg-green-500"
            style={{ width: `${scanProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${scanProgress}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className="text-xs text-black font-bold">
              {isGenerating ? 'SCANNING SYSTEM...' : 'SCAN COMPLETE'}
            </span>
            <span className="text-xs text-black font-bold">
              {scanProgress.toFixed(0)}%
            </span>
          </div>
        </div>
        
        {isGenerating && (
          <div className="mt-2 text-xs">
            <span className="text-red-500 mr-2">Amenazas detectadas: {threatCount}</span>
            <span className="text-green-500">Escaneando archivos del sistema...</span>
          </div>
        )}
      </div>
      
      {/* Report display */}
      <ScrollArea className="flex-grow bg-chelas-gray-dark border border-green-500 p-2 font-mono">
        {report ? (
          <pre className="text-green-400 text-xs whitespace-pre-wrap">{report}</pre>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-green-500">
            <Bug className="w-16 h-16 mb-4" />
            <p className="text-sm">No hay informes disponibles.</p>
            <p className="text-sm mt-2">Haz clic en "Escanear ahora" para generar un informe.</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="mt-4 text-xs text-green-400">
        <p>JAVASCRIPT SUMMIT VIRUS REPORT v1.0 - SISTEMA DE SEGURIDAD</p>
        <p className="mt-1">Todos los datos están cifrados y protegidos.</p>
      </div>
    </div>
  );
};

export default VirusReport;
