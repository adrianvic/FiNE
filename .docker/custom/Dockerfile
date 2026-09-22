FROM node:22-alpine AS builder
WORKDIR /build

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY packages/frontend/apps/web/package.json        ./packages/frontend/apps/web/
COPY packages/frontend/apps/electron/package.json   ./packages/frontend/apps/electron/
COPY packages/frontend/apps/electron-renderer/package.json ./packages/frontend/apps/electron-renderer/
COPY packages/frontend/apps/mobile/package.json     ./packages/frontend/apps/mobile/
COPY packages/frontend/apps/mobile-shared/package.json ./packages/frontend/apps/mobile-shared/
COPY packages/frontend/apps/ios/package.json        ./packages/frontend/apps/ios/
COPY packages/frontend/apps/android/package.json    ./packages/frontend/apps/android/
COPY packages/frontend/core/package.json            ./packages/frontend/core/
COPY packages/frontend/component/package.json       ./packages/frontend/component/
COPY packages/frontend/native/package.json          ./packages/frontend/native/
COPY packages/frontend/i18n/package.json            ./packages/frontend/i18n/
COPY packages/frontend/admin/package.json           ./packages/frontend/admin/
COPY packages/frontend/templates/package.json       ./packages/frontend/templates/
COPY packages/frontend/track/package.json           ./packages/frontend/track/
COPY packages/frontend/routes/package.json          ./packages/frontend/routes/
COPY packages/frontend/electron-api/package.json    ./packages/frontend/electron-api/
COPY packages/common/                               ./packages/common/
COPY blocksuite/                                    ./blocksuite/
COPY tools/                                         ./tools/
COPY tests/                                         ./tests/
COPY docs/                                          ./docs/

RUN corepack enable && HUSKY=0 yarn install --mode=skip-build

COPY . .

RUN yarn workspace @affine/templates build
ARG GITHUB_SHA=custom000
RUN GITHUB_SHA=${GITHUB_SHA} BUILD_TYPE=stable yarn affine bundle -p @affine/web

FROM ghcr.io/toeverything/affine:2026.9.20-canary.908

COPY --from=builder /build/packages/frontend/apps/web/dist/ /app/static/

CMD ["node", "./dist/main.js"]
