package application.loyer1.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Historique des majorations de loyer.
 * Chaque majoration est conservée — on ne remplace jamais l'ancien montant.
 */
@Entity
@Table(name = "rent_increases")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RentIncrease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "previous_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal previousAmount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "increase_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal increaseAmount;

    @Column(name = "new_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal newAmount;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(length = 500)
    private String reason;

    @Column(name = "amendment_id")
    private Long amendmentId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private Long createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
