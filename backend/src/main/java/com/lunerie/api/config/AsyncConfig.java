package com.lunerie.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    /** Async executor that propagates the current ServletRequest + MDC into worker threads. */
    @Bean(name = "applicationTaskExecutor")
    public Executor applicationTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(16);
        executor.setQueueCapacity(256);
        executor.setThreadNamePrefix("lunerie-async-");
        executor.setTaskDecorator(contextPropagating());
        executor.initialize();
        return executor;
    }

    private TaskDecorator contextPropagating() {
        return runnable -> {
            RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
            var mdc = org.slf4j.MDC.getCopyOfContextMap();
            return () -> {
                try {
                    if (attributes != null) RequestContextHolder.setRequestAttributes(attributes);
                    if (mdc != null) org.slf4j.MDC.setContextMap(mdc);
                    runnable.run();
                } finally {
                    RequestContextHolder.resetRequestAttributes();
                    org.slf4j.MDC.clear();
                }
            };
        };
    }
}
