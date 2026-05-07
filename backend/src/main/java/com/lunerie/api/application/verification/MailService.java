package com.lunerie.api.application.verification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${lunerie.mail.from:no-reply@lunerie.local}")
    private String from;

    @Value("${lunerie.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public void sendVerification(String to, String token) {
        String link = frontendBaseUrl + "/auth/verify?token=" + token;
        send(to, "Confirm your Lunerie email",
                """
                Welcome to Lunerie!

                Tap to confirm your email:
                %s

                The link is valid for 24 hours. If you didn't sign up, ignore this message.
                """.formatted(link));
    }

    public void sendPasswordReset(String to, String token) {
        String link = frontendBaseUrl + "/auth/reset?token=" + token;
        send(to, "Reset your Lunerie password",
                """
                Hi,

                Use the link below to set a new password:
                %s

                The link expires in 30 minutes. If you didn't request this, you can safely ignore the email.
                """.formatted(link));
    }

    private void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
            log.info("mail.sent to={} subject={}", to, subject);
        } catch (Exception ex) {
            log.warn("mail.failed to={} reason={}", to, ex.getMessage());
        }
    }
}
