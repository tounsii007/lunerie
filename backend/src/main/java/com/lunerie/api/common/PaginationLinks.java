package com.lunerie.api.common;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Adds RFC 5988 Link headers + X-Total-Count + X-Page-Number/Size to a response.
 *
 * <pre>
 * Link: <https://api/places?page=0&size=24>; rel="first",
 *       <https://api/places?page=2&size=24>; rel="prev",
 *       <https://api/places?page=4&size=24>; rel="next",
 *       <https://api/places?page=10&size=24>; rel="last"
 * </pre>
 */
public final class PaginationLinks {

    private PaginationLinks() {}

    public static HttpHeaders forPage(Page<?> page, HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Total-Count", String.valueOf(page.getTotalElements()));
        headers.set("X-Page-Number", String.valueOf(page.getNumber()));
        headers.set("X-Page-Size", String.valueOf(page.getSize()));
        headers.set("X-Total-Pages", String.valueOf(page.getTotalPages()));

        StringBuilder link = new StringBuilder();
        appendLink(link, request, 0, page.getSize(), "first");
        if (page.hasPrevious()) {
            appendLink(link, request, page.getNumber() - 1, page.getSize(), "prev");
        }
        if (page.hasNext()) {
            appendLink(link, request, page.getNumber() + 1, page.getSize(), "next");
        }
        if (page.getTotalPages() > 0) {
            appendLink(link, request, page.getTotalPages() - 1, page.getSize(), "last");
        }
        if (link.length() > 0) {
            headers.set(HttpHeaders.LINK, link.toString());
        }
        return headers;
    }

    private static void appendLink(StringBuilder builder, HttpServletRequest request, int page, int size, String rel) {
        UriComponentsBuilder uri = UriComponentsBuilder.fromUriString(request.getRequestURI())
                .query(request.getQueryString())
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size);
        if (builder.length() > 0) builder.append(", ");
        builder.append('<').append(uri.build().toUriString()).append('>')
                .append("; rel=\"").append(rel).append("\"");
    }
}
