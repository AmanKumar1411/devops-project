FROM --platform=$BUILDPLATFORM golang:1.22-alpine AS builder

WORKDIR /src

COPY go.mod ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download

COPY . .

ARG TARGETOS
ARG TARGETARCH
RUN --mount=type=cache,target=/root/.cache/go-build \
  CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
  go build -trimpath -ldflags="-s -w" -o /out/backend-service ./

FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app
COPY --from=builder /out/backend-service /app/backend-service

EXPOSE 3000
USER nonroot:nonroot
ENTRYPOINT ["/app/backend-service"]
