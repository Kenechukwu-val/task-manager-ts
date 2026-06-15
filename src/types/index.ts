export interface Profile {
    id: string
    name: string
    email: string
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export interface Task {
    id: string
    user_id: string
    title: string
    description: string | null
    status: 'pending' | 'in-progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
    created_at: string
    updated_at: string
}