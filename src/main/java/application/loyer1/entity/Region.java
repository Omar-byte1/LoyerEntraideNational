package application.loyer1.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Coordination régionale.
 */
@Entity
@Table(name = "regions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(unique = true, length = 20)
    private String code;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
