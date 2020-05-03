# base image: official Alpine-based node LTS container
# (use previous LTS 10, because ref-struct dependency doesn't work with 12+ yet)
FROM node:10-alpine as base

ENV NODE_ENV production

# Generate fallback self-signed cert for https
RUN apk add --no-cache --virtual=sslprepare openssl \
 && openssl req -x509 -newkey rsa:4096 -nodes \
            -subj   "/CN=localhost" \
            -out    "/etc/ssl/selfsigned-cert.pem" \
            -keyout "/etc/ssl/private/selfsigned-key.pem" \
 && chgrp node /etc/ssl/selfsigned-cert.pem /etc/ssl/private/selfsigned-key.pem \
 && chmod g+r /etc/ssl/selfsigned-cert.pem /etc/ssl/private/selfsigned-key.pem \
 && apk del --no-cache sslprepare

WORKDIR /app
# change workdir owner
RUN chown node: . \
# install common dependency libs and tools
 && apk add --no-cache pixman-dev cairo-dev pango-dev jpeg-dev


# ----------

FROM base as builder

# install buildtime-only dependency libs and tools
RUN apk add --no-cache python3 build-base pkgconf

# switch to unprivileged user
USER node

# install dependency node modules
COPY package.json package-lock.json ./
RUN JOBS="$(nproc)" npm install


# ----------

FROM base as runner

# install runtime-only dependency libs and tools
RUN apk add --no-cache tini

# add compiled dependencies from builder container
COPY --from=builder --chown=node /app/node_modules/ ./node_modules/

# add application code (remember node_modules is in .dockerignore)
COPY --chown=node . ./

# switch to unprivileged user
USER node


# configure container runtime behaviour
# (tini as init system recommended by node)
ENTRYPOINT ["tini", "--"]
CMD ["node", "index.js"]

VOLUME ["/app/storage/", "/app/config.json"]
EXPOSE 8080 8443
