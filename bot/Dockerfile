# base image: official Alpine-based node LTS container
# (use previous LTS 10, because ref-struct dependency doesn't work with 12+ yet)
FROM node:10-alpine as base

ENV NODE_ENV production

WORKDIR /app/bot
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
RUN JOBS="$(nproc)"echo npm install


# ----------

FROM base as runner

# add compiled dependencies from builder container
COPY --from=builder --chown=node /app/bot/node_modules/ ./node_modules/

# add application code (remember node_modules is in .dockerignore)
COPY --chown=node . ./

# switch to unprivileged user
USER node


# configure container runtime behaviour
CMD ["node", "src/index.js"]

VOLUME ["/app/storage/"]
