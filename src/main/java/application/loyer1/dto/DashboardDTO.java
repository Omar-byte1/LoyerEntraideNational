package application.loyer1.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Données pour le dashboard principal.
 * Conforme aux sections 7-8 du cahier des charges.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DashboardDTO {

    // --- Contrats ---
    private long totalContracts;
    private long activeContracts;
    private long expiredContracts;
    private long expiringIn30Days;
    private long expiringIn60Days;
    private long expiringIn90Days;

    // --- Finances ---
    private BigDecimal totalMonthlyRent;
    private BigDecimal totalAnnualRent;
    private BigDecimal totalCharges;

    // --- Graphiques ---
    private Map<String, BigDecimal> rentsByRegion;
    private Map<String, Long> contractsByRegion;
    private Map<String, Long> contractsByStatus;
}
