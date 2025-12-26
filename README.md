
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
Great progress so far 👍
Below is a **clean, professional section you can add to your README** that explains **Jenkins CI/CD, automated tests, and deployment**, written in a way recruiters and reviewers expect.

You can **copy–paste this directly** under your README (e.g. after “DevOps” or “Getting Started”).

---

# 🔁 CI/CD Pipeline (Jenkins)

This project uses a **Jenkins-based CI/CD pipeline** to automate code validation, testing, containerization, and image publishing whenever changes are pushed to GitHub.

The pipeline is designed to follow **industry-standard DevOps practices** and demonstrate production-style automation.

---

## 🧩 Pipeline Overview

**Trigger**

* Automatically triggered on every `git push` to the `main` branch using a **GitHub Webhook**

**Stages**

1. Source Code Checkout
2. Dependency Installation
3. Automated Testing
4. Docker Image Build
5. Docker Image Push (Docker Hub)
6. Workspace Cleanup

---

## 🔧 Jenkins Setup (Dockerized)

Jenkins runs inside a Docker container with:

* **Node.js 18** installed (for NestJS builds)
* **Docker CLI access** via Docker socket mounting
* Persistent Jenkins data using Docker volumes

This allows Jenkins to:

* Run Node/NPM commands
* Build Docker images
* Push images to Docker Hub

---

## 📜 Jenkinsfile (Pipeline as Code)

The pipeline is defined using a `Jenkinsfile` stored in the repository, following **Pipeline-as-Code** best practices.

### High-level Jenkinsfile structure:

```groovy
pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        dir('backend') {
          sh 'npm ci'
        }
      }
    }

    stage('Run Tests') {
      steps {
        dir('backend') {
          sh 'npm test'
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t <dockerhub-username>/pothole-backend:latest .'
      }
    }

    stage('Push Docker Image') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push <dockerhub-username>/pothole-backend:latest
          '''
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}
```

---

## 🧪 Automated Testing

Automated tests are executed during the pipeline using:

```bash
npm test
```

This ensures:

* API logic is validated before building images
* Failing tests stop the pipeline early
* Only stable builds are containerized and pushed

---

## 🐳 Docker Image Build & Push

On successful tests:

* A Docker image is built from the project `Dockerfile`
* The image is tagged with `latest`
* The image is securely pushed to **Docker Hub** using Jenkins credentials

This makes the backend **deployment-ready** for any container platform.

---

## 🌐 GitHub Webhook Integration

A GitHub webhook is configured to notify Jenkins on every push:

**Webhook URL**

```
https://raphael-daughterly-joy.ngrok-free.dev/github-webhook/
```

This enables:

* Fully automated CI/CD
* No manual job triggering
* Real-time feedback on code changes

---

## 🚀 Deployment Readiness

The produced Docker image can be deployed to:

* Docker Compose
* Kubernetes (K8s)
* Cloud platforms (AWS, GCP, Azure)

This pipeline forms the foundation for:

* Blue/Green deployments
* Rolling updates
* Infrastructure-as-Code workflows

---

## ✅ Key DevOps Practices Demonstrated

* Pipeline-as-Code (Jenkinsfile)
* Automated testing
* Secure credential management
* Container-based builds
* GitHub webhook automation
* CI/CD best practices

--
## 📄 License

School project — No external license.
