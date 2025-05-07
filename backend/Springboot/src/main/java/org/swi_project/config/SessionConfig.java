package org.swi_project.config;

import org.springframework.boot.web.server.Cookie;
import org.springframework.boot.web.server.Cookie.SameSite;
import org.springframework.boot.web.servlet.server.Session;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SessionConfig {

    @Bean
    public Session.Cookie sessionCookie() {
        Session.Cookie cookie = new Session.Cookie();
        cookie.setSameSite(SameSite.valueOf(SameSite.NONE.attributeValue()));
        cookie.setSecure(true);
        return cookie;
    }
}
