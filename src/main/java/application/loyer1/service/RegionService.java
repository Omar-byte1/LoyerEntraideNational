package application.loyer1.service;

import application.loyer1.entity.Region;
import application.loyer1.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegionService {

    private final RegionRepository regionRepository;

    public List<Region> findAll() {
        return regionRepository.findAll();
    }

    public List<Region> findActive() {
        return regionRepository.findByActiveTrue();
    }

    public Region findById(Long id) {
        return regionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Région non trouvée : " + id));
    }

    public Region create(Region region) {
        if (regionRepository.existsByName(region.getName())) {
            throw new RuntimeException("Une région avec ce nom existe déjà");
        }
        return regionRepository.save(region);
    }

    public Region update(Long id, Region updated) {
        Region region = findById(id);
        region.setName(updated.getName());
        region.setCode(updated.getCode());
        region.setActive(updated.getActive());
        return regionRepository.save(region);
    }

    public void delete(Long id) {
        regionRepository.deleteById(id);
    }
}
