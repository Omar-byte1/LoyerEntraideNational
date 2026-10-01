package application.loyer1.entity;

import application.loyer1.entity.enums.OwnerType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Propriétaire d'un ou plusieurs locaux.
 */
@Entity
@Table(name = "owners")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Owner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private OwnerType type = OwnerType.PERSONNE_PHYSIQUE;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "national_id", length = 50)
    private String nationalId;

    @Column(length = 30)
    private String phone;

    @Email
    @Column(length = 150)
    private String email;

    @Column(length = 500)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
