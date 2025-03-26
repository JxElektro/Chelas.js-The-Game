
import { supabase } from '@/integrations/supabase/client';
import { generateTopicWithOptions } from './deepseekService';
import { Json } from '@/integrations/supabase/types';

interface ReportData {
  expenses: {
    description: string;
    price: number;
    created_at: string;
  }[];
  conversations: {
    user_name: string;
    is_favorite: boolean;
    follow_up: boolean;
    topics: string[];
    notes?: string;
    contact_info?: string;
  }[];
}

export const fetchReportData = async (userId: string): Promise<ReportData | null> => {
  try {
    // Fetch expenses for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: expenses, error: expensesError } = await supabase
      .from('drink_expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString());
      
    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
      return null;
    }
    
    // Fetch conversations with follow-ups and favorites
    const { data: conversations, error: convsError } = await supabase
      .from('conversations')
      .select(`
        id,
        is_favorite,
        follow_up,
        user_b,
        started_at,
        profiles!conversations_user_b_fkey(name, super_profile)
      `)
      .eq('user_a', userId)
      .or(`is_favorite.eq.true,follow_up.eq.true`);
      
    if (convsError) {
      console.error('Error fetching conversations:', convsError);
      return null;
    }
    
    // Fetch topics for each conversation
    const conversationsWithTopics = await Promise.all(
      conversations.map(async (conv) => {
        const { data: topics } = await supabase
          .from('conversation_topics')
          .select('topic')
          .eq('conversation_id', conv.id);
          
        // Fetch conversation notes if any
        const { data: notes } = await supabase
          .from('conversation_notes')
          .select('notes')
          .eq('conversation_id', conv.id)
          .eq('user_id', userId)
          .maybeSingle();
        
        // Extract contact info from super_profile if available
        let contactInfo = '';
        if (conv.profiles?.super_profile) {
          // Treat super_profile safely
          const profile = conv.profiles.super_profile;
          
          // Check if it's an object with properties
          if (typeof profile === 'object' && profile !== null) {
            // Create a list of contact fields that exist
            const contactFields: string[] = [];
            
            // Extract fields safely using type indexing
            const typedProfile = profile as Record<string, unknown>;
            
            if (hasProperty(typedProfile, 'email')) contactFields.push(`Email: ${String(typedProfile['email'])}`);
            if (hasProperty(typedProfile, 'phone')) contactFields.push(`Teléfono: ${String(typedProfile['phone'])}`);
            if (hasProperty(typedProfile, 'company')) contactFields.push(`Compañía: ${String(typedProfile['company'])}`);
            if (hasProperty(typedProfile, 'position')) contactFields.push(`Cargo: ${String(typedProfile['position'])}`);
            if (hasProperty(typedProfile, 'website')) contactFields.push(`Web: ${String(typedProfile['website'])}`);
            
            // Check for redes_sociales object
            if (hasProperty(typedProfile, 'redes_sociales') && typeof typedProfile['redes_sociales'] === 'object') {
              const socialNetworks = typedProfile['redes_sociales'] as Record<string, unknown>;
              if (hasProperty(socialNetworks, 'linkedin')) contactFields.push(`LinkedIn: ${String(socialNetworks['linkedin'])}`);
              if (hasProperty(socialNetworks, 'twitter')) contactFields.push(`Twitter: ${String(socialNetworks['twitter'])}`);
              if (hasProperty(socialNetworks, 'instagram')) contactFields.push(`Instagram: ${String(socialNetworks['instagram'])}`);
            }
            
            contactInfo = contactFields.join(' | ');
          }
        }
          
        return {
          user_name: conv.profiles?.name || 'Usuario desconocido',
          is_favorite: conv.is_favorite,
          follow_up: conv.follow_up,
          topics: topics?.map(t => t.topic) || [],
          notes: notes?.notes,
          contact_info: contactInfo
        };
      })
    );
    
    return {
      expenses: expenses || [],
      conversations: conversationsWithTopics
    };
  } catch (error) {
    console.error('Error in fetchReportData:', error);
    return null;
  }
};

// Helper function to safely check if a property exists in an object
function hasProperty(obj: any, property: string): boolean {
  return obj && typeof obj === 'object' && property in obj;
}

