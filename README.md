# D&D Campaign Manager (SWI project)

A full-stack web app for game masters running a Dungeons & Dragons campaign: manage characters, NPCs, monsters, items, spells, locations and quests in one place, and track combat state (HP, conditions, death saves, spell slots) during a session.

![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

> University project for the *Software Engineering (SWI)* course, University of Ostrava.

## Features

- **Authentication** – registration and login with JWT; all API routes except `/api/auth/**` require a token.
- **Characters** – full character sheets with class, race, inventory and spells; equip items, take damage, heal (single or whole party), death saves, conditions and spell-slot tracking.
- **NPCs & Bestiary** – create and manage NPCs and monsters with stats.
- **Items & Spells** – catalogues that can be assigned to characters.
- **Locations** – world locations with descriptions.
- **Quests** – quests with participating characters and completion tracking.
- **UI** – dashboard, sidebar navigation, search and sorting, loading and error states.

## Architecture

```
React (frontend/)  ──REST + JWT──▶  Spring Boot API (backend/Springboot)  ──JPA──▶  MySQL 8
                                     Django service (backend/Django_AI) – placeholder for planned AI features
```

| Part | Tech |
|---|---|
| Backend | Spring Boot 3, Spring Data JPA / Hibernate, Spring Security, JWT, Maven |
| Frontend | React 18, React Router, Tailwind CSS, Jest + Testing Library |
| Database | MySQL 8 (Docker Compose) |
| AI service | Django – currently only a health-check endpoint, AI features are planned |

## Getting Started

### Prerequisites

- Java 17+, Maven
- Node.js 18+
- Docker (for the database)

### 1. Database

```bash
cd backend
docker compose up -d        # MySQL on localhost:3306
```

### 2. Backend

```bash
cd backend/Springboot
cp .env.example .env        # set DB credentials and JWT_SECRET
mvn spring-boot:run         # API on http://localhost:8080
```

All settings are read from environment variables (see [`.env.example`](backend/Springboot/.env.example)); profiles `dev` and `prod` are available via `SPRING_PROFILES_ACTIVE`.

### 3. Frontend

```bash
cd frontend
npm install
npm start                   # http://localhost:3000
```

### 4. (Optional) AI service

```bash
cd backend/Django_AI
pip install django
export DJANGO_SECRET_KEY=change-me
python manage.py runserver  # http://localhost:8000/health/
```

## API Overview

All endpoints are under `/api`. Standard CRUD (`GET` list, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`) exists for:
`characters`, `items`, `monsters`, `npcs`, `spells`, `locations`, `quests`. Read-only lists: `classes`, `races`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET | `/api/auth/validate` | Validate token |
| PUT | `/api/characters/{id}/damage` | Apply damage |
| PUT | `/api/characters/{id}/heal` · `/heal-amount` | Full / partial heal |
| PUT | `/api/characters/heal-batch` | Heal several characters at once |
| POST | `/api/characters/{id}/death-save` | Roll a death saving throw |
| PUT | `/api/characters/{id}/conditions` | Set conditions |
| PUT | `/api/characters/{id}/spell-slots` | Update spell slots |
| POST / DELETE | `/api/characters/{id}/items/{itemId}` | Add / remove item |
| POST | `/api/characters/{id}/equip` | Equip item |
| POST / DELETE | `/api/characters/{id}/spells/{spellId}` | Learn / forget spell |
| GET | `/api/quests/{id}/participants` | Quest participants |
| POST / DELETE | `/api/quests/{id}/participants/{characterId}` | Add / remove participant |
| PUT | `/api/quests/{id}/complete` | Complete quest |

## Project Structure

```
SWI-project/
├── backend/
│   ├── docker-compose.yml         # MySQL
│   ├── Springboot/                # REST API
│   │   └── src/main/java/org/swi_project/
│   │       ├── controllers/  models/  repositories/
│   │       ├── DTO/  security/  config/  exception/
│   └── Django_AI/                 # AI service (placeholder)
└── frontend/
    └── src/
        ├── App.jsx                # routes
        ├── api.js                 # API client
        ├── dndUtils.js            # D&D rules helpers (XP, modifiers…)
        └── components/            # Dashboard, Character, Bestiary, Items, Spells, NPCs, Quests, Location…
```

## Author

**Ondřej Bassler** – [github.com/obassler](https://github.com/obassler)

## License

MIT
