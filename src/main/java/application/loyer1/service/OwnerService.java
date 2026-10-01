package application.loyer1.service;

import application.loyer1.entity.Owner;
import application.loyer1.repository.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OwnerService {

    private final OwnerRepository ownerRepository;

    public Page<Owner> findAll(Pageable pageable) {
        return ownerRepository.findAll(pageable);
    }

    public Page<Owner> search(String query, Pageable pageable) {
        return ownerRepository.search(query, pageable);
    }

    public Owner findById(Long id) {
        return ownerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Propriétaire non trouvé : " + id));
    }

    public Owner create(Owner owner) {
        return ownerRepository.save(owner);
    }

    public Owner update(Long id, Owner updated) {
        Owner owner = findById(id);
        owner.setType(updated.getType());
        owner.setName(updated.getName());
        owner.setNationalId(updated.getNationalId());
        owner.setPhone(updated.getPhone());
        owner.setEmail(updated.getEmail());
        owner.setAddress(updated.getAddress());
        owner.setNotes(updated.getNotes());
        return ownerRepository.save(owner);
    }

    public void delete(Long id) {
        ownerRepository.deleteById(id);
    }
}
