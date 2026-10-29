# Online Recipe Sharing Platform

A React and Vite recipe-sharing application with an Express and MongoDB API.

## Project structure

- `src/` - React frontend
- `public/` - static frontend assets
- `backend/` - Express API and MongoDB integration

## Running the project

Install frontend dependencies and start the frontend:

```bash
npm install
npm run dev
```

In another terminal, install backend dependencies and start the API:

```bash
cd backend
npm install
node server.js
```

The backend expects MongoDB at `mongodb://127.0.0.1:27017` and runs on port `5000`.

## Validation

```bash
npm run lint
npm run build
```
