package application.loyer1.config;

import application.loyer1.entity.*;
import application.loyer1.entity.enums.OwnerType;
import application.loyer1.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialisation des données au démarrage :
 * - 4 rôles (Administrateur, Gestionnaire, Responsable, Consultation)
 * - 1 compte admin par défaut
 * - Données de démonstration : Régions, Délégations, Propriétaire
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final DelegationRepository delegationRepository;
    private final OwnerRepository ownerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initRoles();
        initAdmin();
        initSampleData();
    }

    private void initRoles() {
        createRoleIfNotExists("ADMINISTRATEUR", "Accès complet au système");
        createRoleIfNotExists("GESTIONNAIRE", "Gestion des contrats, avenants, majorations");
        createRoleIfNotExists("RESPONSABLE", "Consultation et validation");
        createRoleIfNotExists("CONSULTATION", "Lecture seule");
    }

    private void createRoleIfNotExists(String name, String description) {
        if (!roleRepository.existsByName(name)) {
            roleRepository.save(Role.builder()
                    .name(name)
                    .description(description)
                    .build());
            log.info("Rôle créé : {}", name);
        }
    }

    private void initAdmin() {
        if (!userRepository.existsByEmail("admin@loyer.ma")) {
            Role adminRole = roleRepository.findByName("ADMINISTRATEUR")
                    .orElseThrow(() -> new RuntimeException("Rôle ADMINISTRATEUR non trouvé"));

            userRepository.save(User.builder()
                    .firstName("Admin")
                    .lastName("Système")
                    .email("admin@loyer.ma")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(adminRole)
                    .active(true)
                    .build());
            log.info("Compte admin créé : admin@loyer.ma / admin123");
        }
    }

    private void initSampleData() {
        if (regionRepository.count() == 0) {
            Region region = regionRepository.save(Region.builder()
                    .name("Tunis")
                    .code("TUN")
                    .build());

            Delegation delegation = delegationRepository.save(Delegation.builder()
                    .name("Tunis Centre")
                    .code("TC")
                    .region(region)
                    .build());

            ownerRepository.save(Owner.builder()
                    .name("Société Immobilière Loyer SARL")
                    .type(OwnerType.PERSONNE_MORALE)
                    .phone("+216 71 000 000")
                    .email("contact@immobiliere.tn")
                    .address("Avenue Habib Bourguiba, Tunis")
                    .build());

            log.info("Données d'exemple créées (Région Tunis, Délégation Tunis Centre, Propriétaire SARL)");
        }
    }
}
