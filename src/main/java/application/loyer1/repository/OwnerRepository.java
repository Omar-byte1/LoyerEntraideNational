package application.loyer1.repository;

import application.loyer1.entity.Owner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OwnerRepository extends JpaRepository<Owner, Long> {

    @Query("SELECT o FROM Owner o WHERE " +
           "LOWER(o.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.nationalId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.phone) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Owner> search(@Param("search") String search, Pageable pageable);

    boolean existsByNationalId(String nationalId);
}
