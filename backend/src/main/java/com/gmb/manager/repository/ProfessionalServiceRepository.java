package com.gmb.manager.repository;

import com.gmb.manager.entity.ProfessionalService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA repository for ProfessionalService entities.
 */
@Repository
public interface ProfessionalServiceRepository extends JpaRepository<ProfessionalService, Long> {
    // Additional custom queries can be added here.
}
