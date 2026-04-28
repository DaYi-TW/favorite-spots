package com.favoritespot.geo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeocodingService {

    private final ObjectMapper objectMapper;
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

    public double[] geocode(String address, String city) {
        String query = buildQuery(address, city);
        if (query == null) return null;

        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = NOMINATIM_URL + "?q=" + encoded + "&format=json&limit=1";

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "FavoriteSpots/1.0 (contact@favoritespot.com)")
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());

            if (root.isArray() && root.size() > 0) {
                JsonNode first = root.get(0);
                double lat = first.get("lat").asDouble();
                double lon = first.get("lon").asDouble();
                log.info("Geocoded '{}' -> lat={}, lon={}", query, lat, lon);
                return new double[]{lat, lon};
            }
        } catch (Exception e) {
            log.warn("Geocoding failed for '{}': {}", query, e.getMessage());
        }
        return null;
    }

    private String buildQuery(String address, String city) {
        if (address != null && !address.isBlank()) return address;
        if (city != null && !city.isBlank()) return city;
        return null;
    }
}
