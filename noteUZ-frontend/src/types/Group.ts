// src/types/Group.ts

export type GroupRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface GroupDTO {
    groupId: string;
    groupName: string;
    description: string;
    myRole: GroupRole;
    joinedAt: string;
}

export interface GroupMember {
    id: string;
    groupId: string;
    userId: string;
    role: GroupRole;
    joinedAt: string;
    // Nowe pola z backendu
    displayName: string;
    email: string;
}

export interface GroupDetails {
    group: {
        id: string;
        name: string;
        description: string;
        createdAt: string;
    };
    members: GroupMember[];
}