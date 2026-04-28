package com.favoritespot.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8) String password,
            @NotBlank @Size(min = 2, max = 50) String username) {}

    record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {}

    record UserResponse(String id, String email, String username) {}

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest req,
                                                 HttpServletResponse response) {
        User user = authService.register(req.email(), req.password(), req.username());
        setJwtCookie(response, jwtUtil.generate(user.getId()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UserResponse(user.getId().toString(), user.getEmail(), user.getUsername()));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest req,
                                              HttpServletResponse response) {
        User user = authService.findByEmail(req.email());
        if (!authService.checkPassword(user, req.password())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        setJwtCookie(response, jwtUtil.generate(user.getId()));
        return ResponseEntity.ok(new UserResponse(user.getId().toString(), user.getEmail(), user.getUsername()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails principal) {
        UUID userId = UUID.fromString(principal.getUsername());
        return userRepository.findById(userId)
                .map(u -> ResponseEntity.ok(new UserResponse(u.getId().toString(), u.getEmail(), u.getUsername())))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 24h
        // cookie.setSecure(true); // enable in production
        response.addCookie(cookie);
    }
}
