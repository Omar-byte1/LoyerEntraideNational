package application.loyer1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Délégation rattachée à une région.
 */
@Entity
@Table(name = "delegations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Delegation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 20)
    private String code;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
