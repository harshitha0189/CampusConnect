package com.example.eventmanagement.backend.security;

import java.util.List;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Accept", "Origin"
        ));

        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()
            ))
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint((request, response, exception) ->
                            response.sendError(
                                    HttpServletResponse.SC_UNAUTHORIZED))
                    .accessDeniedHandler((request, response, exception) ->
                            response.sendError(
                                    HttpServletResponse.SC_FORBIDDEN))
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/api/health",
                        "/api/auth/**"
                ).permitAll()

                .requestMatchers(
                        HttpMethod.OPTIONS, "/**"
                ).permitAll()

                .requestMatchers("/api/chat")
                .hasAnyRole("STUDENT", "ORGANIZER", "ADMIN")

                .requestMatchers("/api/student/**")
                .hasRole("STUDENT")

                .requestMatchers(HttpMethod.POST, "/api/registrations/event/**")
                .hasRole("STUDENT")

                .requestMatchers(HttpMethod.GET, "/api/registrations/my")
                .hasRole("STUDENT")

                .requestMatchers(HttpMethod.GET, "/api/registrations/event/**")
                .hasAnyRole("ORGANIZER", "ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/attendance/mark/**")
                .hasRole("ORGANIZER")

                .requestMatchers(HttpMethod.GET, "/api/attendance/event/**")
                .hasAnyRole("ORGANIZER", "ADMIN")

                .requestMatchers("/api/qr/**")
                .authenticated()

                .requestMatchers(HttpMethod.GET, "/api/events/**")
                .hasAnyRole("ORGANIZER", "ADMIN")

                .requestMatchers("/api/events/**")
                .hasAnyRole("ORGANIZER", "ADMIN")

                .requestMatchers(
                        "/api/organizer/**"
                ).hasRole("ORGANIZER")

                .requestMatchers(
                        "/api/admin/**"
                ).hasRole("ADMIN")

                .anyRequest().authenticated()
            )

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}