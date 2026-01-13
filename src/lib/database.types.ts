// Supabase Database Types
// Generated from schema - update if schema changes

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          website: string | null
          profile_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          profile_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          profile_complete?: boolean
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          excerpt: string
          body: string
          author_id: string | null
          published_at: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          excerpt: string
          body: string
          author_id?: string | null
          published_at?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          excerpt?: string
          body?: string
          author_id?: string | null
          published_at?: string | null
          tags?: string[]
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
      }
      post_bookmarks: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          parent_id: string | null
          is_moderated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          parent_id?: string | null
          is_moderated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          is_moderated?: boolean
          updated_at?: string
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BlogPostRow = Database['public']['Tables']['blog_posts']['Row']
export type PostLike = Database['public']['Tables']['post_likes']['Row']
export type PostBookmark = Database['public']['Tables']['post_bookmarks']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
