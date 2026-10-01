package application.loyer1.service;

import application.loyer1.dto.LoginRequest;
import application.loyer1.dto.LoginResponse;
import application.loyer1.entity.User;
import application.loyer1.repository.UserRepository;
import application.loyer1.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service d'authentification JWT.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authentifie un utilisateur et retourne un JWT.
     */
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Identifiants invalides"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().getName());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().getName())
                .build();
    }

    /**
     * Rafraîchit un token expiré.
     */
    public LoginResponse refresh(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new BadCredentialsException("Refresh token invalide");
        }

        String email = jwtUtil.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Utilisateur non trouvé"));

        String newToken = jwtUtil.generateToken(user.getEmail(), user.getRole().getName());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return LoginResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().getName())
                .build();
    }
}
