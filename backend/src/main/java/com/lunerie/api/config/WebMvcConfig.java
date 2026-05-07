package com.lunerie.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${lunerie.pagination.default-page-size:24}")
    private int defaultPageSize;

    @Value("${lunerie.pagination.max-page-size:100}")
    private int maxPageSize;

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        PageableHandlerMethodArgumentResolver pageable = new PageableHandlerMethodArgumentResolver();
        pageable.setFallbackPageable(org.springframework.data.domain.PageRequest.of(0, defaultPageSize));
        pageable.setMaxPageSize(maxPageSize);
        pageable.setOneIndexedParameters(false);
        resolvers.add(pageable);
    }
}
