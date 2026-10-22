# Static build of the gallery, served by Caddy on :8080.
# Base images follow the floating tag of a supported line (rebuilt with --pull), never a digest.

FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# public/r (the shadcn registry) is committed and copied as is: rebuilding it here would fetch shadcn at build time.
RUN bun run build

FROM caddy:2-alpine
# The Shuttle stack drops every capability and sets no-new-privileges. The image ships /usr/bin/caddy with the
# cap_net_bind_service file capability, which then makes execve fail with EPERM: strip it, and listen on 8080.
RUN apk add --no-cache libcap \
 && setcap -r /usr/bin/caddy \
 && apk del libcap
# Root filesystem is read-only in the stack; Caddy's data and config dirs go to the /tmp mount Shuttle provides.
ENV XDG_DATA_HOME=/tmp/caddy/data \
    XDG_CONFIG_HOME=/tmp/caddy/config
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
USER 65534:65534
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
