FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json tsconfig.base.json ./
COPY packages packages/
COPY services services/
RUN npm ci --legacy-peer-deps
RUN npx turbo run build --filter=@psychassess/service...
RUN cd services/psychassess-service && npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/services/psychassess-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/psychassess-service/package.json ./
COPY --from=builder /app/services/psychassess-service/prisma ./prisma
EXPOSE 3029
CMD ["node", "dist/main"]
