package com.lunerie.api.common;

import jakarta.servlet.http.HttpServletRequest;

/** Pure helpers for inspecting the inbound request. No state, no dependencies. */
public final class RequestContext {

    private static final int MAX_USER_AGENT_LEN = 512;
    private static final int MAX_IP_LEN = 64;

    private RequestContext() {}

    /**
     * Returns the client IP, honouring {@code X-Forwarded-For} only when the request
     * was forwarded through a trusted proxy (Tomcat already stripped it via
     * {@code server.tomcat.remoteip.internal-proxies} when the proxy is trusted).
     */
    public static String clientIp(HttpServletRequest request) {
        if (request == null) return null;
        return truncate(request.getRemoteAddr(), MAX_IP_LEN);
    }

    public static String userAgent(HttpServletRequest request) {
        if (request == null) return null;
        return truncate(request.getHeader("User-Agent"), MAX_USER_AGENT_LEN);
    }

    private static String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }
}
