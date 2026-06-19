package com.siaoa.infra.config;

import com.siaoa.infra.security.JwtProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtProvider jwtProvider;

    public WebSocketConfig(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        try {
                            String token = null;
                            if (request instanceof ServletServerHttpRequest servletRequest) {
                                HttpServletRequest servlet = servletRequest.getServletRequest();
                                String auth = servlet.getHeader("Authorization");
                                if (auth != null && auth.startsWith("Bearer ")) {
                                    token = auth.substring(7);
                                }
                                if (token == null) {
                                    token = servlet.getParameter("access_token");
                                }
                            }

                            if (token != null && jwtProvider.validateToken(token)) {
                                UUID userId = jwtProvider.extractUserId(token);
                                return new StompPrincipal(userId.toString());
                            }
                        } catch (Exception e) {
                            // ignore and fallback to default
                        }

                        return super.determineUser(request, wsHandler, attributes);
                    }
                })
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    static class StompPrincipal implements Principal {
        private final String name;

        public StompPrincipal(String name) { this.name = name; }

        @Override
        public String getName() { return name; }
    }
}
