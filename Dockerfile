# Build stage
FROM golang:1.24-alpine3.22 AS builder

WORKDIR /app
COPY . .
RUN go build -o server main.go

# Final stage
FROM alpine:3.22


COPY --from=builder /app/server /server

EXPOSE 8090

CMD ["/server", "serve", "--http", "0.0.0.0:8090"]