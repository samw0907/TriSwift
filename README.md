# TriSwift

Live app: https://triswift-frontend.fly.dev
GitHub: https://github.com/samw0907/TriSwift

The easiest way to try the app is via the live deployment as linked above. A guest account is available on the login page, with some populated data:

- Email: `mvr@gmail.com`
- Password: `ironman`

TriSwift is a training tracker built for triathletes. You can log swim, bike, and run sessions individually or as a full triathlon with transition times. The app automatically tracks personal records by distance and discipline, visualises training totals over time, and includes a pace calculator for race planning.

## How to Run

**Prerequisites:** Node.js 20+, PostgreSQL

**Backend**

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```
DATABASE_URL=postgres://youruser:yourpassword@localhost:5432/triswift-db
JWT_SECRET=your_secret_here
```

Create the database, run migrations, then start the server:
```bash
createdb triswift-db
npm run migration:up
npm start
```

The backend runs on http://localhost:3001.

**Frontend**

```bash
cd frontend
npm install
npm start
```

The frontend runs on http://localhost:3000.

**With Docker Compose (backend + database only)**

```bash
docker-compose up --build -d
docker-compose exec backend npm run migration:up
```

Then start the frontend separately with `cd frontend && npm start`.

## Technologies

- **Frontend:** React, TypeScript, Apollo Client, React Router, Chart.js, Mapbox
- **Backend:** Node.js, Express, GraphQL (Apollo Server), Sequelize, PostgreSQL, JWT
- **Testing:** Vitest (unit/integration), Playwright (end-to-end)
- **Infrastructure:** Docker, GitHub Actions (CI/CD), Fly.io


This is a solo project built for my Open University final assessment (~175 hours), including the database schema, GraphQL API, React frontend, JWT authentication, automated tests, and the Docker/Fly.io deployment pipeline.

A detailed time log is available in [workingHoursDiary.md](./workingHoursDiary.md).

---

Sam Williamson — [GitHub](https://github.com/samw0907) — swilliamson_0907@outlook.com
