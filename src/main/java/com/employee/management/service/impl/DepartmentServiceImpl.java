package com.employee.management.service.impl;

import com.employee.management.dto.DepartmentRequest;
import com.employee.management.dto.DepartmentResponse;
import com.employee.management.entity.Department;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
public DepartmentResponse createDepartment(DepartmentRequest request) {

    if (departmentRepository.existsByDepartmentCode(request.getDepartmentCode())) {
        throw new DuplicateResourceException("Department code already exists.");
    }

    if (departmentRepository.existsByDepartmentName(request.getDepartmentName())) {
        throw new DuplicateResourceException("Department name already exists.");
    }

    Department department = Department.builder()
            .departmentCode(request.getDepartmentCode())
            .departmentName(request.getDepartmentName())
            .description(request.getDescription())
            .build();

    Department savedDepartment = departmentRepository.save(department);

    return DepartmentResponse.builder()
            .id(savedDepartment.getId())
            .departmentCode(savedDepartment.getDepartmentCode())
            .departmentName(savedDepartment.getDepartmentName())
            .description(savedDepartment.getDescription())
            .build();
}

    @Override
@Transactional(readOnly = true)
public DepartmentResponse getDepartmentById(Long id) {

    Department department = departmentRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Department not found with id : " + id));

    return DepartmentResponse.builder()
            .id(department.getId())
            .departmentCode(department.getDepartmentCode())
            .departmentName(department.getDepartmentName())
            .description(department.getDescription())
            .build();
}

    @Override
@Transactional(readOnly = true)
public List<DepartmentResponse> getAllDepartments() {

    return departmentRepository.findAll()
            .stream()
            .map(department -> DepartmentResponse.builder()
                    .id(department.getId())
                    .departmentCode(department.getDepartmentCode())
                    .departmentName(department.getDepartmentName())
                    .description(department.getDescription())
                    .build())
            .toList();
}

    @Override
public DepartmentResponse updateDepartment(Long id,
                                           DepartmentRequest request) {

    Department department = departmentRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Department not found with id : " + id));

    if (!department.getDepartmentCode().equals(request.getDepartmentCode())
            && departmentRepository.existsByDepartmentCode(request.getDepartmentCode())) {
        throw new DuplicateResourceException("Department code already exists.");
    }

    if (!department.getDepartmentName().equals(request.getDepartmentName())
            && departmentRepository.existsByDepartmentName(request.getDepartmentName())) {
        throw new DuplicateResourceException("Department name already exists.");
    }

    department.setDepartmentCode(request.getDepartmentCode());
    department.setDepartmentName(request.getDepartmentName());
    department.setDescription(request.getDescription());

    Department updatedDepartment = departmentRepository.save(department);

    return DepartmentResponse.builder()
            .id(updatedDepartment.getId())
            .departmentCode(updatedDepartment.getDepartmentCode())
            .departmentName(updatedDepartment.getDepartmentName())
            .description(updatedDepartment.getDescription())
            .build();
}

    @Override
public void deleteDepartment(Long id) {

    Department department = departmentRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Department not found with id : " + id));

    departmentRepository.delete(department);
}

}