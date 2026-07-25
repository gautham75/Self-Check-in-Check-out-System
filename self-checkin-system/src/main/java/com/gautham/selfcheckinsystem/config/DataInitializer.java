package com.gautham.selfcheckinsystem.config;

import com.gautham.selfcheckinsystem.entity.Role;
import com.gautham.selfcheckinsystem.entity.User;
import com.gautham.selfcheckinsystem.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setFullName("System Administrator");
            admin.setUsername("admin");
            admin.setEmail("admin@checkinpro.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println(">>> Seeded default ADMIN user: admin / admin123");
        }

        if (!userRepository.existsByUsername("staff")) {
            User staff = new User();
            staff.setFullName("Event Operations Staff");
            staff.setUsername("staff");
            staff.setEmail("staff@checkinpro.com");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setRole(Role.STAFF);
            staff.setEnabled(true);
            userRepository.save(staff);
            System.out.println(">>> Seeded default STAFF user: staff / staff123");
        }
    }
}
