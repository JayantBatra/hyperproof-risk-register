package com.hyperproof.risk.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI riskManagementOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hyperproof Risk Register API")
                        .description("REST API for managing organizational risks, scoring inherent & residual risk, and tracking compliance mitigations.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Hyperproof Risk Management Team")
                                .url("https://hyperproof.io"))
                        .license(new License().name("Proprietary").url("https://hyperproof.io")));
    }
}
