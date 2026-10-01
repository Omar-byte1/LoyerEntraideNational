package application.loyer1.service;

import application.loyer1.dto.DashboardDTO;
import application.loyer1.entity.enums.ContractStatus;
import application.loyer1.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Service du tableau de bord.
 * Conforme aux sections 7-8 du cahier des charges.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ContractRepository contractRepository;

    public DashboardDTO getSummary() {
        LocalDate now = LocalDate.now();

        return DashboardDTO.builder()
                // Contrats
                .totalContracts(contractRepository.count())
                .activeContracts(contractRepository.countByStatus(ContractStatus.ACTIF))
                .expiredContracts(contractRepository.countByStatus(ContractStatus.EXPIRE))
                .expiringIn30Days(contractRepository.findExpiringBetween(now, now.plusDays(30)).size())
                .expiringIn60Days(contractRepository.findExpiringBetween(now, now.plusDays(60)).size())
                .expiringIn90Days(contractRepository.findExpiringBetween(now, now.plusDays(90)).size())

                // Finances
                .totalMonthlyRent(contractRepository.sumActiveMonthlyRents())
                .totalAnnualRent(contractRepository.sumActiveAnnualRents())
                .totalCharges(contractRepository.sumActiveCharges())

                // Graphiques
                .rentsByRegion(buildRentsByRegion())
                .contractsByRegion(buildContractsByRegion())
                .contractsByStatus(buildContractsByStatus())
                .build();
    }

    private Map<String, BigDecimal> buildRentsByRegion() {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        for (Object[] row : contractRepository.sumRentsByRegion()) {
            map.put((String) row[0], (BigDecimal) row[1]);
        }
        return map;
    }

    private Map<String, Long> buildContractsByRegion() {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : contractRepository.countByRegion()) {
            map.put((String) row[0], (Long) row[1]);
        }
        return map;
    }

    private Map<String, Long> buildContractsByStatus() {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : contractRepository.countByStatusGroup()) {
            map.put(row[0].toString(), (Long) row[1]);
        }
        return map;
    }
}
