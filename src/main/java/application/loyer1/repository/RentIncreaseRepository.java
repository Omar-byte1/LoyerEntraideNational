package application.loyer1.repository;

import application.loyer1.entity.RentIncrease;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentIncreaseRepository extends JpaRepository<RentIncrease, Long> {
    List<RentIncrease> findByContractIdOrderByEffectiveDateDesc(Long contractId);
}
