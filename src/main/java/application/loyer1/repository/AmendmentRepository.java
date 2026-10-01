package application.loyer1.repository;

import application.loyer1.entity.Amendment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AmendmentRepository extends JpaRepository<Amendment, Long> {
    List<Amendment> findByContractIdOrderByDateDesc(Long contractId);
}
