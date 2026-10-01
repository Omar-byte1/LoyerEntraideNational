package application.loyer1.entity;

import application.loyer1.entity.enums.AmendmentStatus;
import application.loyer1.entity.enums.AmendmentType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Avenant à un contrat de location.
 */
@Entity
@Table(name = "amendments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Amendment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(nullable = false, length = 50)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AmendmentType type;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "old_rent", precision = 12, scale = 2)
    private BigDecimal oldRent;

    @Column(name = "new_rent", precision = 12, scale = 2)
    private BigDecimal newRent;

    @Column(name = "old_end_date")
    private LocalDate oldEndDate;

    @Column(name = "new_end_date")
    private LocalDate newEndDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AmendmentStatus status = AmendmentStatus.BROUILLON;

    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "validated_by")
    private Long validatedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
