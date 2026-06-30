package com.gmb.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
@EnableScheduling
public class GmbAiManagerApplication {
    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(GmbAiManagerApplication.class, args);
    }

    private static void loadDotEnv() {
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("../.env");
        }

        if (envFile.exists()) {
            System.out.println("[GMB Manager] Loading configuration from: " + envFile.getAbsolutePath());
            try {
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int equalsIdx = line.indexOf('=');
                    if (equalsIdx > 0) {
                        String key = line.substring(0, equalsIdx).trim();
                        String value = line.substring(equalsIdx + 1).trim();
                        if ((value.startsWith("\"") && value.endsWith("\"")) ||
                            (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }
                        // Set system property so Spring Boot placeholder resolution picks it up
                        System.setProperty(key, value);
                    }
                }
            } catch (Exception e) {
                System.err.println("[GMB Manager] Failed to parse .env file: " + e.getMessage());
            }
        } else {
            System.out.println("[GMB Manager] No .env file found. Using default/system environment configurations.");
        }
    }
}
