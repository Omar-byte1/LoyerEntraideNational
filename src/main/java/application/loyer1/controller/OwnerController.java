package application.loyer1.controller;

import application.loyer1.dto.ApiResponse;
import application.loyer1.entity.Owner;
import application.loyer1.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API Propriétaires.
 * GET/POST /api/owners
 * GET/PUT/DELETE /api/owners/{id}
 */
@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Owner>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(ownerService.findAll(pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Owner>>> search(
            @RequestParam String q, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(ownerService.search(q, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Owner>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(ownerService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Owner>> create(@Valid @RequestBody Owner owner) {
        return ResponseEntity.ok(ApiResponse.ok(ownerService.create(owner), "Propriétaire créé"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Owner>> update(@PathVariable Long id, @Valid @RequestBody Owner owner) {
        return ResponseEntity.ok(ApiResponse.ok(ownerService.update(id, owner), "Propriétaire modifié"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        ownerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Propriétaire supprimé"));
    }
}
