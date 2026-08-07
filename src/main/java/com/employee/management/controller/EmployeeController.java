package com.employee.management.controller;

import com.employee.management.dto.EmployeeRequest;
import com.employee.management.dto.EmployeeResponse;
import com.employee.management.entity.enums.EmployeeStatus;
import com.employee.management.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.employee.management.entity.enums.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeResponse createEmployee(
            @Valid @RequestBody EmployeeRequest request) {

        return employeeService.createEmployee(request);
    }
    @GetMapping("/search")
public List<EmployeeResponse> searchEmployees(
        @RequestParam String name) {

    return employeeService.searchEmployeesByFirstName(name);
}
    @GetMapping("/status/{status}")
public List<EmployeeResponse> getEmployeesByStatus(
        @PathVariable EmployeeStatus status) {

    return employeeService.getEmployeesByStatus(status);
}
@GetMapping("/page")
public Page<EmployeeResponse> getEmployees(
        @PageableDefault(size = 5, sort = "id") Pageable pageable) {

    return employeeService.getEmployees(pageable);
}
    @GetMapping("/{id}")
    public EmployeeResponse getEmployeeById(
            @PathVariable Long id) {

        return employeeService.getEmployeeById(id);
    }

    @GetMapping
    public List<EmployeeResponse> getAllEmployees() {

        return employeeService.getAllEmployees();
    }

    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {

        return employeeService.updateEmployee(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);
    }
}