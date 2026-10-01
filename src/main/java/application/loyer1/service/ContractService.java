package application.loyer1.service;

import application.loyer1.entity.Contract;
import application.loyer1.entity.enums.ContractStatus;
import application.loyer1.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service de gestion des contrats.
 * Implémente les règles métier R01-R06.
 */
@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;

    public Page<Contract> findAll(Pageable pageable) {
        return contractRepository.findAll(pageable);
    }

    public Contract findById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé : " + id));
    }

    /**
     * Crée un nouveau contrat avec calculs automatiques (R01, R02).
     */
    @Transactional
    public Contract create(Contract contract) {
        if (contractRepository.existsByContractNumber(contract.getContractNumber())) {
            throw new RuntimeException("Le numéro de contrat existe déjà : " + contract.getContractNumber());
        }

        // R01 — Loyer annuel = mensuel × 12
        contract.calculateAnnualRent();

        // R02 — Date fin = date début + durée
        contract.calculateEndDate();

        // Statut initial
        contract.setStatus(ContractStatus.ACTIF);

        return contractRepository.save(contract);
    }

    @Transactional
    public Contract update(Long id, Contract updated) {
        Contract contract = findById(id);

        // Mise à jour des champs
        contract.setContractNumber(updated.getContractNumber());
        contract.setRegion(updated.getRegion());
        contract.setDelegation(updated.getDelegation());
        contract.setOwner(updated.getOwner());
        contract.setAddress(updated.getAddress());
        contract.setLandReference(updated.getLandReference());
        contract.setPropertyType(updated.getPropertyType());
        contract.setAssignment(updated.getAssignment());
        contract.setObjectLocal(updated.getObjectLocal());
        contract.setBuiltArea(updated.getBuiltArea());
        contract.setUsedArea(updated.getUsedArea());
        contract.setUnusedArea(updated.getUnusedArea());
        contract.setStartDate(updated.getStartDate());
        contract.setDurationMonths(updated.getDurationMonths());
        contract.setContractType(updated.getContractType());
        contract.setConditions(updated.getConditions());
        contract.setCurrentMonthlyRent(updated.getCurrentMonthlyRent());
        contract.setCharges(updated.getCharges());
        contract.setOtherCharges(updated.getOtherCharges());
        contract.setIncreaseApplicable(updated.getIncreaseApplicable());
        contract.setIncreasePercentage(updated.getIncreasePercentage());
        contract.setIncreasePeriodicityMonths(updated.getIncreasePeriodicityMonths());
        contract.setObservations(updated.getObservations());

        // Recalculs automatiques
        contract.calculateAnnualRent();
        contract.calculateEndDate();

        return contractRepository.save(contract);
    }

    public void delete(Long id) {
        contractRepository.deleteById(id);
    }

    // --- Recherche ---

    public Page<Contract> search(String query, Pageable pageable) {
        return contractRepository.searchGlobal(query, pageable);
    }

    public Page<Contract> findByRegion(Long regionId, Pageable pageable) {
        return contractRepository.findByRegionId(regionId, pageable);
    }

    public Page<Contract> findByDelegation(Long delegationId, Pageable pageable) {
        return contractRepository.findByDelegationId(delegationId, pageable);
    }

    // --- Échéances ---

    public List<Contract> findExpiring(int days) {
        LocalDate limit = LocalDate.now().plusDays(days);
        return contractRepository.findExpiringBefore(limit);
    }

    public List<Contract> findExpired() {
        return contractRepository.findExpired(LocalDate.now());
    }

    /**
     * R06 — Met à jour automatiquement les statuts des contrats expirés.
     */
    @Transactional
    public void updateExpiredStatuses() {
        List<Contract> expired = contractRepository.findExpired(LocalDate.now());
        for (Contract contract : expired) {
            contract.setStatus(ContractStatus.EXPIRE);
            contractRepository.save(contract);
        }
    }
}
