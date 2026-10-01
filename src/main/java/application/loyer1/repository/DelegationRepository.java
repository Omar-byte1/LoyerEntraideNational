package application.loyer1.repository;

import application.loyer1.entity.Delegation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DelegationRepository extends JpaRepository<Delegation, Long> {
    List<Delegation> findByRegionId(Long regionId);
    List<Delegation> findByActiveTrue();
    List<Delegation> findByRegionIdAndActiveTrue(Long regionId);
    boolean existsByNameAndRegionId(String name, Long regionId);
}
