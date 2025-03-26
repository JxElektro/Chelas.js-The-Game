
import { supabase } from '@/integrations/supabase/client';
import { HighScoreService } from './highScoreService';
import { fetchReportData, getLatestReport, getSavedVirusReports } from './dailyReportService';

export interface SystemContextData {
  expenses: {
    total: number;
    items: Array<{
      description: string;
      price: number;
      created_at: string;
    }>;
  };
  conversations: {
    followUps: Array<{
      user_name: string;
      contact_info?: string;
      notes?: string;
    }>;
    favorites: string[];
    allNotes: Array<{
      user_name: string;
      notes: string;
    }>;
  };
  dinoRunner: {
    played: boolean;
    highScore: number;
    ranking: number;
  };
  systemReports: {
    latestReport: string | null;
    savedReports: Array<{
      id: string;
      title: string;
      type: string;
      date: string;
      threatCount: number;
    }>;
  };
}

export class SystemContext {
  private static instance: SystemContext;
  private userId: string | null = null;
  private userName: string | null = null;
  private dinoService: HighScoreService | null = null;
  
  private constructor() {}
  
  public static getInstance(): SystemContext {
    if (!SystemContext.instance) {
      SystemContext.instance = new SystemContext();
    }
    return SystemContext.instance;
  }

  public async initialize(userId?: string, userName?: string): Promise<boolean> {
    if (!userId) {
      // Try to get current user
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user?.id) {
        console.error("No user session found");
        return false;
      }
      
      userId = sessionData.session.user.id;
      
      // Get user name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
        
      userName = profile?.name || 'Usuario';
    }
    
    this.userId = userId;
    this.userName = userName || 'Usuario';
    this.dinoService = new HighScoreService('dino');
    
