package org.example.noteuzbackend.dto;

public class GroupRequests {
    public record CreateGroupRequest(String name, String description) {}
    public record InviteMemberRequest(String email) {}
    public record InvitationResponseRequest(Boolean accept) {}
    public record ChangeRoleRequest(String role) {}
    // Do notatek grupowych
    public record CreateGroupNoteRequest(String title, String content) {}
}