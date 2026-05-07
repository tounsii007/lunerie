package com.lunerie.api.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** ISO-3166-1 alpha-2 country code: two ASCII letters. */
@Pattern(regexp = "^[A-Za-z]{2}$", message = "Must be a 2-letter ISO country code")
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.METHOD, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {})
public @interface IsoCountryCode {
    String message() default "Must be a 2-letter ISO country code";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
