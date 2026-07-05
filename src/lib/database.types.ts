export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      auth_audit: {
        Row: {
          created_at: string
          email: string
          event: string
          id: string
          ip: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          body: string
          created_at: string | null
          excerpt: string
          id: string
          published_at: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string | null
          excerpt: string
          id?: string
          published_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string | null
          excerpt?: string
          id?: string
          published_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          anon_id: string | null
          comment_id: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          comment_id: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          anon_id: string | null
          comment_id: string
          created_at: string
          id: string
          reason: string | null
          reporter_user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          comment_id: string
          created_at?: string
          id?: string
          reason?: string | null
          reporter_user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          comment_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          reporter_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reports_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_moderated: boolean | null
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_moderated?: boolean | null
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_moderated?: boolean | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      editions: {
        Row: {
          edition_date: string
          id: string
          is_current: boolean
          run_number: number
          started_at: string
        }
        Insert: {
          edition_date: string
          id?: string
          is_current?: boolean
          run_number: number
          started_at?: string
        }
        Update: {
          edition_date?: string
          id?: string
          is_current?: boolean
          run_number?: number
          started_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          actor_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          actor_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          anon_id: string | null
          created_at: string | null
          id: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          created_at?: string | null
          id?: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string
          id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          identifier: string
          window_start: string
        }
        Insert: {
          count?: number
          identifier: string
          window_start?: string
        }
        Update: {
          count?: number
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      reader_submissions: {
        Row: {
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string
          submitter_email: string | null
          submitter_name: string
          tags: string[]
          title: string
        }
        Insert: {
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submitter_email?: string | null
          submitter_name: string
          tags?: string[]
          title: string
        }
        Update: {
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submitter_email?: string | null
          submitter_name?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      self_report_reviews: {
        Row: {
          comments: string
          created_at: string
          disclosure_compliance: string
          escalation_needed: boolean
          evidence_provided: string
          hours_saved_reasonable: string
          id: string
          report_id: string
          reviewer_id: string
          submitted_on_time: string
          tool_usage_credible: string
          updated_at: string
          weekly_status: string
          workflow_doc_progress: string
        }
        Insert: {
          comments?: string
          created_at?: string
          disclosure_compliance: string
          escalation_needed?: boolean
          evidence_provided: string
          hours_saved_reasonable: string
          id?: string
          report_id: string
          reviewer_id: string
          submitted_on_time: string
          tool_usage_credible: string
          updated_at?: string
          weekly_status: string
          workflow_doc_progress: string
        }
        Update: {
          comments?: string
          created_at?: string
          disclosure_compliance?: string
          escalation_needed?: boolean
          evidence_provided?: string
          hours_saved_reasonable?: string
          id?: string
          report_id?: string
          reviewer_id?: string
          submitted_on_time?: string
          tool_usage_credible?: string
          updated_at?: string
          weekly_status?: string
          workflow_doc_progress?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_report_reviews_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "self_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      self_reports: {
        Row: {
          blockers: Json
          cert_date: string
          cert_name: string
          cert_signature: string
          coverage: Json
          created_at: string
          cumulative_workflows: number
          disclosure: Json
          errors_corrected: string
          errors_found: boolean
          hours: Json
          id: string
          main_workstream: string
          net_quality: string
          overall_ai_pct: number
          quality: Json
          role_function: string
          staff_id: string
          staff_name: string
          submitted_at: string
          submitted_without_review: boolean
          tools: Json
          tools_total_active: number
          tools_total_daily: number
          total_hours_saved: number
          updated_at: string
          week_start_date: string
          without_review_explain: string
          workflow_doc_submitted: boolean
          workflows: Json
        }
        Insert: {
          blockers?: Json
          cert_date: string
          cert_name: string
          cert_signature: string
          coverage?: Json
          created_at?: string
          cumulative_workflows?: number
          disclosure?: Json
          errors_corrected?: string
          errors_found?: boolean
          hours?: Json
          id?: string
          main_workstream?: string
          net_quality: string
          overall_ai_pct?: number
          quality?: Json
          role_function?: string
          staff_id: string
          staff_name: string
          submitted_at?: string
          submitted_without_review?: boolean
          tools?: Json
          tools_total_active?: number
          tools_total_daily?: number
          total_hours_saved?: number
          updated_at?: string
          week_start_date: string
          without_review_explain?: string
          workflow_doc_submitted?: boolean
          workflows?: Json
        }
        Update: {
          blockers?: Json
          cert_date?: string
          cert_name?: string
          cert_signature?: string
          coverage?: Json
          created_at?: string
          cumulative_workflows?: number
          disclosure?: Json
          errors_corrected?: string
          errors_found?: boolean
          hours?: Json
          id?: string
          main_workstream?: string
          net_quality?: string
          overall_ai_pct?: number
          quality?: Json
          role_function?: string
          staff_id?: string
          staff_name?: string
          submitted_at?: string
          submitted_without_review?: boolean
          tools?: Json
          tools_total_active?: number
          tools_total_daily?: number
          total_hours_saved?: number
          updated_at?: string
          week_start_date?: string
          without_review_explain?: string
          workflow_doc_submitted?: boolean
          workflows?: Json
        }
        Relationships: []
      }
      submissions: {
        Row: {
          author_id: string
          content: string | null
          cover_image_url: string | null
          created_at: string | null
          edit_count: number
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string | null
          status: Database["public"]["Enums"]["submission_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          edit_count?: number
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          edit_count?: number
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      blog_posts_with_stats: {
        Row: {
          author: Json | null
          body: string | null
          comment_count: number | null
          created_at: string | null
          excerpt: string | null
          id: string | null
          like_count: number | null
          published_at: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      advance_edition: {
        Args: never
        Returns: {
          edition_date: string
          id: string
          is_current: boolean
          run_number: number
          started_at: string
        }
        SetofOptions: {
          from: "*"
          to: "editions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      hook_restrict_email_domain: { Args: { event: Json }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      is_reviewer: { Args: never; Returns: boolean }
      rate_limit_increment: {
        Args: { p_identifier: string; p_window_ms: number }
        Returns: number
      }
      report_comment_anon: {
        Args: { p_anon_id: string; p_comment_id: string }
        Returns: boolean
      }
      submit_reader_submission: {
        Args: {
          p_content: string
          p_cover_image_url?: string
          p_excerpt: string
          p_submitter_email: string
          p_submitter_name: string
          p_tags?: string[]
          p_title: string
        }
        Returns: string
      }
      toggle_comment_like: { Args: { p_comment_id: string }; Returns: boolean }
      toggle_comment_like_anon: {
        Args: { p_anon_id: string; p_comment_id: string }
        Returns: {
          like_count: number
          liked: boolean
        }[]
      }
      toggle_post_like_anon: {
        Args: { p_anon_id: string; p_post_id: string }
        Returns: {
          like_count: number
          liked: boolean
        }[]
      }
    }
    Enums: {
      notification_type:
        | "comment_reply"
        | "submission_comment"
        | "submission_like"
        | "mention"
      submission_status: "draft" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      notification_type: [
        "comment_reply",
        "submission_comment",
        "submission_like",
        "mention",
      ],
      submission_status: ["draft", "published"],
    },
  },
} as const


// Convenience aliases — kept by hand across `supabase gen types` regenerations.
export type Profile = Tables<'profiles'>
export type CommentRow = Tables<'comments'>
export type SubmissionRow = Tables<'submissions'>
export type NotificationRow = Tables<'notifications'>
export type EditionRow = Tables<'editions'>
export type SelfReportRow = Tables<'self_reports'>
export type SelfReportReviewRow = Tables<'self_report_reviews'>
