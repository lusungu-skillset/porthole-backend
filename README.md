# Pothole Reporter Backend

A NestJS + TypeORM backend API for the Pothole Reporter school project. Reports pothole locations with status tracking (Pending → Verified → Fixed), stores data in MySQL, and serves endpoints for frontend consumption.

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (running)
- **Node.js** 18+ (for local dev, optional if using Docker)

### Local Development with Docker

```bash
cd porthole-backend

# Build and start all services (backend + MySQL)
docker compose up --build -d

# View logs
docker compose logs -f backend
```

The backend will be available at **http://localhost:3005**

Database runs on **localhost:3306** with credentials:
- User: `root`
- Password: `pothole`
- Database: `pothole_db`

### Stopping Services

```bash
docker compose down       # Stop containers
docker compose down -v    # Stop containers + remove volumes
```

---

## 📋 API Endpoints

### Base URL
```
http://localhost:3005
```

### 1. POST /potholes — Create a Pothole Report

**Create a new pothole report (public endpoint).**

**Request:**
```bash
curl -X POST http://localhost:3005/potholes \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -15.3875,
    "longitude": 28.3228,
    "description": "Large pothole by the intersection causing damage to vehicles",
    "reporterName": "Alice Smith",
    "severity": "HIGH"
  }'
```

**Request Body:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `latitude` | number | Yes | -90 to 90 |
| `longitude` | number | Yes | -180 to 180 |
| `description` | string | Yes | 5-2000 characters |
| `reporterName` | string | Yes | 1-120 characters |
| `severity` | string | Yes | `"LOW"`, `"MEDIUM"`, `"HIGH"` |

**Response (201 Created):**
```json
{
  "id": 1,
  "latitude": -15.3875,
  "longitude": 28.3228,
  "description": "Large pothole by the intersection causing damage to vehicles",
  "reporterName": "Alice Smith",
  "severity": "HIGH",
  "status": "Pending",
  "reportedAt": "2025-11-30T11:06:00.000Z"
}
```

**Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["description must be longer than or equal to 5 characters"],
  "error": "Bad Request"
}
```

---

### 2. GET /potholes — Fetch All Potholes

**Retrieve all pothole reports (latest first).**

**Request:**
```bash
curl -X GET http://localhost:3005/potholes \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "latitude": -15.3875,
    "longitude": 28.3228,
    "description": "Large pothole by the intersection",
    "reporterName": "Alice Smith",
    "severity": "HIGH",
    "status": "Pending",
    "reportedAt": "2025-11-30T11:06:00.000Z"
  },
  {
    "id": 2,
    "latitude": -15.4,
    "longitude": 28.35,
    "description": "Small crack near the junction",
    "reporterName": "Bob Jones",
    "severity": "LOW",
    "status": "In Progress",
    "reportedAt": "2025-11-30T11:05:30.000Z"
  }
]
```

**Empty Result:**
```json
[]
```

---

### 3. PUT /potholes/:id — Update Pothole Status (Admin Only)

**Update the status or severity of a pothole (admin action - requires token).**

**Request:**
```bash
curl -X PUT http://localhost:3005/potholes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "status": "In Progress"
  }'
```

**Request Body (all optional):**
| Field | Type | Options |
|-------|------|---------|
| `status` | string | `"Pending"`, `"In Progress"`, `"Fixed"` |
| `severity` | string | `"LOW"`, `"MEDIUM"`, `"HIGH"` |
| `description` | string | Any string (for updates) |

**Response (200 OK):**
```json
{
  "id": 1,
  "latitude": -15.3875,
  "longitude": 28.3228,
  "description": "Large pothole by the intersection",
  "reporterName": "Alice Smith",
  "severity": "HIGH",
  "status": "In Progress",
  "reportedAt": "2025-11-30T11:06:00.000Z"
}
```

**Error (401 Unauthorized - No token):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Pothole not found",
  "error": "Not Found"
}
```

---

## 🔐 Admin Authentication

### 1. POST /auth/login — Admin Login

**Login with admin credentials to get auth token.**

**Request:**
```bash
curl -X POST http://localhost:3005/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin1@potholereporter.com",
    "password": "AdminPassword123!"
  }'
```

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |

**Response (201 Created):**
```json
{
  "token": "YWRtaW4xQHBvdGhvbGVyZXBvcnRlci5jb206QWRtaW5QYXNzd29yZDEyMyE=",
  "admin": {
    "id": 1,
    "email": "admin1@potholereporter.com"
  }
}
```

**Error (401 Unauthorized - Invalid credentials):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

### 2. GET /auth/verify — Verify Admin Token

