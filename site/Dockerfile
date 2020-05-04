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

WORKDIR /app/site
# change workdir owner
RUN chown node: .


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

# add compiled dependencies from builder container
COPY --from=builder --chown=node /app/site/node_modules/ ./node_modules/

# add application code (remember node_modules is in .dockerignore)
COPY --chown=node . ./

# switch to unprivileged user
USER node


# configure container runtime behaviour
CMD ["node", "src/index.js"]

VOLUME ["/app/storage/"]
EXPOSE 8080 8443
