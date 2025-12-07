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

    public void sendNote(String to, String title, String content, String senderEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("no-reply@noteuz.com");
            helper.setTo(to);
            helper.setSubject("NoteUZ: " + title);

            // 1. Zamiana nowych linii na <br>
            String htmlContent = content != null ? content.replace("\n", "<br/>") : "";

            // 2. Szablon HTML (Bez użycia %s i formatted() dla bezpieczeństwa)
            // Wstawiamy zmienne za pomocą replace()
            String htmlTemplate = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
                            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                            /* Tutaj bezpiecznie używamy % w CSS */
                            .header { background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); color: white; padding: 30px 20px; text-align: center; }
                            .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
                            .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
                            .info { font-size: 14px; color: #6b7280; margin-bottom: 20px; text-align: center; }
                            .note-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-top: 20px; }
                            .note-title { font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                            .note-body { font-size: 16px; color: #374151; white-space: pre-wrap; }
                            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>NoteUZ</h1>
                            </div>
                            <div class="content">
                                <p class="info">
                                    Użytkownik <strong>{{SENDER}}</strong> udostępnił Ci notatkę.
                                </p>
                                
                                <div class="note-card">
                                    <h2 class="note-title">{{TITLE}}</h2>
                                    <div class="note-body">{{CONTENT}}</div>
                                </div>
                                
                                <p style="text-align: center; margin-top: 30px;">
                                    <a href="http://localhost:3000" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Otwórz w NoteUZ</a>
                                </p>
                            </div>
                            <div class="footer">
                                &copy; 2025 NoteUZ. Wiadomość wygenerowana automatycznie.
                            </div>
                        </div>
                    </body>
                    </html>
                    """;

            // 3. Podmiana placeholderów na wartości
            String finalHtml = htmlTemplate
                    .replace("{{SENDER}}", senderEmail)
                    .replace("{{TITLE}}", title)
                    .replace("{{CONTENT}}", htmlContent);

            helper.setText(finalHtml, true);

            mailSender.send(message);
            System.out.println("✅ E-mail HTML wysłany (odbiorca: " + to + ")");

        } catch (MessagingException e) {
            e.printStackTrace();
            throw new RuntimeException("Błąd tworzenia wiadomości e-mail", e);
        }
    }
}