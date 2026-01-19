// src/types/User.ts

export interface UserData {
    id: string;
    email: string;
    user_metadata?: {
        display_name?: string;
    };
    created_at: string;
    last_sign_in_at?: string;
    isAdmin?: boolean;
    role?: 'USER' | 'MODERATOR' | 'ADMIN';
    warnings?: number; // <--- Naprawia błąd TS2339
}

export interface Friendship {
    id: string;
    requesterId: string;
    requesterEmail: string;
    addresseeEmail: string;
    status: 'PENDING' | 'ACCEPTED';
    createdAt: string;
}