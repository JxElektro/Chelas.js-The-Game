
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Bug, RefreshCw, Download, X, Loader2, FolderOpen, Shield, FileWarning, Calendar, Terminal, Cpu, HardDrive } from 'lucide-react';
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
import { SystemOS, SystemContextData } from '@/services/systemContextService';
import { Badge } from "@/components/ui/badge";

const VirusReport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [threatCount, setThreatCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [systemContext, setSystemContext] = useState<SystemContextData | null>(null);
  const [showDownloads, setShowDownloads] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [systemMode, setSystemMode] = useState<boolean>(false);

  useEffect(() => {
    initializeSystem();
  }, []);

  // Inicializar el sistema operativo
  const initializeSystem = async () => {
    setIsLoading(true);
    try {
      // Inicializar el Sistema Operativo
      const initialized = await SystemOS.initialize();
      
      if (!initialized) {
        toast.error('Error al inicializar el Sistema Operativo');
        setIsLoading(false);
        return;
      }
      
      // Obtener el ID y nombre de usuario
      const userId = SystemOS.getUserId();
      const userName = SystemOS.getUserName();
      
      if (!userId) {
        toast.error('No se pudo obtener la información del usuario');
        setIsLoading(false);
        return;
      }
      
      // Configurar datos de usuario
      setCurrentUser({
        id: userId,
        name: userName || 'Usuario'
      });
      
      // Cargar el contexto del sistema
      await refreshSystemContext();
    } catch (error) {
      console.error('Error al inicializar el sistema:', error);
      toast.error('Error al inicializar el sistema');
    } finally {
      setIsLoading(false);
    }
  };

  // Refrescar el contexto del sistema
  const refreshSystemContext = async () => {
    try {
      const context = await SystemOS.refreshSystemContext();
      setSystemContext(context);
      
      // Cargar el último informe si existe
      if (context?.systemReports.latestReport) {
        setReport(context.systemReports.latestReport);
      }
      
      return context;
    } catch (error) {
      console.error('Error al refrescar el contexto del sistema:', error);
      toast.error('Error al obtener información del sistema');
      return null;
    }
  };
  
  // Generar un informe del sistema con formato Antivirus
  const generateSystemReport = async () => {
    if (!systemContext) {
      toast.error('El contexto del sistema no está disponible');
      return;
    }
    
    setIsGenerating(true);
    setScanProgress(0);
    setThreatCount(Math.floor(Math.random() * 5) + 1); // Simular amenazas aleatorias
    
    try {
      // Simular un pequeño retraso para la UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generar el informe del sistema
      const formattedReport = await generateFormattedReport(systemContext);
      
      if (!currentUser) {
        toast.error('No se encontró información del usuario');
        setIsGenerating(false);
        return;
      }
      
      // Guardar el informe en la base de datos
      await saveReportToDatabase(currentUser.id, systemContext, formattedReport);
      
      // Guardar el informe en la tabla virus_reports
      await saveVirusReport({
        userId: currentUser.id,
        reportTitle: `Análisis del Sistema - ${new Date().toLocaleDateString()}`,
        reportContent: formattedReport,
        scanType: 'system',
        threatCount: threatCount,
        socialMediaData: systemContext.conversations,
        expensesData: systemContext.expenses,
        followUpData: { contacts: systemContext.conversations.followUps },
        dinoScore: systemContext.dinoRunner.highScore
      });
      
      // Actualizar el estado con el informe generado
      setReport(formattedReport);
      toast.success('Informe del sistema generado');
      
      // Actualizar el contexto del sistema
      await refreshSystemContext();
    } catch (error) {
      console.error('Error generando informe del sistema:', error);
      toast.error('Error al generar informe del sistema');
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
    setThreatCount(Math.floor(Math.random() * 10) + 3); // Más amenazas para el antivirus
    toast.info('Iniciando escaneo de virus...');
    
    try {
      // Simular proceso de escaneo
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Obtener el contexto del sistema
      const context = await refreshSystemContext();
      
      if (!context) {
        setIsGenerating(false);
        return;
      }
      
      // Generar informe basado en los datos actuales del sistema
      const formattedReport = await SystemOS.generateSystemReport();
      
      // Guardar el informe en la base de datos
      await saveReportToDatabase(currentUser.id, context, formattedReport);
      
      // Guardar el informe en la tabla virus_reports
      await saveVirusReport({
        userId: currentUser.id,
        reportTitle: `Análisis de virus - ${new Date().toLocaleDateString()}`,
        reportContent: formattedReport,
        scanType: 'antivirus',
        threatCount: threatCount,
        socialMediaData: context.conversations,
        expensesData: context.expenses,
        followUpData: { contacts: context.conversations.followUps },
        dinoScore: context.dinoRunner.highScore
      });
      
      // Actualizar el estado con el informe generado
      setReport(formattedReport);
      toast.success(`Escaneo completado. Se han encontrado ${threatCount} amenazas.`);
      
      // Actualizar el contexto del sistema
      await refreshSystemContext();
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
    a.download = `informe-sistema-${new Date().toISOString().split('T')[0]}.txt`;
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
        // Actualizar el contexto del sistema
        await refreshSystemContext();
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
  
  const toggleSystemMode = () => {
    setSystemMode(!systemMode);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <span className="ml-2 text-chelas-gray-dark">Inicializando Sistema Operativo...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black p-4 text-green-500 font-mono" style={{ fontFamily: 'monospace' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {systemMode ? (
            <>
              <Cpu className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-bold text-blue-500">SISTEMA OPERATIVO</h2>
            </>
          ) : (
            <>
              <Shield className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-xl font-bold text-yellow-500">AVAST ANTIVIRUS</h2>
            </>
          )}
          <Badge 
            variant="outline" 
            className="ml-2 cursor-pointer border-gray-500 text-gray-300"
            onClick={toggleSystemMode}
          >
            Cambiar a {systemMode ? 'Antivirus' : 'Sistema'}
          </Badge>
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
            onClick={generateSystemReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : systemMode ? (
              <Terminal className="w-4 h-4 mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Analizando...' : systemMode ? 'Informe de Sistema' : 'Follow Up'}
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
      
      {/* Resumen del Sistema - Solo mostrar en modo sistema */}
      {systemMode && !showDownloads && systemContext && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="border border-blue-500 p-2">
            <div className="flex items-center text-blue-400 mb-1">
              <HardDrive className="w-4 h-4 mr-1" />
              <span className="text-xs font-bold">MEMORIA</span>
            </div>
            <div className="text-sm">
              <p>Total: ${systemContext.expenses.total.toFixed(2)}</p>
              <p>Bloques: {systemContext.expenses.items.length}</p>
            </div>
          </div>
          
          <div className="border border-blue-500 p-2">
            <div className="flex items-center text-blue-400 mb-1">
              <Terminal className="w-4 h-4 mr-1" />
              <span className="text-xs font-bold">PROCESOS</span>
            </div>
            <div className="text-sm">
              <p>Activos: {systemContext.conversations.followUps.length}</p>
              <p>Favoritos: {systemContext.conversations.favorites.length}</p>
            </div>
          </div>
          
          <div className="border border-blue-500 p-2">
            <div className="flex items-center text-blue-400 mb-1">
              <Cpu className="w-4 h-4 mr-1" />
              <span className="text-xs font-bold">RENDIMIENTO</span>
            </div>
            <div className="text-sm">
              <p>Dino Score: {systemContext.dinoRunner.highScore}</p>
              <p>Ranking: #{systemContext.dinoRunner.ranking || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress bar */}
      {!showDownloads && (
        <div className="mb-4">
          <div className="h-6 bg-chelas-gray-dark border border-green-500 relative overflow-hidden">
            <motion.div 
              className={`h-full ${systemMode ? 'bg-blue-500' : 'bg-green-500'}`}
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
              <span className={systemMode ? "text-blue-500" : "text-green-500"}>
                {systemMode ? 'Analizando componentes del sistema...' : 'Escaneando archivos del sistema...'}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Content area - Downloads or Report display */}
      <div className="flex-grow border border-green-500">
        {showDownloads ? (
          <div className="h-full">
            <div className={`${systemMode ? 'bg-blue-900' : 'bg-green-900'} ${systemMode ? 'text-blue-100' : 'text-green-100'} p-2 font-bold border-b ${systemMode ? 'border-blue-500' : 'border-green-500'}`}>
              Informes Guardados
            </div>
            <ScrollArea className="h-[calc(100%-2.5rem)] bg-black">
              {systemContext && systemContext.systemReports.savedReports.length > 0 ? (
                <Table>
                  <TableHeader className={`${systemMode ? 'bg-blue-900' : 'bg-green-900'} bg-opacity-20`}>
                    <TableRow>
                      <TableHead className={systemMode ? "text-blue-400" : "text-green-400"}>Título</TableHead>
                      <TableHead className={systemMode ? "text-blue-400" : "text-green-400"}>Tipo</TableHead>
                      <TableHead className={systemMode ? "text-blue-400" : "text-green-400"}>Fecha</TableHead>
                      <TableHead className={systemMode ? "text-blue-400" : "text-green-400"}>Amenazas</TableHead>
                      <TableHead className={systemMode ? "text-blue-400" : "text-green-400"}>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemContext.systemReports.savedReports.map((report) => (
                      <TableRow key={report.id} className={selectedReport === report.id ? (systemMode ? 'bg-blue-900 bg-opacity-20' : 'bg-green-900 bg-opacity-20') : ''}>
                        <TableCell className={systemMode ? "text-blue-300" : "text-green-300"}>{report.title}</TableCell>
                        <TableCell className={systemMode ? "text-blue-300" : "text-green-300"}>
                          {report.type === 'antivirus' ? (
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 text-yellow-500 mr-1" />
                              <span>Antivirus</span>
                            </div>
                          ) : report.type === 'system' ? (
                            <div className="flex items-center">
                              <Terminal className="w-4 h-4 text-blue-500 mr-1" />
                              <span>Sistema</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <RefreshCw className="w-4 h-4 text-green-500 mr-1" />
                              <span>Follow Up</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className={systemMode ? "text-blue-300" : "text-green-300"}>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {report.date}
                          </div>
                        </TableCell>
                        <TableCell className="text-red-400">
                          <div className="flex items-center">
                            <FileWarning className="w-4 h-4 mr-1" />
                            {report.threatCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline"
                            size="sm"
                            className={`border-${systemMode ? 'blue' : 'green'}-500 text-${systemMode ? 'blue' : 'green'}-500 hover:bg-${systemMode ? 'blue' : 'green'}-900`}
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
              <pre className={`${systemMode ? 'text-blue-400' : 'text-green-400'} text-xs whitespace-pre-wrap`}>{report}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-green-500">
                {systemMode ? (
                  <>
                    <Terminal className="w-16 h-16 mb-4 text-blue-500" />
                    <p className="text-sm text-blue-500">Sistema Operativo iniciado.</p>
                    <p className="text-sm mt-2 text-blue-500">Haz clic en "Informe de Sistema" para generar un informe del estado actual.</p>
                  </>
                ) : (
                  <>
                    <Shield className="w-16 h-16 mb-4" />
                    <p className="text-sm">No hay informes disponibles.</p>
                    <p className="text-sm mt-2">Haz clic en "Follow Up" o "Avast Antivirus" para generar un informe.</p>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        )}
      </div>
      
      <div className="mt-4 text-xs text-green-400">
        {systemMode ? (
          <p>SISTEMA OPERATIVO v1.0 - TODOS LOS DERECHOS RESERVADOS</p>
        ) : (
          <p>AVAST ANTIVIRUS SECURITY REPORT - SISTEMA DE SEGURIDAD</p>
        )}
        <p className="mt-1">Usuario: {currentUser?.name || 'Desconocido'} - Todos los datos están cifrados y protegidos.</p>
      </div>
    </div>
  );
};

export default VirusReport;
