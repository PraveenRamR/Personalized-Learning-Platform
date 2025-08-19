FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f package-lock.json ]; then npm ci; elif [ -f yarn.lock ]; then yarn; elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i; else npm i; fi

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