**Verify if a token is valid.**

**Request:**
```bash
curl -X GET http://localhost:3005/auth/verify \
  -H "Authorization: Bearer YWRtaW4xQHBvdGhvbGVyZXBvcnRlci5jb206QWRtaW5QYXNzd29yZDEyMyE="
```

**Response (200 OK - Valid Token):**
```json
{
  "valid": true,
  "admin": {
    "id": 1,
    "email": "admin1@potholereporter.com"
  }
}
```

**Error (401 Unauthorized - Invalid token):**
```json
{
  "statusCode": 401,
  "message": "Invalid token"
}
```

### Seeding Admin Accounts

Admin accounts must be seeded before using the login endpoint:

```bash
docker compose exec backend npm run seed
```

This creates two default admin accounts:
- Email: `admin1@potholereporter.com` | Password: `AdminPassword123!`
- Email: `admin2@potholereporter.com` | Password: `AdminPassword456!`

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── main.ts                          # NestJS bootstrap entry point
│   ├── app.module.ts                    # Root module with TypeORM config
│   ├── potholes/
│   │   ├── potholes.controller.ts       # API endpoints (routes)
│   │   ├── potholes.service.ts          # Business logic
│   │   ├── potholes.module.ts           # Feature module
│   │   ├── pothole.entity.ts            # TypeORM entity (DB model)
│   │   └── dto/
│   │       ├── create-pothole.dto.ts    # POST validation
│   │       └── update-pothole.dto.ts    # PUT validation
│   └── ...
├── Dockerfile                           # Container image definition
├── docker-compose.yml                   # Multi-container orchestration
├── package.json                         # Dependencies & scripts
├── tsconfig.json                        # TypeScript configuration
└── .env                                 # Environment variables

docker-compose.yml                       # Root compose file (backend + MySQL)
.gitignore                               # Git ignore rules
```

---

## 🗄️ Database Schema

### `potholes` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `latitude` | DOUBLE | NOT NULL | Y-coordinate (-90 to 90) |
| `longitude` | DOUBLE | NOT NULL | X-coordinate (-180 to 180) |
| `description` | TEXT | NOT NULL | Details about the pothole |
| `severity` | VARCHAR(10) | NOT NULL, DEFAULT 'LOW' | `LOW`, `MEDIUM`, or `HIGH` |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'Pending' | `Pending`, `In Progress`, or `Fixed` |
| `reporterName` | VARCHAR(120) | NOT NULL | Name of the person reporting |
| `reportedAt` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When report was created |

### `admin` Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Admin email address |
| `password` | VARCHAR(255) | NOT NULL | Admin password (stored as plain text in dev) |

---

## 🔧 Configuration

## 🛰️ PostGIS Spatial Features (Important)

- This backend expects a PostgreSQL database with the PostGIS extension enabled when using spatial features.
- The service uses the following PostGIS functions:
  - `ST_Distance` — to compute the distance between two geometries (we cast to `geography` for meter units).
  - `ST_ClosestPoint` — to compute the closest point on another geometry (e.g., closest point on a road polyline to a pothole point).
  - `ST_Intersects` — to test whether a pothole `geom` intersects (lies within/overlaps) a supplied geometry (useful for polygon queries).
  - `ST_AsGeoJSON` — to convert stored `geom` into GeoJSON for easy consumption by the frontend.

- For performance the backend attempts to create a GIST spatial index on the `potholes.geom` column (`idx_potholes_geom`) when the service starts.

- Usage notes:
  - When creating a pothole the frontend can either send `latitude`/`longitude` or a GeoJSON `geometry` object. If you send `contextGeometry` (GeoJSON), the backend will compute the closest point and distance and include them in the response.
  - To use spatial endpoints you must run PostgreSQL with PostGIS; the current Docker Compose may need to be switched from MySQL to a Postgres+PostGIS image (e.g. `postgis/postgis`).

Example SQL snippets used by the backend:

```sql
-- set geometry from GeoJSON
UPDATE potholes SET geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2;

-- compute closest point and distance (meters)
SELECT
  ST_AsGeoJSON(ST_ClosestPoint(p.geom, ST_SetSRID(ST_GeomFromGeoJSON($1),4326))) AS closest_point,
  ST_Distance(p.geom::geography, ST_SetSRID(ST_GeomFromGeoJSON($1),4326)::geography) AS distance_m
FROM potholes p WHERE p.id = $2;

