package application.loyer1.entity;

import application.loyer1.entity.enums.ContractStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Contrat de location.
 * Entité centrale de l'application.
 */
@Entity
@Table(name = "contracts", indexes = {
    @Index(name = "idx_contract_number", columnList = "contract_number"),
    @Index(name = "idx_contract_region", columnList = "region_id"),
    @Index(name = "idx_contract_delegation", columnList = "delegation_id"),
    @Index(name = "idx_contract_owner", columnList = "owner_id"),
    @Index(name = "idx_contract_end_date", columnList = "end_date"),
    @Index(name = "idx_contract_status", columnList = "status")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Identification ---
    @NotBlank
    @Column(name = "contract_number", nullable = false, unique = true, length = 50)
    private String contractNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegation_id", nullable = true)
    private Delegation delegation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    // --- Local ---
    @Column(length = 500)
    private String address;

    @Column(name = "land_reference", length = 100)
    private String landReference;

    @Column(name = "property_type", length = 100)
    private String propertyType;

    @Column(length = 200)
    private String assignment;

    @Column(name = "object_local", length = 200)
    private String objectLocal;

    @Column(name = "built_area")
    private BigDecimal builtArea;

    @Column(name = "used_area")
    private BigDecimal usedArea;

    @Column(name = "unused_area")
    private BigDecimal unusedArea;

    // --- Contrat ---
    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "duration_months")
    private Integer durationMonths;

    @Column(name = "contract_type", length = 100)
    private String contractType;

    @Column(name = "conditions", columnDefinition = "TEXT")
    private String conditions;

    // --- Finances ---
    @NotNull
    @DecimalMin(value = "0.0")
    @Column(name = "initial_monthly_rent", nullable = false, precision = 12, scale = 2)
    private BigDecimal initialMonthlyRent;

    @NotNull
    @DecimalMin(value = "0.0")
    @Column(name = "current_monthly_rent", nullable = false, precision = 12, scale = 2)
    private BigDecimal currentMonthlyRent;

    @DecimalMin(value = "0.0")
    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal charges = BigDecimal.ZERO;

    @DecimalMin(value = "0.0")
    @Column(name = "other_charges", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal otherCharges = BigDecimal.ZERO;

    @Column(name = "annual_rent", precision = 14, scale = 2)
    private BigDecimal annualRent;

    // --- Majorations ---
    @Column(name = "increase_applicable")
    @Builder.Default
    private Boolean increaseApplicable = true;

    @Column(name = "increase_percentage", precision = 5, scale = 2)
    private BigDecimal increasePercentage;

    @Column(name = "increase_periodicity_months")
    private Integer increasePeriodicityMonths;

    @Column(name = "last_increase_date")
    private LocalDate lastIncreaseDate;

    @Column(name = "next_increase_date")
    private LocalDate nextIncreaseDate;

    // --- Statut ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ContractStatus status = ContractStatus.ACTIF;

    // --- Observations et Autres ---
    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(name = "evaluation_pv", length = 255)
    private String evaluationPv;

    @Column(name = "defined_increases", length = 255)
    private String definedIncreases;

    @Column(name = "activity_change", length = 255)
    private String activityChange;

    // --- Relations ---
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Amendment> amendments = new ArrayList<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RentIncrease> rentIncreases = new ArrayList<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    // --- Audit ---
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        calculateAnnualRent();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateAnnualRent();
    }

    /**
     * R01 — Calcul automatique du loyer annuel.
     * annuel = mensuel × 12
     */
    public void calculateAnnualRent() {
        if (currentMonthlyRent != null) {
            this.annualRent = currentMonthlyRent.multiply(BigDecimal.valueOf(12));
        }
    }

    /**
     * R02 — Calcul automatique de la date de fin.
     * date_fin = date_début + durée
     */
    public void calculateEndDate() {
        if (startDate != null && durationMonths != null) {
            this.endDate = startDate.plusMonths(durationMonths);
        }
    }
}
