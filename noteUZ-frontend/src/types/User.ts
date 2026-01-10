// src/types/User.ts

export interface UserData {
    id: string;
    email: string;
    user_metadata?: {
        display_name?: string;
    };
    created_at: string;
    last_sign_in_at?: string;
    isAdmin?: boolean; // <--- NOWE POLE
}

export interface Friendship {
    id: string;
    requesterId: string;
    requesterEmail: string;
    addresseeEmail: string;
    status: 'PENDING' | 'ACCEPTED';
    createdAt: string;
}