    return true;
  }
  
  public async refreshSystemContext(): Promise<SystemContextData | null> {
    if (!this.userId) {
      const success = await this.initialize();
      if (!success) return null;
    }
    
    try {
      // Collect all system data in parallel
      const [reportData, dinoScores, latestReport, savedReports] = await Promise.all([
        fetchReportData(this.userId!),
        this.dinoService!.getHighScores(),
        getLatestReport(this.userId!),
        getSavedVirusReports(this.userId!)
      ]);
      
      if (!reportData) {
        console.error("Error fetching report data");
        return null;
      }
      
      // Find user's dino score and ranking
      const userDinoScore = dinoScores.find(s => s.user_id === this.userId);
      const userRanking = userDinoScore 
        ? dinoScores.findIndex(s => s.user_id === this.userId) + 1 
        : 0;
      
      // Calculate total expenses
      const expensesTotal = reportData.expenses.reduce(
        (sum, exp) => sum + Number(exp.price), 0
      );
      
      // Extract favorites
      const favoriteUsers = reportData.conversations
        .filter(c => c.is_favorite)
        .map(c => c.user_name);
      
      // Extract all notes (excluding follow-ups to avoid duplication)
      const allNotes = reportData.conversations
        .filter(c => c.notes && !c.follow_up)
        .map(c => ({ user_name: c.user_name, notes: c.notes || '' }));
      
      // Format saved reports
      const formattedReports = savedReports.map(r => ({
        id: r.id,
        title: r.report_title,
        type: r.scan_type,
        date: new Date(r.created_at || '').toLocaleString(),
        threatCount: r.threat_count || 0
      }));
      
      return {
        expenses: {
          total: expensesTotal,
          items: reportData.expenses
        },
        conversations: {
          followUps: reportData.conversations
            .filter(c => c.follow_up)
            .map(c => ({
              user_name: c.user_name,
              contact_info: c.contact_info,
              notes: c.notes
            })),
          favorites: favoriteUsers,
          allNotes: allNotes
        },
        dinoRunner: {
          played: !!userDinoScore,
          highScore: userDinoScore?.score || 0,
          ranking: userRanking
        },
        systemReports: {
          latestReport: latestReport,
          savedReports: formattedReports
        }
      };
    } catch (error) {
      console.error("Error refreshing system context:", error);
      return null;
    }
  }
  
  public async generateSystemReport(): Promise<string> {
    const systemContext = await this.refreshSystemContext();
    
    if (!systemContext) {
      return "ERROR: No se pudo obtener el contexto del sistema";
    }
    
    // Crear un informe de sistema formateado (estilo MS-DOS)
    const timestamp = new Date().toLocaleString();
    
    let report = `====== INFORME DE SISTEMA - ${timestamp} ======\n\n`;
    
    // Sección de Memoria del Sistema (Gastos)
    report += "[ MEMORIA DEL SISTEMA ]\n";
    report += `- Memoria Utilizada: $${systemContext.expenses.total.toFixed(2)}\n`;
    report += `- Bloques de Memoria: ${systemContext.expenses.items.length}\n\n`;
    
    if (systemContext.expenses.items.length > 0) {
      report += "Detalles de Memoria Asignada:\n";
      systemContext.expenses.items.forEach(item => {
        report += `> ${item.description}: $${Number(item.price).toFixed(2)}\n`;
      });
      report += "\n";
    }
    
    // Sección de Procesos Activos (Follow-ups)
    report += "[ PROCESOS ACTIVOS ]\n";
    
    if (systemContext.conversations.followUps.length > 0) {
      report += `- Procesos: ${systemContext.conversations.followUps.length}\n\n`;
      systemContext.conversations.followUps.forEach(followUp => {
        report += `> PROCESO: ${followUp.user_name}\n`;
        if (followUp.contact_info) report += `  Dirección: ${followUp.contact_info}\n`;
        if (followUp.notes) report += `  Notas: ${followUp.notes}\n`;
        report += "\n";
      });
    } else {
      report += "- No hay procesos activos en el sistema\n\n";
    }
    
    // Favoritos (como programas instalados)
    report += "[ PROGRAMAS FAVORITOS ]\n";
    if (systemContext.conversations.favorites.length > 0) {
      systemContext.conversations.favorites.forEach(fav => {
        report += `> ${fav}.exe\n`;
      });
    } else {
      report += "- No hay programas favoritos instalados\n";
    }
    report += "\n";
    
    // Rendimiento del Sistema (Dino Runner)
    report += "[ RENDIMIENTO DEL SISTEMA ]\n";
    if (systemContext.dinoRunner.played) {
      report += `- Benchmark Dino Runner: ${systemContext.dinoRunner.highScore} puntos\n`;
      report += `- Ranking global: #${systemContext.dinoRunner.ranking}\n`;
    } else {
      report += "- Benchmark Dino Runner: No ejecutado\n";
    }
    report += "\n";
    
    // Registro de Eventos (Notas)
    if (systemContext.conversations.allNotes.length > 0) {
      report += "[ REGISTRO DE EVENTOS ]\n";
      systemContext.conversations.allNotes.forEach(note => {
        report += `> ${note.user_name}: ${note.notes}\n`;
      });
      report += "\n";
    }
    
    // Informes de Seguridad
    report += "[ INFORMES DE SEGURIDAD ]\n";
    if (systemContext.systemReports.savedReports.length > 0) {
      report += `- Informes Disponibles: ${systemContext.systemReports.savedReports.length}\n\n`;
      systemContext.systemReports.savedReports.forEach(r => {
        report += `> ${r.title} (${r.date})\n`;
        report += `  Tipo: ${r.type === 'antivirus' ? 'Análisis Antivirus' : 'Follow Up'}\n`;
        report += `  Amenazas: ${r.threatCount}\n\n`;
      });
    } else {
      report += "- No hay informes de seguridad anteriores\n\n";
    }
    
    report += "======== FIN DEL INFORME ========\n";
    
    return report;
  }
  
  public getUserId(): string | null {
    return this.userId;
  }
  
  public getUserName(): string | null {
    return this.userName;
  }
}

// Exportar una instancia singleton global
export const SystemOS = SystemContext.getInstance();
