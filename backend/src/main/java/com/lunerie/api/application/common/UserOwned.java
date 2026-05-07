package com.lunerie.api.application.common;

import com.lunerie.api.domain.user.User;

/** Marker for entities scoped to a user — enables generic ownership-aware services. */
public interface UserOwned {
    User getUser();
}
