package org.swi_project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS is configured in SecurityConfig via CorsConfigurationSource bean.
    // No additional CORS mapping needed here.
}
