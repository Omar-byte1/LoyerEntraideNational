package application.loyer1.repository;

import application.loyer1.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByContractId(Long contractId);
}
