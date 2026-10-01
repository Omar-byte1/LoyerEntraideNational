package application.loyer1.repository;

import application.loyer1.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegionRepository extends JpaRepository<Region, Long> {
    List<Region> findByActiveTrue();
    boolean existsByName(String name);
}
