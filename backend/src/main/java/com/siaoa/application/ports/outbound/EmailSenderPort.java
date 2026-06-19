package com.siaoa.application.ports.outbound;

public interface EmailSenderPort {
    void sendEmail(String to, String subject, String text);
}
