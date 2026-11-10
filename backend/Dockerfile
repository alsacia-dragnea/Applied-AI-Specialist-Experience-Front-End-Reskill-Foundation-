# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine
# Non-root user with an arbitrary UID/GID 0 group so it also runs under OpenShift's restricted SCC
RUN addgroup -g 10001 app && adduser -u 10001 -G app -D -h /app app \
    && chgrp -R 0 /app && chmod -R g=u /app
WORKDIR /app
COPY --from=build --chown=10001:0 /workspace/target/chapter-and-co-backend-*.jar app.jar

USER 10001
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health/liveness || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
