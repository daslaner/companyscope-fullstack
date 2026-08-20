FROM node:24.18.0-bookworm-slim

ARG APP_VERSION=1.0.0
ARG VCS_REF=unknown

LABEL org.opencontainers.image.title="CompanyScope" \
      org.opencontainers.image.description="CompanyScope fullstack portfolio application" \
      org.opencontainers.image.version="$APP_VERSION" \
      org.opencontainers.image.revision="$VCS_REF" \
      org.opencontainers.image.source="https://github.com/daslaner/companyscope-fullstack"

WORKDIR /app

ENV NODE_ENV=production \
    APP_VERSION=$APP_VERSION \
    APP_COMMIT=$VCS_REF \
    HOST=0.0.0.0 \
    API_PORT=4100 \
    SERVE_STATIC=true \
    STATIC_DIR=/app/dist

COPY --chown=node:node dist ./dist
COPY --chown=node:node server-dist/server.mjs ./server.mjs

USER node
EXPOSE 4100
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4100/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
