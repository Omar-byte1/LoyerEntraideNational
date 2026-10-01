package application.loyer1.service;

import application.loyer1.entity.AuditLog;
import application.loyer1.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service d'audit — traçabilité de toutes les modifications.
 * Conforme à la section 34 du cahier des charges.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Enregistre une action dans le journal d'audit.
     */
    public void log(Long userId, String entityType, Long entityId,
                    String action, Object oldValues, Object newValues, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .oldValues(oldValues != null ? objectMapper.writeValueAsString(oldValues) : null)
                    .newValues(newValues != null ? objectMapper.writeValueAsString(newValues) : null)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Erreur lors de l'enregistrement de l'audit : {}", e.getMessage());
        }
    }

    public void logCreate(Long userId, String entityType, Long entityId, Object newValues, String ip) {
        log(userId, entityType, entityId, "CREATE", null, newValues, ip);
    }

    public void logUpdate(Long userId, String entityType, Long entityId, Object oldValues, Object newValues, String ip) {
        log(userId, entityType, entityId, "UPDATE", oldValues, newValues, ip);
    }

    public void logDelete(Long userId, String entityType, Long entityId, Object oldValues, String ip) {
        log(userId, entityType, entityId, "DELETE", oldValues, null, ip);
    }
}
