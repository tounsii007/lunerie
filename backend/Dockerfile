# =============================================================================
# Build stage – cached deps, then jar
# =============================================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /workspace

COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 mvn -B -q dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -DskipTests package


# =============================================================================
# Runtime stage – slim JRE, non-root user, healthcheck-ready
# =============================================================================
FROM eclipse-temurin:21-jre-alpine

ARG APP_USER=lunerie
ARG APP_UID=10001

RUN addgroup -S ${APP_USER} && adduser -S -u ${APP_UID} -G ${APP_USER} ${APP_USER} \
    && apk add --no-cache curl tzdata \
    && ln -sf /usr/share/zoneinfo/UTC /etc/localtime

WORKDIR /app
COPY --from=build /workspace/target/*.jar /app/app.jar
RUN chown -R ${APP_USER}:${APP_USER} /app

USER ${APP_USER}

ENV SPRING_PROFILES_ACTIVE=docker \
    JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom -Duser.timezone=UTC"

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
    CMD curl -fsS http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
