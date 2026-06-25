# Deploying to Render

## 1. Create a Render Account

Sign up at [render.com](https://render.com) and connect your GitHub account.

## 2. Connect the GitHub Repository

From the Render dashboard, click **New** and select **Blueprint**. Connect the `retail-inventory-tracker` repository. Render will detect the `render.yaml` and set up the services automatically.

## 3. Create a PostgreSQL Database

1. In the Render dashboard, click **New > PostgreSQL**.
2. Name it `rit-database` and select the **Free** tier.
3. Wait for the database to be created.
4. Copy the **Internal Database URL** from the database info page — you'll need it for the backend service.

## 4. Set Environment Variables

Go to the **rit-backend** web service in the Render dashboard and set:

- `DATABASE_URL` — paste the Internal Database URL from step 3
- `JWT_SECRET` — generate a random string (e.g., `openssl rand -base64 32` in your terminal)

Go to the **rit-frontend** static site and set:

- `VITE_API_URL` — the URL of the rit-backend service (e.g., `https://rit-backend.onrender.com`)

## 5. Initialize the Database

From your local machine, connect to the Render database using the **External Database URL** (found on the database info page) and run the schema and seed files:

```bash
# Run the schema
psql "YOUR_EXTERNAL_DATABASE_URL" -f backend/src/db/schema.sql

# Optionally seed with sample data
psql "YOUR_EXTERNAL_DATABASE_URL" -f backend/src/db/seed.sql
```

If you don't have `psql` installed locally, you can use the Render dashboard's **Shell** tab on the backend service:

```bash
psql $DATABASE_URL -f src/db/schema.sql
psql $DATABASE_URL -f src/db/seed.sql
```

## 6. Deploy

Once the environment variables are set and the database is initialized:

1. The **rit-backend** service will deploy automatically on each push to `main`.
2. The **rit-frontend** static site will build and deploy automatically on each push to `main`.
3. Verify the backend is running by visiting `https://rit-backend.onrender.com/api/health`.
4. Visit the frontend URL to confirm the app is working.

## Notes

- The free tier on Render spins down after 15 minutes of inactivity. The first request after inactivity will take ~30 seconds.
- To use a custom domain, configure it in the Render dashboard under your service's **Settings > Custom Domains**.
