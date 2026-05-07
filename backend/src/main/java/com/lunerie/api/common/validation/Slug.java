package com.lunerie.api.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Pattern(regexp = "^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$",
        message = "Slug must be lowercase letters/digits/dashes (2..200 chars)")
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.METHOD, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {})
public @interface Slug {
    String message() default "Slug must be lowercase letters/digits/dashes";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
