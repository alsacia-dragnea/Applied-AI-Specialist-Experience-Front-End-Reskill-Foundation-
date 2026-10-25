package com.chapterandco.service;

import com.chapterandco.entity.Address;
import com.chapterandco.dto.AddressRequest;
import com.chapterandco.exception.ResourceNotFoundException;
import com.chapterandco.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public List<Address> getAddresses(String userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public Address createAddress(String userId, AddressRequest request) {
        Address address = Address.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .fullName(request.fullName())
                .line1(request.line1())
                .line2(request.line2())
                .city(request.city())
                .state(request.state())
                .postalCode(request.postalCode())
                .country(request.country())
                .isDefault(request.isDefault())
                .build();
        return addressRepository.save(address);
    }

    public Address getAddress(String id, String userId) {
        return addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
    }
}
