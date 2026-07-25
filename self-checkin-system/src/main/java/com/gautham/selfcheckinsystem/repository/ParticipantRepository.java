package com.gautham.selfcheckinsystem.repository;

import com.gautham.selfcheckinsystem.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    boolean existsByEmail(String email);

    boolean existsByRegistrationNumber(String registrationNumber);

    Optional<Participant> findByEmail(String email);

    Optional<Participant> findByRegistrationNumber(String registrationNumber);

    long countByCheckedInTrue();

    long countByCheckedOutTrue();

    long countByCheckedInTrueAndCheckedOutFalse();

    long countByCertificateUrlIsNotNull();

    long countByEventId(Long eventId);

    long countByEventIdAndCheckedInTrue(Long eventId);

    long countByEventIdAndCheckedOutTrue(Long eventId);

    long countByEventIdAndCertificateUrlIsNotNull(Long eventId);

    List<Participant> findByEventId(Long eventId);

    List<Participant> findByFullNameContainingIgnoreCase(String name);

    List<Participant> findByRegistrationNumberContainingIgnoreCase(String registrationNumber);

    List<Participant> findByEmailContainingIgnoreCase(String email);

    @Query("SELECT AVG(p.durationMinutes) FROM Participant p WHERE p.durationMinutes IS NOT NULL")
    Double getAverageAttendanceDuration();

    @Query("SELECT MAX(p.durationMinutes) FROM Participant p WHERE p.durationMinutes IS NOT NULL")
    Long getMaxAttendanceDuration();

    @Query("SELECT MIN(p.durationMinutes) FROM Participant p WHERE p.durationMinutes IS NOT NULL")
    Long getMinAttendanceDuration();

    @Query("SELECT AVG(p.durationMinutes) FROM Participant p WHERE p.event.id = :eventId AND p.durationMinutes IS NOT NULL")
    Double getAverageDurationByEventId(@Param("eventId") Long eventId);
}