package com.employee.management.auth;

import com.employee.management.entity.User;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.repository.UserRepository;
import com.employee.management.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new DuplicateResourceException(
                    "Email already exists."
            );

        }

        User user = User.builder()

                .firstName(request.getFirstName())

                .lastName(request.getLastName())

                .email(request.getEmail())

                .password(
                        passwordEncoder.encode(request.getPassword())
                )

                .role(request.getRole())

                .build();

        userRepository.save(user);

        String jwt = jwtService.generateToken(user);

        return AuthenticationResponse.builder()

                .token(jwt)

                .build();

    }

    public AuthenticationResponse login(LoginRequest request) {

        try {

            authenticationManager.authenticate(

                    new UsernamePasswordAuthenticationToken(

                            request.getEmail(),

                            request.getPassword()

                    )

            );

        } catch (BadCredentialsException ex) {

            throw new BadCredentialsException(
                    "Invalid Email or Password"
            );

        }

        User user = userRepository.findByEmail(request.getEmail())

                .orElseThrow(() ->

                        new BadCredentialsException(
                                "Invalid Email or Password"
                        )

                );

        String jwt = jwtService.generateToken(user);

        return AuthenticationResponse.builder()

                .token(jwt)

                .build();

    }

}