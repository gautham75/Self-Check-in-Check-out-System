package com.gautham.selfcheckinsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;
import java.util.Scanner;

@SpringBootApplication
public class SelfCheckinSystemApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(SelfCheckinSystemApplication.class, args);
    }

    private static void loadDotEnv() {
        File envFile = new File(".env");
        if (envFile.exists()) {
            try (Scanner scanner = new Scanner(envFile)) {
                while (scanner.hasNextLine()) {
                    String line = scanner.nextLine().trim();
                    if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                        String[] parts = line.split("=", 2);
                        String key = parts[0].trim();
                        String value = parts[1].trim();
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Notice: Could not load .env file: " + e.getMessage());
            }
        }
    }
}

