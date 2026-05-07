package com.lunerie.api.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

@Configuration
public class ShallowEtagConfig {

    /**
     * ETag for cacheable read-only endpoints. Browsers + CDN benefit from 304s.
     */
    @Bean
    public FilterRegistrationBean<ShallowEtagHeaderFilter> shallowEtagHeaderFilter() {
        FilterRegistrationBean<ShallowEtagHeaderFilter> bean = new FilterRegistrationBean<>(new ShallowEtagHeaderFilter());
        bean.addUrlPatterns(
                "/api/countries/*",
                "/api/places/categories",
                "/api/places/stats",
                "/api/tags/*"
        );
        bean.setName("shallowEtagFilter");
        return bean;
    }
}
