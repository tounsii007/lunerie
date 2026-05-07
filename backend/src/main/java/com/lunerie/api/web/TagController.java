package com.lunerie.api.web;

import com.lunerie.api.application.tag.TagService;
import com.lunerie.api.application.tag.TagService.TrendingTag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Tags")
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @Operation(summary = "All known tags (alphabetical)")
    @GetMapping
    public List<String> all() {
        return tagService.all();
    }

    @Operation(summary = "Top tags by occurrence")
    @GetMapping("/trending")
    public List<TrendingTag> trending(@RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return tagService.trending(limit);
    }
}
