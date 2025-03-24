export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      conversation_topics: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          topic: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          topic: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_topics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ended_at: string | null
          follow_up: boolean
          id: string
          is_favorite: boolean
          match_percentage: number | null
          started_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          ended_at?: string | null
          follow_up?: boolean
          id?: string
          is_favorite?: boolean
          match_percentage?: number | null
          started_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          ended_at?: string | null
          follow_up?: boolean
          id?: string
          is_favorite?: boolean
          match_percentage?: number | null
          started_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drink_expenses: {
        Row: {
          created_at: string
          description: string
          id: string
          price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          price: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          price?: number
          user_id?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          category: Database["public"]["Enums"]["topic_category"]
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["topic_category"]
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["topic_category"]
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          analisis_externo: string | null
          avatar: string
          created_at: string
          descripcion_personal: string | null
          id: string
          is_available: boolean | null
          name: string
          super_profile: Json | null
          temas_preferidos: string[] | null
        }
        Insert: {
          analisis_externo?: string | null
          avatar: string
          created_at?: string
          descripcion_personal?: string | null
          id: string
          is_available?: boolean | null
          name: string
          super_profile?: Json | null
          temas_preferidos?: string[] | null
        }
        Update: {
          analisis_externo?: string | null
          avatar?: string
          created_at?: string
          descripcion_personal?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          super_profile?: Json | null
          temas_preferidos?: string[] | null
        }
        Relationships: []
      }
      snake_high_scores: {
        Row: {
          created_at: string
          id: string
          score: number
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          score: number
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string
          id: string
          interest_id: string
          is_avoided: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_id: string
          is_avoided?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_id?: string
          is_avoided?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_snake_high_score: {
        Args: {
          user_id_param: string
          user_name_param: string
          score_param: number
        }
        Returns: undefined
      }
      get_snake_high_scores: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          score: number
          user_id: string
          user_name: string
        }[]
      }
    }
    Enums: {
      topic_category:
        | "tech"
        | "movies"
        | "music"
        | "series_anime"
        | "books"
        | "travel"
        | "food"
        | "sports"
        | "art"
        | "hobbies"
        | "trends"
        | "humor"
        | "other"
        | "avoid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
