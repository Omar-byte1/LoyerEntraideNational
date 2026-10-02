package application.loyer1.repository;

import application.loyer1.entity.Contract;
import application.loyer1.entity.enums.ContractStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    Optional<Contract> findByContractNumber(String contractNumber);
    boolean existsByContractNumber(String contractNumber);
    
    // --- Récents ---
    List<Contract> findTop5ByOrderByIdDesc();

    // --- Filtres par statut ---
    List<Contract> findByStatus(ContractStatus status);
    long countByStatus(ContractStatus status);

    // --- Filtres par région/délégation ---
    Page<Contract> findByRegionId(Long regionId, Pageable pageable);
    Page<Contract> findByDelegationId(Long delegationId, Pageable pageable);

    // --- Échéances ---
    @Query("SELECT c FROM Contract c WHERE c.endDate <= :date AND c.status = 'ACTIF'")
    List<Contract> findExpiringBefore(@Param("date") LocalDate date);

    @Query("SELECT c FROM Contract c WHERE c.endDate < :today AND c.status = 'ACTIF'")
    List<Contract> findExpired(@Param("today") LocalDate today);

    @Query("SELECT c FROM Contract c WHERE c.endDate BETWEEN :from AND :to AND c.status = 'ACTIF'")
    List<Contract> findExpiringBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // --- Dashboard ---
    @Query("SELECT COALESCE(SUM(c.currentMonthlyRent), 0) FROM Contract c WHERE c.status = 'ACTIF'")
    BigDecimal sumActiveMonthlyRents();

    @Query("SELECT COALESCE(SUM(c.annualRent), 0) FROM Contract c WHERE c.status = 'ACTIF'")
    BigDecimal sumActiveAnnualRents();

    @Query("SELECT COALESCE(SUM(c.charges), 0) FROM Contract c WHERE c.status = 'ACTIF'")
    BigDecimal sumActiveCharges();

    @Query("SELECT c.region.name, SUM(c.currentMonthlyRent) FROM Contract c " +
           "WHERE c.status = 'ACTIF' GROUP BY c.region.name ORDER BY SUM(c.currentMonthlyRent) DESC")
    List<Object[]> sumRentsByRegion();

    @Query("SELECT c.region.name, COUNT(c) FROM Contract c GROUP BY c.region.name")
    List<Object[]> countByRegion();

    @Query("SELECT c.status, COUNT(c) FROM Contract c GROUP BY c.status")
    List<Object[]> countByStatusGroup();

    // --- Recherche globale ---
    @Query("SELECT c FROM Contract c WHERE " +
           "LOWER(c.contractNumber) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.address) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.owner.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.assignment) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.landReference) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Contract> searchGlobal(@Param("q") String query, Pageable pageable);
}
