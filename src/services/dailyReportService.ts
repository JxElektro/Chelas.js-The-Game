
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
    contact_info?: string; // Añadimos información de contacto
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
    // Fix the query to specify the profiles relationship explicitly
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
        
        // Extraer información de contacto del super_profile si está disponible
        let contactInfo = '';
        if (conv.profiles?.super_profile) {
          // Tratamos de manera segura el objeto super_profile
          const profile = conv.profiles.super_profile;
          
          // Verificamos si es un objeto con propiedades
          if (typeof profile === 'object' && profile !== null) {
            // Creamos una lista de campos de contacto que existen
            const contactFields: string[] = [];
            
            // Extraer de forma segura los campos utilizando indexación de tipo
            const typedProfile = profile as Record<string, unknown>;
            
            if (hasProperty(typedProfile, 'email')) contactFields.push(`Email: ${String(typedProfile['email'])}`);
            if (hasProperty(typedProfile, 'phone')) contactFields.push(`Teléfono: ${String(typedProfile['phone'])}`);
            if (hasProperty(typedProfile, 'company')) contactFields.push(`Compañía: ${String(typedProfile['company'])}`);
            if (hasProperty(typedProfile, 'position')) contactFields.push(`Cargo: ${String(typedProfile['position'])}`);
            if (hasProperty(typedProfile, 'website')) contactFields.push(`Web: ${String(typedProfile['website'])}`);
            if (hasProperty(typedProfile, 'linkedin')) contactFields.push(`LinkedIn: ${String(typedProfile['linkedin'])}`);
            if (hasProperty(typedProfile, 'twitter')) contactFields.push(`Twitter: ${String(typedProfile['twitter'])}`);
            
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
    
    // Formateamos los seguimientos con más detalle
    const followUpsFormatted = followUpUsers.map(c => {
      return `- ${c.user_name}${c.contact_info ? ` (${c.contact_info})` : ''}${c.notes ? `\n  Notas: ${c.notes}` : ''}`;
    }).join('\n\n');
    
    // Recopilamos todas las notas (este es el cambio principal)
    const allNotes = data.conversations
      .filter(c => c.notes && !c.follow_up) // Excluimos las notas de follow-up ya que están arriba
      .map(c => `Notas sobre ${c.user_name}: ${c.notes}`)
      .join('\n\n');
    
    // Formateamos todos los gastos con detalle
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
    // Since we're using the topic generator in a non-standard way,
    // we'll just concatenate the questions as our report
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
    const { data, error } = await supabase
      .from('daily_reports')
      .upsert({
        user_id: userId,
        report_date: new Date().toISOString().split('T')[0],
        raw_data: reportData,
        formatted_report: formattedReport,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id, report_date'
      });
      
    if (error) {
      console.error('Error saving report:', error);
      return false;
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
    const { data, error } = await supabase
      .from('conversation_notes')
      .upsert({
        user_id: userId,
        conversation_id: conversationId,
        notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id, conversation_id'
      });
      
    if (error) {
      console.error('Error saving conversation notes:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveConversationNotes:', error);
    return false;
  }
};
