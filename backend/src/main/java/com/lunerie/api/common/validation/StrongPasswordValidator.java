package com.lunerie.api.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    private int min;
    private int max;

    @Override
    public void initialize(StrongPassword annotation) {
        this.min = annotation.minLength();
        this.max = annotation.maxLength();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null) return false;
        int len = value.length();
        if (len < min || len > max) return false;

        boolean hasLetter = false, hasDigit = false, hasSymbol = false;
        for (int i = 0; i < len; i++) {
            char c = value.charAt(i);
            if (Character.isLetter(c)) hasLetter = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (!Character.isWhitespace(c)) hasSymbol = true;
        }
        return hasLetter && hasDigit && hasSymbol;
    }
}
