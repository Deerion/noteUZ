package org.example.noteuzbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendShareInvitation(String to, String senderEmail, String noteTitle, String shareUrl, String permission) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("NoteUZ <no-reply@noteuz.com>");
            helper.setTo(to);
            helper.setSubject(senderEmail + " udostępnił(a) Ci notatkę: " + noteTitle);

            String permissionText = permission.equals("WRITE") ? "Edycja" : "Podgląd";

            String htmlTemplate = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0; }
                            .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
                            .header { background-color: #4f46e5; padding: 24px; text-align: center; }
                            .logo { color: white; font-size: 24px; font-weight: bold; margin: 0; text-decoration: none; }
                            .content { padding: 32px 24px; color: #374151; text-align: center; }
                            .avatar { width: 56px; height: 56px; background-color: #e0e7ff; color: #4f46e5; border-radius: 50%; line-height: 56px; font-size: 20px; font-weight: bold; margin: 0 auto 16px auto; }
                            h2 { margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: 600; }
                            p { margin: 0 0 24px 0; line-height: 1.5; color: #6b7280; font-size: 14px; }
                            .note-preview { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: left; display: flex; align-items: center; }
                            .icon { font-size: 24px; margin-right: 12px; }
                            .details { flex: 1; }
                            .note-title { font-size: 15px; font-weight: 600; color: #1f2937; display: block; margin-bottom: 2px; }
                            .note-perm { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 0.5px; }
                            .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2); }
                            .btn:hover { background-color: #4338ca; }
                            .footer { background-color: #f9fafb; padding: 16px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <div class="header">
                                <span class="logo">NoteUZ</span>
                            </div>
                            <div class="content">
                                <div class="avatar">{{INITIAL}}</div>
                                <h2>{{SENDER}}</h2>
                                <p>zaprasza Cię do współpracy nad notatką.</p>
                                <div class="note-preview">
                                    <div class="icon">📝</div>
                                    <div class="details">
                                        <span class="note-title">{{TITLE}}</span>
                                        <span class="note-perm">POZIOM: {{PERM}}</span>
                                    </div>
                                </div>
                                <a href="{{URL}}" class="btn">Otwórz i odbierz</a>
                            </div>
                            <div class="footer">
                                Jeśli to pomyłka, możesz zignorować tę wiadomość.
                            </div>
                        </div>
                    </body>
                    </html>
                    """;

            String initial = senderEmail.substring(0, 1).toUpperCase();
            String finalHtml = htmlTemplate
                    .replace("{{INITIAL}}", initial)
                    .replace("{{SENDER}}", senderEmail)
                    .replace("{{TITLE}}", noteTitle)
                    .replace("{{PERM}}", permissionText)
                    .replace("{{URL}}", shareUrl);

            helper.setText(finalHtml, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Błąd wysyłania e-maila", e);
        }
    }
}