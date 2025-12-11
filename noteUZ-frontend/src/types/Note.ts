// src/types/Note.ts

export interface Note {
    id: string;
    title: string;
    content: string;
    created_at: string;
    user_id?: string;
    groupId?: string; // <--- NOWE
}