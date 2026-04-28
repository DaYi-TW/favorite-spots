package com.favoritespot.photo;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class StorageService {

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://localhost:8080/uploads}")
    private String baseUrl;

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    public StoredFile store(MultipartFile file, UUID spotId) throws IOException {
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File too large (max 10 MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
        }

        Path dir = Paths.get(uploadDir, "spots", spotId.toString());
        Files.createDirectories(dir);

        String ext = getExtension(file.getOriginalFilename(), contentType);
        String filename = UUID.randomUUID() + ext;
        Path dest = dir.resolve(filename);
        file.transferTo(dest);

        String url = baseUrl + "/spots/" + spotId + "/" + filename;
        log.info("Stored photo: {}", dest);
        return new StoredFile(filename, url, file.getSize());
    }

    public void delete(String filename, UUID spotId) {
        try {
            Path file = Paths.get(uploadDir, "spots", spotId.toString(), filename);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            log.warn("Failed to delete file {}: {}", filename, e.getMessage());
        }
    }

    private String getExtension(String originalName, String contentType) {
        if (originalName != null && originalName.contains(".")) {
            return originalName.substring(originalName.lastIndexOf("."));
        }
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png"  -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif"  -> ".gif";
            default           -> ".jpg";
        };
    }

    public record StoredFile(String filename, String url, long sizeBytes) {}
}