-- find potholes within a polygon
SELECT p.*, ST_AsGeoJSON(p.geom) AS geom_geojson
FROM potholes p
WHERE ST_Intersects(p.geom, ST_SetSRID(ST_GeomFromGeoJSON($1),4326));
```

### Environment Variables (`.env`)

```dotenv
DB_HOST=db                  # MySQL container hostname
DB_PORT=3306                # MySQL port
DB_USER=root                # MySQL user
DB_PASS=pothole             # MySQL password
DB_NAME=pothole_db          # Database name
PORT=3005                   # Backend port
```

### Docker Compose Services

- **backend**: NestJS API on port 3005
- **db**: MySQL 8.0 on port 3306
- **dbdata**: Persistent volume for database

---

## 💻 Local Development (Without Docker)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up MySQL

Ensure MySQL is running locally on port 3306 with:
- User: `root`
- Password: `pothole`
- Database: `pothole_db`

Update `.env` if using different credentials:
```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=pothole
DB_NAME=pothole_db
```

### 3. Start the Dev Server
```bash
npm run start:dev
```

Backend will run on http://localhost:3005

### 4. Type-Check
```bash
npx tsc --noEmit
```

---

## 🏗️ Build for Production

```bash
# Build the TypeScript
npm run build

# Start production server
npm run start:prod
```

---

## 🧪 Testing the API

### Step 1: Seed Admin Accounts

```bash
docker compose exec backend npm run seed
```

Expected output:
```
✓ Created admin: admin1@potholereporter.com
✓ Created admin: admin2@potholereporter.com
Database seeding complete!
```

### Step 2: Login as Admin

```bash
curl -X POST http://localhost:3005/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin1@potholereporter.com","password":"AdminPassword123!"}'
```

Response:
```json
{
  "token": "YWRtaW4xQHBvdGhvbGVyZXBvcnRlci5jb206QWRtaW5QYXNzd29yZDEyMyE=",
  "admin": {"id": 1, "email": "admin1@potholereporter.com"}
}
```

### Step 3: Create a Pothole Report

```bash
curl -X POST http://localhost:3005/potholes \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -15.3875,
    "longitude": 28.3228,
    "description": "Large pothole near intersection",
    "reporterName": "Alice",
    "severity": "HIGH"
  }'
```

Response includes `id` (example: 1, use for next step).

### Step 4: Update Pothole Status (Admin Only)

```bash
curl -X PUT http://localhost:3005/potholes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YWRtaW4xQHBvdGhvbGVyZXBvcnRlci5jb206QWRtaW5QYXNzd29yZDEyMyE=" \
  -d '{"status":"In Progress"}'
```

### Step 5: Fetch All Potholes

```bash
curl http://localhost:3005/potholes
```

---

### Using PowerShell

**Create a pothole:**
```powershell
$headers = @{ 'Content-Type' = 'application/json' }
$body = @{
    latitude = -15.3875
    longitude = 28.3228
    description = "Large pothole near intersection"
    reporterName = "Alice"
    severity = "HIGH"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3005/potholes" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

**Login as admin:**
```powershell
$headers = @{ 'Content-Type' = 'application/json' }
$body = @{
    email = "admin1@potholereporter.com"
    password = "AdminPassword123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3005/auth/login" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

**Update pothole status (with token):**
```powershell
$headers = @{ 
    'Content-Type' = 'application/json'
    'Authorization' = 'Bearer YOUR_TOKEN_HERE'
}
$body = @{ status = "In Progress" } | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3005/potholes/1" `
  -Method PUT `
  -Headers $headers `
  -Body $body
```

**Fetch all potholes:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3005/potholes" -Method GET
```

---

## 🐛 Troubleshooting

### "Unable to connect to the database"
- Ensure MySQL container is running: `docker compose ps`
- Check MySQL is healthy: `docker compose logs db`
- Verify `.env` password matches `docker-compose.yml` `MYSQL_ROOT_PASSWORD`

### "Port 3005 already in use"
- Kill the process: `lsof -i :3005` (Mac/Linux) or `netstat -ano | findstr :3005` (Windows)
- Or change `PORT` in `.env` and update docker-compose.yml

### "Cannot find module"
- Run `npm install` in the backend folder
- Restart your TypeScript server

---

## 📚 Technologies Used

- **NestJS** — Modern Node.js framework
- **TypeORM** — ORM for MySQL
- **MySQL 8.0** — Relational database
- **Docker** — Containerization
- **TypeScript** — Type-safe JavaScript

---

## 📝 Notes

- `synchronize: true` is enabled in development (auto-creates tables). For production, use migrations and set `synchronize: false`.
- The backend has built-in retry logic for database connections during startup.
- All timestamps are stored as UTC.
- Input validation is strict; refer to API docs for exact field constraints.

---

## 📄 License

School project — No external license.
