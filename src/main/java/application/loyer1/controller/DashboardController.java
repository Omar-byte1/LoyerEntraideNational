package application.loyer1.controller;

import application.loyer1.dto.ApiResponse;
import application.loyer1.dto.DashboardDTO;
import application.loyer1.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API Dashboard.
 * GET /api/dashboard/summary
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardDTO>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getSummary()));
    }
}
