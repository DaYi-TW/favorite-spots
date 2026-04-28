package com.favoritespot.graph.controller;

import com.favoritespot.config.ResourceNotFoundException;
import com.favoritespot.graph.dto.GraphData;
import com.favoritespot.graph.service.GraphQueryService;
import com.favoritespot.spot.Spot;
import com.favoritespot.spot.SpotDto;
import com.favoritespot.spot.SpotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/graph")
@RequiredArgsConstructor
public class GraphController {

    private final GraphQueryService graphQueryService;
    private final SpotRepository spotRepository;

    @GetMapping("/spot/{id}")
    public ResponseEntity<GraphData> getSpotGraph(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        String userId = principal.getUsername();
        Spot spot = spotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        if (!spot.getUser().getId().toString().equals(userId)) {
            throw new ResourceNotFoundException("Spot not found");
        }
        return ResponseEntity.ok(graphQueryService.getSpotGraph(id.toString(), userId));
    }

    @GetMapping("/user")
    public ResponseEntity<GraphData> getUserGraph(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(graphQueryService.getFullUserGraph(principal.getUsername()));
    }

    @GetMapping("/related/{id}")
    public ResponseEntity<List<SpotDto>> getRelatedSpots(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        String userId = principal.getUsername();
        Spot spot = spotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        if (!spot.getUser().getId().toString().equals(userId)) {
            throw new ResourceNotFoundException("Spot not found");
        }

        List<String> relatedIds = graphQueryService.getRelatedSpotIds(id.toString());
        List<SpotDto> related = relatedIds.stream()
                .map(sid -> spotRepository.findById(UUID.fromString(sid)))
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .map(SpotDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(related);
    }
}
