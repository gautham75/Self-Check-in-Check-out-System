# Multi-stage Dockerfile for EventSync Spring Boot Backend

# Stage 1: Build the JAR with Maven
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper & POM
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn
COPY pom.xml ./

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source files and compile package
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime image with lightweight JRE 17
FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app

# Create directories and set permissions, then switch to non-root user
RUN mkdir -p /app/certificates /app/qrcodes && \
    addgroup -S eventsync && adduser -S eventsync -G eventsync && \
    chown -R eventsync:eventsync /app

USER eventsync

# Copy built JAR from builder stage
COPY --from=builder /app/target/self-checkin-system-0.0.1-SNAPSHOT.jar app.jar

# Expose HTTP port
EXPOSE 8080

# Production environment JVM performance flags
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
