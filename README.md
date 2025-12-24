
# 🕳️ Pothole Reporter Backend (Spatial API)

A **production-oriented backend API** built with **NestJS** for reporting, managing, and visualizing potholes using **geospatial data**.
This is a **personal project**, designed to demonstrate **backend engineering, spatial databases, and real-world civic technology use cases**.

The system allows the public to report potholes and enables administrators to **view exact pothole locations on Google Maps**, manage report status, and prioritize repairs using spatial queries.

---

## 📌 Project Overview

The Pothole Reporter Backend provides:

* Public pothole reporting with precise geographic coordinates
* Administrative review and status tracking
* Spatial querying using **PostGIS**
* Google Maps–ready location data for accurate visualization
* Secure admin authentication

The API is frontend-agnostic and can be consumed by any web or mobile client.

---

## 🗺️ Key Spatial Capabilities (PostGIS)

This backend uses **PostgreSQL with PostGIS** to handle geospatial data efficiently.

### Spatial Features:

* Store pothole locations as `POINT` geometries
* Convert spatial data to **GeoJSON** for Google Maps
* Calculate distances between potholes and other geometries
* Query potholes inside areas or regions

Admins can visually inspect potholes on **Google Maps** to:

* Identify exact locations
* Verify reports
* Plan maintenance efficiently

---

## 🏗️ System Architecture

```
Client (Web / Google Maps / Postman)
        ↓
REST API (NestJS)
        ↓
Authentication Layer (JWT)
        ↓
PostgreSQL + PostGIS
```

---

## ✨ Core Features

### 📝 Public Pothole Reporting

* Report potholes with:

  * Latitude & Longitude
  * Description
  * Severity level
  * Reporter name
* No authentication required

---

### 🛠️ Admin Management

* Secure admin login
* Update pothole status:

  * Pending
  * In Progress
  * Fixed
* Modify severity or description
* View all potholes with spatial data

---

### 🗺️ Map Integration (Google Maps)

* Backend exposes coordinates in **GeoJSON**
* Frontend can directly plot potholes on Google Maps
* Exact positioning using PostGIS geometry data

---

## 🛠️ Technology Stack

### Backend

* **Framework:** NestJS
* **Language:** TypeScript
* **ORM:** TypeORM
* **Authentication:** JWT

### Database & Spatial

* **Database:** PostgreSQL
* **Spatial Extension:** PostGIS
* **Indexes:** GIST (for performance)

### DevOps

* **Containerization:** Docker
* **Local Orchestration:** Docker Compose

### Tooling

* **API Testing:** Postman, cURL
* **Maps Integration:** Google Maps API
* **Version Control:** Git & GitHub

---

## 🚀 Getting Started (Development)

### Prerequisites

* Docker & Docker Compose
* Node.js 18+
* Git

---

### Clone the Repository

```bash
git clone https://github.com/<your-username>/pothole-reporter-backend.git
cd pothole-reporter-backend
```

---

### Run with Docker Compose

```bash
docker compose up --build
```

Backend will be available at:

```
http://localhost:3005
```

---

## 🔐 Authentication (Admin)

### Admin Login

```bash
POST /auth/login
```

```bash
curl -X POST http://localhost:3005/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@example.com",
  "password": "AdminPassword123!"
}'
```

Returns a JWT token required for admin-only endpoints.

---

## 📡 API Endpoints (Summary)

### Create Pothole (Public)

```http
POST /potholes
```

### Get All Potholes

```http
GET /potholes
```

### Update Pothole Status (Admin)

```http
PUT /potholes/:id
```

### Verify Admin Token

```http
GET /auth/verify
```

---

## 🗄️ Database Design (Simplified)

### `potholes` Table

| Column       | Type                  | Description                   |
| ------------ | --------------------- | ----------------------------- |
| id           | SERIAL                | Primary key                   |
| geom         | GEOMETRY(Point, 4326) | Spatial location              |
| description  | TEXT                  | Pothole details               |
| severity     | VARCHAR               | LOW / MEDIUM / HIGH           |
| status       | VARCHAR               | Pending / In Progress / Fixed |
| reporterName | VARCHAR               | Reporter name                 |
| reportedAt   | TIMESTAMP             | Report time                   |

A **GIST index** is applied on `geom` for fast spatial queries.

---

## 🛰️ PostGIS Functions Used

* `ST_SetSRID`
* `ST_GeomFromGeoJSON`
* `ST_AsGeoJSON`
* `ST_Distance`
* `ST_Intersects`
* `ST_ClosestPoint`

These functions allow accurate distance calculation, map rendering, and spatial filtering.

---

## 🧪 Testing the API

All endpoints can be tested using:

* **Postman**
* **cURL**
* **PowerShell**

Example:

```bash
curl http://localhost:3005/potholes
```

---

## 📂 Project Structure

```
src/
│── auth/
│── potholes/
│── database/
│── main.ts
Dockerfile
docker-compose.yml
README.md
```

---

## 🔮 Future Enhancements

* Role-based access control (RBAC)
* Nearest-road matching using OSM data
* Heatmaps for pothole density
* Cloud deployment (AWS + Kubernetes)
* Public reporting analytics dashboard

---

## 👤 Author

**Lusungu Mhango**

* GitHub: [https://github.com/lusungu-skillset](https://github.com/lusungu-skillset)
* Focus: Backend Development | DevOps | Geospatial Systems

---

## 📄 License

This project is a **personal portfolio project** intended for learning, experimentation, and demonstration purposes.

---

### ✅ Key Takeaway

> This project demonstrates **real-world backend engineering** using **spatial databases** and **map-based visualization**.
