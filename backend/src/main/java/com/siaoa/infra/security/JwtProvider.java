package com.siaoa.infra.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtProvider {
    private final SecretKey secretKey;
    private final long expirationTime;

    public JwtProvider(
            @Value("${jwt.secret:your-super-secret-key-change-this-in-production}") String secret,
            @Value("${jwt.expiration:86400}") long expirationSeconds
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationTime = expirationSeconds * 1000; // Convert to milliseconds
    }

    /**
     * Generate JWT token for a user
     *
     * @param userId User ID to include in token
     * @param email User email to include in token
     * @return JWT token string
     */
    public String generateToken(UUID userId, String email) {
        Instant now = Instant.now();
        Instant expiryDate = now.plusMillis(expirationTime);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiryDate))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Validate JWT token
     *
     * @param token JWT token string
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
                Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extract user ID from JWT token
     *
     * @param token JWT token string
     * @return User ID UUID
     * @throws JwtException if token is invalid
     */
    public UUID extractUserId(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return UUID.fromString(claims.getSubject());
    }

    /**
     * Extract email from JWT token
     *
     * @param token JWT token string
     * @return User email
     * @throws JwtException if token is invalid
     */
    public String extractEmail(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("email", String.class);
    }

    /**
     * Extract expiration time from JWT token
     *
     * @param token JWT token string
     * @return Expiration timestamp in milliseconds
     */
    public Long extractExpirationTime(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.getExpiration().getTime();
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(secretKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}
