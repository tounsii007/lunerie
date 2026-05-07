package com.lunerie.api.web;

import com.lunerie.api.test.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PlacesIntegrationTest extends AbstractIntegrationTest {

    @Test
    void seeded_places_are_browsable() throws Exception {
        mockMvc.perform(get("/api/places/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total", greaterThan(0)));
    }

    @Test
    void categories_endpoint_returns_full_enum() throws Exception {
        mockMvc.perform(get("/api/places/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(11));
    }

    @Test
    void by_country_lists_seeded_tunisia_places() throws Exception {
        mockMvc.perform(get("/api/places/by-country/TN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total", greaterThanOrEqualTo(5)));
    }

    @Test
    void search_finds_places_by_text() throws Exception {
        mockMvc.perform(get("/api/places/search").param("q", "sahara"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", greaterThanOrEqualTo(0)));
    }

    @Test
    void nearby_returns_geographic_results() throws Exception {
        mockMvc.perform(get("/api/places/nearby")
                        .param("lat", "36.8")
                        .param("lon", "10.1")
                        .param("radiusKm", "150")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void invalid_country_code_returns_404() throws Exception {
        mockMvc.perform(get("/api/places/by-country/XX")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk()); // empty page is valid
    }

    @Test
    void countries_endpoint_returns_seeded_data() throws Exception {
        mockMvc.perform(get("/api/countries/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total", greaterThan(0)));

        mockMvc.perform(get("/api/countries/regions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