export const generateFormattedReport = async (data: ReportData): Promise<string> => {
  try {
    // Create a structured report from the data
    const expenseTotal = data.expenses.reduce((sum, exp) => sum + Number(exp.price), 0);
    const expenseSummary = data.expenses.length > 0 
      ? `Has gastado un total de $${expenseTotal.toFixed(2)} en ${data.expenses.length} compras hoy.` 
      : 'No has registrado gastos hoy.';
      
    const favoriteUsers = data.conversations.filter(c => c.is_favorite).map(c => c.user_name);
    const followUpUsers = data.conversations.filter(c => c.follow_up);
    
    // Format follow-ups with more details
    const followUpsFormatted = followUpUsers.map(c => {
      return `- ${c.user_name}${c.contact_info ? ` (${c.contact_info})` : ''}${c.notes ? `\n  Notas: ${c.notes}` : ''}`;
    }).join('\n\n');
    
    // Collect all notes
    const allNotes = data.conversations
      .filter(c => c.notes && !c.follow_up) // Exclude follow-up notes as they're already listed above
      .map(c => `Notas sobre ${c.user_name}: ${c.notes}`)
      .join('\n\n');
    
    // Format expenses with details
    const expensesFormatted = data.expenses.map(e => 
      `- ${e.description}: $${Number(e.price).toFixed(2)} (${new Date(e.created_at).toLocaleTimeString()})`
    ).join('\n');
    
    // Construct a prompt for the AI
    const prompt = `
      Por favor formatea este informe diario en un estilo de reporte de seguridad informático/antivirus:
      
      RESUMEN DE GASTOS:
      ${expenseSummary}
      Detalles:
      ${expensesFormatted || "No hay gastos registrados"}
      Total a pagar: $${expenseTotal.toFixed(2)}
      
      CONTACTOS PARA SEGUIMIENTO:
      ${followUpsFormatted || "No hay contactos marcados para seguimiento."}
      
      USUARIOS FAVORITOS:
      ${favoriteUsers.length > 0 ? favoriteUsers.join(', ') : 'No hay usuarios favoritos.'}
      
      NOTAS ADICIONALES:
      ${allNotes || 'No hay notas adicionales registradas.'}
      
      Formatea todo como si fuera un informe de "amenazas detectadas" de un software antivirus, con secciones claras, usando emojis relevantes y terminología informática de manera humorística.
    `;
    
    // Use DeepseekService to format the report
    const mockProfiles = {
      super_profile: null,
      descripcion_personal: prompt
    };
    
    const formattedData = await generateTopicWithOptions({
      userAProfile: mockProfiles,
      userBProfile: mockProfiles,
      matchPercentage: 100
    });
    
    // Extract the formatted report from the response
    let formattedReport = "INFORME DE SEGURIDAD - JAVASCRIPT SUMMIT\n\n";
    
    formattedData.forEach(section => {
      formattedReport += section.question + "\n\n";
      
      section.options.forEach(option => {
        formattedReport += `${option.emoji} ${option.text}\n`;
      });
      
      formattedReport += "\n---\n\n";
    });
    
    return formattedReport;
  } catch (error) {
    console.error('Error generating formatted report:', error);
    return `ERROR AL GENERAR INFORME: ${error.message}`;
  }
};

export const saveReportToDatabase = async (userId: string, reportData: any, formattedReport: string): Promise<boolean> => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Check if a report already exists for today
    const { data: existingReport, error: checkError } = await supabase
      .from('daily_reports')
      .select('id')
      .eq('user_id', userId)
      .eq('report_date', currentDate)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing report:', checkError);
      return false;
    }
    
    if (existingReport) {
      // Update existing report
      const { error: updateError } = await supabase
        .from('daily_reports')
        .update({
          raw_data: reportData,
          formatted_report: formattedReport,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReport.id);
        
      if (updateError) {
        console.error('Error updating report:', updateError);
        return false;
      }
    } else {
      // Insert new report
      const { error: insertError } = await supabase
        .from('daily_reports')
        .insert({
          user_id: userId,
          report_date: currentDate,
          raw_data: reportData,
          formatted_report: formattedReport,
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error saving report:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveReportToDatabase:', error);
    return false;
  }
};

export const clearUserData = async (userId: string): Promise<boolean> => {
  try {
    // Delete all conversation notes for the user
    const { error: notesError } = await supabase
      .from('conversation_notes')
      .delete()
      .eq('user_id', userId);
      
    if (notesError) {
      console.error('Error deleting conversation notes:', notesError);
      return false;
    }
    
    // Delete all expenses for the user (only today's expenses)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { error: expensesError } = await supabase
      .from('drink_expenses')
      .delete()
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString());
      
    if (expensesError) {
      console.error('Error deleting expenses:', expensesError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

export const getLatestReport = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('formatted_report')
      .eq('user_id', userId)
      .order('report_date', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching latest report:', error);
      return null;
    }
    
    return data?.formatted_report || null;
  } catch (error) {
    console.error('Error in getLatestReport:', error);
    return null;
  }
};

export const saveConversationNotes = async (userId: string, conversationId: string, notes: string): Promise<boolean> => {
  try {
    // Check if notes already exist
    const { data: existingNotes, error: checkError } = await supabase
      .from('conversation_notes')
      .select('id')
      .eq('user_id', userId)
      .eq('conversation_id', conversationId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing notes:', checkError);
      return false;
    }
    
    if (existingNotes) {
      // Update existing notes
      const { error: updateError } = await supabase
        .from('conversation_notes')
        .update({
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingNotes.id);
        
      if (updateError) {
        console.error('Error updating notes:', updateError);
        return false;
      }
    } else {
      // Insert new notes
      const { error: insertError } = await supabase
        .from('conversation_notes')
        .insert({
          user_id: userId,
          conversation_id: conversationId,
          notes: notes,
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error inserting notes:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveConversationNotes:', error);
    return false;
  }
};

interface VirusReportData {
  userId: string;
  reportTitle: string;
  reportContent: string;
  scanType: string;
  threatCount: number;
  socialMediaData?: any;
  expensesData?: any;
  followUpData?: any;
  dinoScore?: number;
}

export const saveVirusReport = async (data: VirusReportData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('virus_reports')
      .insert({
        user_id: data.userId,
        report_title: data.reportTitle,
        report_content: data.reportContent,
        scan_type: data.scanType,
        threat_count: data.threatCount,
        social_media_data: data.socialMediaData || {},
        expenses_data: data.expensesData || {},
        follow_up_data: data.followUpData || {},
        dino_score: data.dinoScore
      });
      
    if (error) {
      console.error('Error saving virus report:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveVirusReport:', error);
    return false;
  }
};

export const getSavedVirusReports = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('virus_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching virus reports:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getSavedVirusReports:', error);
    return [];
  }
};
