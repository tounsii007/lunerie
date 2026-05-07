package com.lunerie.api.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Integer in {@code [0, 100]}. */
@Min(0)
@Max(100)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.METHOD, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {})
public @interface ScorePercent {
    String message() default "Must be between 0 and 100";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
