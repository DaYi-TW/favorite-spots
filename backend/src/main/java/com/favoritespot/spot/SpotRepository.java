package com.favoritespot.spot;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SpotRepository extends JpaRepository<Spot, UUID> {

    @Query("SELECT s FROM Spot s WHERE s.user.id = :userId")
    List<Spot> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT s FROM Spot s WHERE s.isPublic = true AND s.user.id <> :userId ORDER BY s.createdAt DESC")
    List<Spot> findPublicByOtherUsers(@Param("userId") UUID userId, Pageable pageable);

    @Query(value = "SELECT * FROM spots s WHERE s.user_id = :userId " +
           "AND (CAST(:category AS TEXT) IS NULL OR s.category = CAST(:category AS TEXT)) " +
           "AND (CAST(:status AS TEXT) IS NULL OR s.status = CAST(:status AS TEXT)) " +
           "AND (:city IS NULL OR s.city = :city) " +
           "AND (:q IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "     OR LOWER(s.city) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "     OR LOWER(s.address) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "ORDER BY s.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM spots s WHERE s.user_id = :userId " +
           "AND (CAST(:category AS TEXT) IS NULL OR s.category = CAST(:category AS TEXT)) " +
           "AND (CAST(:status AS TEXT) IS NULL OR s.status = CAST(:status AS TEXT)) " +
           "AND (:city IS NULL OR s.city = :city) " +
           "AND (:q IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "     OR LOWER(s.city) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "     OR LOWER(s.address) LIKE LOWER(CONCAT('%', :q, '%')))",
           nativeQuery = true)
    Page<Spot> findFiltered(
            @Param("userId") UUID userId,
            @Param("category") String category,
            @Param("status") String status,
            @Param("city") String city,
            @Param("q") String q,
            Pageable pageable);
}
