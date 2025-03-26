
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bug, RefreshCw, Download, X, Loader2, FolderOpen, Shield, FileWarning, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  fetchReportData,
  generateFormattedReport,
  saveReportToDatabase,
  getLatestReport,
  clearUserData,
  saveVirusReport
} from '@/services/dailyReportService';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VirusReport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [threatCount, setThreatCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dinoRunerData, setDinoRunerData] = useState<{ played: boolean; score: number }>({
    played: false,
    score: 0
  });
  const [savedReports, setSavedReports] = useState<Array<{
    id: string;
    report_title: string;
    scan_type: string;
    created_at: string;
    threat_count: number;
  }>>([]);
  const [showDownloads, setShowDownloads] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadLatestReport();
      fetchDinoRunerData();
      fetchSavedReports();
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

  // Función para obtener los informes guardados
  const fetchSavedReports = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('virus_reports')
        .select('id, report_title, scan_type, created_at, threat_count')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching saved reports:', error);
        return;
      }
      
      if (data) {
        setSavedReports(data);
      }
    } catch (error) {
      console.error('Error fetching saved reports:', error);
    }
  };

  // Función para obtener datos del juego Dino Runer
  const fetchDinoRunerData = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('dino_high_scores')
        .select('score')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching dino scores:', error);
        return;
      }
      
      if (data) {
        setDinoRunerData({
          played: true,
          score: data.score
        });
      }
    } catch (error) {
      console.error('Error fetching dino data:', error);
    }
  };
  
  // Función que genera el contexto para el informe
  const generateVirusReportContext = async () => {
    if (!currentUser) return null;
    
    try {
      // Obtener datos para el informe
      const reportData = await fetchReportData(currentUser.id);
      
      if (!reportData) {
        toast.error('Error al obtener datos para el informe');
        return null;
      }
      
      // Crear el objeto de contexto para la IA
      const contextData = {
        socialMediaInfo: {}, // Se extraerá de los perfiles
        followUps: reportData.conversations.filter(c => c.follow_up),
        expenses: reportData.expenses,
        expensesTotal: reportData.expenses.reduce((sum, exp) => sum + Number(exp.price), 0),
        conversationNotes: reportData.conversations
          .filter(c => c.notes)
          .map(c => ({ user: c.user_name, notes: c.notes })),
        dinoRuner: dinoRunerData,
        reportPrompt: "Informe de virus: Resumen de la noche, incluyendo gastos, follow ups y resultados de Dino Runer."
      };
      
      return contextData;
    } catch (error) {
      console.error('Error generating context:', error);
      return null;
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
      
      // Generar el contexto completo con todos los datos requeridos
      const contextData = await generateVirusReportContext();
      
      if (!contextData) {
        setIsGenerating(false);
        return;
      }
      
      // Generar informe formateado usando IA con el contexto completo
      const formattedReport = await generateFormattedReport(reportData);
      
      // Guardar el informe en la base de datos
      await saveReportToDatabase(currentUser.id, contextData, formattedReport);
      
      // Guardar el informe en la tabla virus_reports
      await saveVirusReport({
        userId: currentUser.id,
        reportTitle: `Análisis Follow Up - ${new Date().toLocaleDateString()}`,
        reportContent: formattedReport,
        scanType: 'follow_up',
        threatCount: threatCount,
        socialMediaData: contextData.socialMediaInfo,
        expensesData: { items: contextData.expenses, total: contextData.expensesTotal },
        followUpData: { contacts: contextData.followUps },
        dinoScore: contextData.dinoRuner.score
      });
      
      // Actualizar el estado con el informe generado
      setReport(formattedReport);
      toast.success('Informe generado correctamente');
      
      // Actualizar la lista de informes guardados
      fetchSavedReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el informe');
    } finally {
      setIsGenerating(false);
      setScanProgress(100);
    }
  };
  
  // Simular el escaneo de virus (Avast Antivirus)
  const simulateVirusScan = async () => {
    if (!currentUser) {
      toast.error('Debes iniciar sesión para escanear virus');
      return;
    }
    
    setIsGenerating(true);
    setScanProgress(0);
    setThreatCount(0);
    toast.info('Iniciando escaneo de virus...');
    
    try {
      // Simular proceso de escaneo
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generar el contexto completo igual que para el informe normal
      const contextData = await generateVirusReportContext();
      
      if (!contextData) {
        setIsGenerating(false);
        return;
      }
      
      // Obtener datos para el informe
      const reportData = await fetchReportData(currentUser.id);
      
      if (!reportData) {
        toast.error('Error al obtener datos para el informe');
        setIsGenerating(false);
        return;
      }
      
      // Generar informe formateado usando IA con el mismo contexto
      const formattedReport = await generateFormattedReport(reportData);
      
      // Guardar el informe en la base de datos
      await saveReportToDatabase(currentUser.id, contextData, formattedReport);
      
      // Guardar el informe en la tabla virus_reports
      await saveVirusReport({
        userId: currentUser.id,
        reportTitle: `Análisis de virus - ${new Date().toLocaleDateString()}`,
        reportContent: formattedReport,
        scanType: 'antivirus',
        threatCount: threatCount,
        socialMediaData: contextData.socialMediaInfo,
        expensesData: { items: contextData.expenses, total: contextData.expensesTotal },
        followUpData: { contacts: contextData.followUps },
        dinoScore: contextData.dinoRuner.score
      });
      
      // Actualizar el estado con el informe generado
      setReport(formattedReport);
      toast.success('Escaneo completado. Se han encontrado amenazas.');
      
      // Actualizar la lista de informes guardados
      fetchSavedReports();
    } catch (error) {
      console.error('Error in virus scan:', error);
      toast.error('Error durante el escaneo de virus');
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

  // Función para cargar un informe guardado
  const loadSavedReport = async (reportId: string) => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('virus_reports')
        .select('report_content')
        .eq('id', reportId)
        .eq('user_id', currentUser.id)
        .single();
        
      if (error) {
        console.error('Error loading saved report:', error);
        toast.error('Error al cargar el informe');
        return;
      }
      
      if (data) {
        setReport(data.report_content);
        setSelectedReport(reportId);
      }
    } catch (error) {
      console.error('Error loading saved report:', error);
      toast.error('Error al cargar el informe');
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Shield className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-yellow-500">AVAST ANTIVIRUS</h2>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-green-500 text-green-500 hover:bg-green-900"
            onClick={() => setShowDownloads(!showDownloads)}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Descargas
          </Button>
          
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
            {isGenerating ? 'Escaneando...' : 'Follow Up'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-900"
            onClick={simulateVirusScan}
            disabled={isGenerating}
          >
            <Shield className="w-4 h-4 mr-2" />
            Avast Antivirus
          </Button>
          
          {report && !showDownloads && (
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
      {!showDownloads && (
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
      )}
      
      {/* Content area - Downloads or Report display */}
      <div className="flex-grow border border-green-500">
        {showDownloads ? (
          <div className="h-full">
            <div className="bg-green-900 text-green-100 p-2 font-bold border-b border-green-500">
              Informes Guardados
            </div>
            <ScrollArea className="h-[calc(100%-2.5rem)] bg-black">
              {savedReports.length > 0 ? (
                <Table>
                  <TableHeader className="bg-green-900 bg-opacity-20">
                    <TableRow>
                      <TableHead className="text-green-400">Título</TableHead>
                      <TableHead className="text-green-400">Tipo</TableHead>
                      <TableHead className="text-green-400">Fecha</TableHead>
                      <TableHead className="text-green-400">Amenazas</TableHead>
                      <TableHead className="text-green-400">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedReports.map((report) => (
                      <TableRow key={report.id} className={selectedReport === report.id ? 'bg-green-900 bg-opacity-20' : ''}>
                        <TableCell className="text-green-300">{report.report_title}</TableCell>
                        <TableCell className="text-green-300">
                          {report.scan_type === 'antivirus' ? (
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 text-yellow-500 mr-1" />
                              <span>Antivirus</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <RefreshCw className="w-4 h-4 text-green-500 mr-1" />
                              <span>Follow Up</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-green-300">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(report.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-red-400">
                          <div className="flex items-center">
                            <FileWarning className="w-4 h-4 mr-1" />
                            {report.threat_count}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-500 hover:bg-green-900"
                            onClick={() => {
                              loadSavedReport(report.id);
                              setShowDownloads(false);
                            }}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-green-500 p-4">
                  <FileWarning className="w-16 h-16 mb-4" />
                  <p>No hay informes guardados todavía</p>
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="h-full bg-chelas-gray-dark p-2 font-mono">
            {report ? (
              <pre className="text-green-400 text-xs whitespace-pre-wrap">{report}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-green-500">
                <Shield className="w-16 h-16 mb-4" />
                <p className="text-sm">No hay informes disponibles.</p>
                <p className="text-sm mt-2">Haz clic en "Follow Up" o "Avast Antivirus" para generar un informe.</p>
              </div>
            )}
          </ScrollArea>
        )}
      </div>
      
      <div className="mt-4 text-xs text-green-400">
        <p>AVAST ANTIVIRUS SECURITY REPORT - SISTEMA DE SEGURIDAD</p>
        <p className="mt-1">Todos los datos están cifrados y protegidos.</p>
      </div>
    </div>
  );
};

export default VirusReport;
