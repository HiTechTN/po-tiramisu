FROM node:20-alpine AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN npm install

COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

RUN npm run build -w packages/shared
WORKDIR /app/apps/web
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
