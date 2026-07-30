package com.employee.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the Employee Management System.
 *
 * {@code @SpringBootApplication} is a convenience annotation combining:
 *  - {@code @Configuration}        : marks this as a bean definition source
 *  - {@code @EnableAutoConfiguration}: enables Spring Boot's auto-configuration mechanism
 *  - {@code @ComponentScan}        : scans com.employee.management and sub-packages for beans
 *
 * This class MUST sit at the root package so that component scanning
 * reaches every layer (controller, service, repository, etc.).
 */
@SpringBootApplication
public class EmployeeManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeManagementSystemApplication.class, args);
    }

}
