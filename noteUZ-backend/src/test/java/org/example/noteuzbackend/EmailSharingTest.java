package org.example.noteuzbackend;

import jakarta.mail.internet.MimeMessage;
import org.example.noteuzbackend.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailSharingTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void shouldSendShareInvitationEmail() {
        String to = "user@example.com";
        String sender = "admin@noteuz.com";
        String title = "Ważna notatka";
        String url = "http://localhost:3000/share/123";
        String permission = "WRITE";

        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendShareInvitation(to, sender, title, url, permission);

        verify(mailSender).send(mimeMessage);
    }
}
