package application.loyer1.controller;

import application.loyer1.dto.ApiResponse;
import application.loyer1.entity.Region;
import application.loyer1.service.RegionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API Régions.
 * GET/POST /api/regions
 * GET/PUT/DELETE /api/regions/{id}
 */
@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Region>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(regionService.findAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Region>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(regionService.findActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Region>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(regionService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Region>> create(@Valid @RequestBody Region region) {
        return ResponseEntity.ok(ApiResponse.ok(regionService.create(region), "Région créée"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Region>> update(@PathVariable Long id, @Valid @RequestBody Region region) {
        return ResponseEntity.ok(ApiResponse.ok(regionService.update(id, region), "Région modifiée"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        regionService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Région supprimée"));
    }
}
