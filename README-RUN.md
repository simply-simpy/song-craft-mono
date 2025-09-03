# Run

## Start only the DB in Docker

cd /Users/scott/Sites/songcraft-mono
docker compose up -d db

## Start the API locally (Fastify on 4500)

cd /Users/scott/Sites/songcraft-mono
DATABASE_URL="postgresql://songcraft:songcraft_dev_password@localhost:5432/songcraft" npm run dev --workspace=songcraft-api

## Start the front-end locally (Vite on 3000)

cd /Users/scott/Sites/songcraft-mono
VITE_API_URL="http://localhost:4500" npm run dev --workspace=songcraft

## URLS

API URL: http://localhost:4500 (docs at /documentation; health at /health)
App URL: http://localhost:3000

## If you see module errors from @songcraft/shared, run once:

cd /Users/scott/Sites/songcraft-mono/shared
npm i && npm run build
