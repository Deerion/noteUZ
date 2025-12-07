// src/types/Note.ts

export interface Note {
    id: string;
    title: string;
    content: string;
    created_at: string;
    // Opcjonalnie dodaj user_id, jeśli chcesz go używać we front-endzie
    user_id?: string;
}