## Project Overview

This project is a comprehensive RPG management platform consisting of a Spring Boot backend and a React frontend. It allows users to manage characters, items, monsters, locations, quests, and story content, providing a GM control panel for combat encounters and world-building.

## Features

* **Character Management**: Create, edit, delete, and view detailed character profiles including stats, inventory, spells, and notes.
* **Item Management**: Define and equip items with dynamic properties based on type (weapons, armor, potions, etc.), including magical properties, damage, armor class, and more.
* **Bestiary**: Add, edit, and delete monsters and bosses with stats and loot.
* **Locations**: Manage locations with descriptions, assign monsters/NPCs, and edit world settings.
* **Combat Encounter**: Quick access to monsters in the current location for GM-managed combat.
* **Story Editor**: Write and save narrative content and manage quests.
* **Map Tokens**: Drag, drop, zoom, and save token positions on an interactive map.
* **Pagination & Navigation**: Paginate character lists, navigate between screens, and use quick actions like dice rolling.
* **Docker Setup**: Ready-to-use Docker Compose for backend, frontend, and MySQL.

## Tech Stack

* **Backend**: Spring Boot 3, Hibernate, Spring Data JPA, Spring Security, MySQL
* **Frontend**: React, Tailwind CSS, React Router, react-zoom-pan-pinch, react-draggable
* **Database**: MySQL 8.0
* **Containerization**: Docker, Docker Compose
* **Build Tools**: Maven (backend), npm (frontend)

## Architecture

```
Client (React) <--> Spring Boot API <--> MySQL Database
```

* **REST API**: Exposes endpoints under `/api/*` for characters, items, monsters, locations, map tokens, story, and quests.
* **Entities**: Defined using JPA: Character, CharacterClass, Race, Item, Monster, Location, Quest, Spell.
* **Frontend Routes**: Uses React Router to navigate between Dashboard, Character list/detail, Item list/form, Bestiary, Locations, Story Editor, Map.

## Getting Started

### Prerequisites

* Java 17
* Node.js 16+
* Docker & Docker Compose

### Running Locally

1. **Clone the repo**:

   ```bash
   git clone https://github.com/your-repo/rpg-manager.git
   cd rpg-manager
   ```

2. **Docker Compose**:

   ```bash
   docker-compose up --build
   ```

   * MySQL runs on port `3306`
   * Backend runs on port `8080`
   * Frontend runs on port `80`

3. **Without Docker**:

   * **Backend**:

     ```bash
     cd backend/Springboot
     mvn clean package
     java -jar target/Springboot-1.0-SNAPSHOT.jar
     ```
   * **Frontend**:

     ```bash
     cd frontend
     npm install
     npm run start
     ```

## API Endpoints

| Method | Path                   | Description               |
| ------ | ---------------------- | ------------------------- |
| GET    | `/api/characters`      | List all characters       |
| GET    | `/api/characters/{id}` | Get character by ID       |
| POST   | `/api/characters`      | Create new character      |
| PUT    | `/api/characters/{id}` | Update existing character |
| DELETE | `/api/characters/{id}` | Delete character          |
| GET    | `/api/items`           | List all items            |
| POST   | `/api/items`           | Create new item           |
| PUT    | `/api/items/{id}`      | Update existing item      |
| DELETE | `/api/items/{id}`      | Delete item               |
| GET    | `/api/monsters`        | List monsters             |
| POST   | `/api/monsters`        | Add monster               |
| PUT    | `/api/monsters/{id}`   | Update monster            |
| DELETE | `/api/monsters/{id}`   | Remove monster            |
| GET    | `/api/locations`       | List locations            |
| POST   | `/api/locations`       | Create location           |
| PUT    | `/api/locations/{id}`  | Update location           |
| DELETE | `/api/locations/{id}`  | Delete location           |
| GET    | `/api/story`           | Get story text            |
| PUT    | `/api/story`           | Update story              |
| GET    | `/api/quests`          | List quests               |
| POST   | `/api/quests`          | Add quest                 |
| DELETE | `/api/quests/{id}`     | Remove quest              |
| GET    | `/api/map/tokens`      | Get map tokens            |
| PUT    | `/api/map/tokens/{id}` | Update token position     |

## Frontend Structure

```
/src
├── api.js            # API client wrapper
├── components
│   ├── Dashboard.jsx
│   ├── CharacterDetail.jsx
│   ├── CharacterForm.jsx
│   ├── Items.jsx
│   ├── ItemForm.jsx
│   ├── Bestiary.jsx
│   ├── MonsterForm.jsx
│   ├── Location.jsx
│   ├── LocationForm.jsx
│   ├── StoryEditor.jsx
│   └── Map.jsx
└── App.jsx           # React Router setup
```

## Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. Feel free to use and modify.
