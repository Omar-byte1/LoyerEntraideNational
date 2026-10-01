package application.loyer1.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String refreshToken;
    private String email;
    private String fullName;
    private String role;
}
