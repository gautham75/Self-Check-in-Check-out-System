package com.gautham.selfcheckinsystem.repository;

import com.gautham.selfcheckinsystem.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT AVG(SIZE(e.participants)) FROM Event e")
    Double getAverageParticipantsPerEvent();
}