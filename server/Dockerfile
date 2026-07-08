# Server runs TypeScript directly via tsx (no separate build step).
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Install production dependencies only (tsx + typescript are runtime deps here;
# test-only packages like mongodb-memory-server/vitest are devDependencies).
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3001
CMD ["npm", "start"]
