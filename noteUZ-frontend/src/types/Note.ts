export interface Note {
    id: string;
    title: string;
    content: string;

    // Obsługa różnych konwencji backendu (ważne dla kompatybilności)
    user_id?: string;
    userId?: string;

    groupId?: string;

    created_at?: string;
    createdAt?: string;

    updated_at?: string;
    updatedAt?: string;

    // --- NOWE POLA ---
    voteCount?: number;
    votedByMe?: boolean;
}