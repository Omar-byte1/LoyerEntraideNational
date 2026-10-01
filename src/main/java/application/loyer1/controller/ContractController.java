package application.loyer1.controller;

import application.loyer1.dto.ApiResponse;
import application.loyer1.entity.Contract;
import application.loyer1.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API Contrats.
 * GET/POST /api/contracts
 * GET/PUT/DELETE /api/contracts/{id}
 * GET /api/contracts/search
 * GET /api/contracts/expiring
 * GET /api/contracts/expired
 */
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Contract>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Contract>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Contract>> create(@Valid @RequestBody Contract contract) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.create(contract), "Contrat créé"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Contract>> update(@PathVariable Long id, @Valid @RequestBody Contract contract) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.update(id, contract), "Contrat modifié"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        contractService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Contrat supprimé"));
    }

    // --- Recherche ---
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Contract>>> search(
            @RequestParam String q, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.search(q, pageable)));
    }

    @GetMapping("/region/{regionId}")
    public ResponseEntity<ApiResponse<Page<Contract>>> byRegion(
            @PathVariable Long regionId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.findByRegion(regionId, pageable)));
    }

    @GetMapping("/delegation/{delegationId}")
    public ResponseEntity<ApiResponse<Page<Contract>>> byDelegation(
            @PathVariable Long delegationId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.findByDelegation(delegationId, pageable)));
    }

    // --- Échéances ---
    @GetMapping("/expiring")
    public ResponseEntity<ApiResponse<List<Contract>>> expiring(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.findExpiring(days)));
    }

    @GetMapping("/expired")
    public ResponseEntity<ApiResponse<List<Contract>>> expired() {
        return ResponseEntity.ok(ApiResponse.ok(contractService.findExpired()));
    }
}
