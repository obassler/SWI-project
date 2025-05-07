package org.swi_project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors().and()
                .csrf().disable()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                new AntPathRequestMatcher("/api/auth/**"),
                                new AntPathRequestMatcher("/api/characters/**"),
                                new AntPathRequestMatcher("/api/npcs/**"),
                                new AntPathRequestMatcher("/api/story/**"),
                                new AntPathRequestMatcher("/api/quests/**"),
                                new AntPathRequestMatcher("/api/items/**"),
                                new AntPathRequestMatcher("/api/monsters/**"),
                                new AntPathRequestMatcher("/api/locations/**"),
                                new AntPathRequestMatcher("/api/spells/**")
                        ).permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}