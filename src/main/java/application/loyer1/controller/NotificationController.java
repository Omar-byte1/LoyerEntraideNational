package application.loyer1.controller;

import application.loyer1.dto.ApiResponse;
import application.loyer1.entity.Contract;
import application.loyer1.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * API Notifications.
 * Génère des alertes automatiques basées sur :
 * - Contrats expirant dans les 60 jours
 * - Contrats dont la majoration de loyer est due (tous les 3 ans)
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final ContractService contractService;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() {
        List<Map<String, Object>> notifications = new ArrayList<>();

        try {
            // 1. Contrats expirant dans les 60 jours
            List<Contract> expiring = contractService.findExpiring(60);
            for (Contract c : expiring) {
                Map<String, Object> notif = new LinkedHashMap<>();
                notif.put("id", "EXP-" + c.getId());
                notif.put("type", "EXPIRATION");
                notif.put("read", false);
                notif.put("contractId", c.getId());
                notif.put("contractNumber", c.getContractNumber());
                String endDateStr = c.getEndDate() != null ? c.getEndDate().format(FMT) : "—";
                notif.put("message",
                    "⏰ Contrat " + c.getContractNumber()
                    + " expire le " + endDateStr
                    + (c.getOwner() != null ? " — " + c.getOwner().getName() : ""));
                notif.put("date", c.getEndDate() != null ? c.getEndDate().toString() : null);
                notifications.add(notif);
            }

            // 2. Contrats en attente de majoration (prochaine date de majoration dépassée)
            List<Contract> expired = contractService.findExpired();
            for (Contract c : expired) {
                if (c.getNextIncreaseDate() != null
                        && !c.getNextIncreaseDate().isAfter(LocalDate.now())) {
                    Map<String, Object> notif = new LinkedHashMap<>();
                    notif.put("id", "MAJ-" + c.getId());
                    notif.put("type", "MAJORATION");
                    notif.put("read", false);
                    notif.put("contractId", c.getId());
                    notif.put("contractNumber", c.getContractNumber());
                    notif.put("message",
                        "📈 Majoration due pour contrat " + c.getContractNumber()
                        + " depuis le " + c.getNextIncreaseDate().format(FMT));
                    notif.put("date", c.getNextIncreaseDate().toString());
                    notifications.add(notif);
                }
            }

        } catch (Exception ignored) {
            // Retourne liste vide en cas d'erreur, jamais de 500
        }

        return ResponseEntity.ok(ApiResponse.ok(notifications));
    }
}
