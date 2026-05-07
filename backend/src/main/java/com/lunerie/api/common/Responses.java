package com.lunerie.api.common;

/**
 * Shared response records used across controllers. Records are immutable, JSON-friendly,
 * and replace ad-hoc {@code Map.of(...)} return shapes.
 */
public final class Responses {

    private Responses() {}

    /** Shape: {@code {"total": 42}}. */
    public record Count(long total) {
        public static Count of(long total) {
            return new Count(total);
        }
    }

    /** Shape: {@code {"value": true}}. Used for boolean checks like is-favorite. */
    public record BoolValue(boolean value) {
        public static BoolValue of(boolean value) {
            return new BoolValue(value);
        }
    }

    /** Shape: {@code {"affected": N}}. Used by bulk admin ops. */
    public record Affected(int affected) {
        public static Affected of(int affected) {
            return new Affected(affected);
        }
    }

    /** Shape: {@code {"ok": true}}. Trivial success acknowledgement. */
    public record Ok() {
        public static final Ok INSTANCE = new Ok();
        public boolean getOk() { return true; }
    }
}
