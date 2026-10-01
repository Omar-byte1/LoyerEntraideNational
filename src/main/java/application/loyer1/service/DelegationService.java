package application.loyer1.service;

import application.loyer1.entity.Delegation;
import application.loyer1.repository.DelegationRepository;
import application.loyer1.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DelegationService {

    private final DelegationRepository delegationRepository;
    private final RegionRepository regionRepository;

    public List<Delegation> findAll() {
        return delegationRepository.findAll();
    }

    public List<Delegation> findByRegion(Long regionId) {
        return delegationRepository.findByRegionIdAndActiveTrue(regionId);
    }

    public Delegation findById(Long id) {
        return delegationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Délégation non trouvée : " + id));
    }

    public Delegation create(Delegation delegation) {
        if (!regionRepository.existsById(delegation.getRegion().getId())) {
            throw new RuntimeException("Région non trouvée");
        }
        if (delegationRepository.existsByNameAndRegionId(delegation.getName(), delegation.getRegion().getId())) {
            throw new RuntimeException("Une délégation avec ce nom existe déjà dans cette région");
        }
        return delegationRepository.save(delegation);
    }

    public Delegation update(Long id, Delegation updated) {
        Delegation delegation = findById(id);
        delegation.setName(updated.getName());
        delegation.setCode(updated.getCode());
        delegation.setActive(updated.getActive());
        if (updated.getRegion() != null) {
            delegation.setRegion(updated.getRegion());
        }
        return delegationRepository.save(delegation);
    }

    public void delete(Long id) {
        delegationRepository.deleteById(id);
    }
}
