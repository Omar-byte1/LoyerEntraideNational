package application.loyer1.controller;

import application.loyer1.dto.ApiResponse;
import application.loyer1.entity.Delegation;
import application.loyer1.service.DelegationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API Délégations.
 * GET/POST /api/delegations
 * GET/PUT/DELETE /api/delegations/{id}
 */
@RestController
@RequestMapping("/api/delegations")
@RequiredArgsConstructor
public class DelegationController {

    private final DelegationService delegationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Delegation>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(delegationService.findAll()));
    }

    @GetMapping("/region/{regionId}")
    public ResponseEntity<ApiResponse<List<Delegation>>> getByRegion(@PathVariable Long regionId) {
        return ResponseEntity.ok(ApiResponse.ok(delegationService.findByRegion(regionId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Delegation>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(delegationService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Delegation>> create(@Valid @RequestBody Delegation delegation) {
        return ResponseEntity.ok(ApiResponse.ok(delegationService.create(delegation), "Délégation créée"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Delegation>> update(@PathVariable Long id, @Valid @RequestBody Delegation delegation) {
        return ResponseEntity.ok(ApiResponse.ok(delegationService.update(id, delegation), "Délégation modifiée"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        delegationService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Délégation supprimée"));
    }
}
