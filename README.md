# BankOS — Système de Gestion Bancaire Numérique

**BankOS** est une application web moderne de gestion bancaire conçue et développée dans le cadre du module **Génie Logiciel & Architectures Web** (Année Universitaire 2025–2026). 

Le projet applique les standards industriels du développement web : architecture client-serveur découplée, API REST sécurisée, conteneurisation et intégration continue (CI/CD).

##  Auteurs:
* **Badr Eddine NOUBL**
* **Mohamed EL FARNANE**

---

##  Fonctionnalités:

* **Gestion des Sessions :** Inscription et authentification des administrateurs/gestionnaires avec jetons sécurisés **JWT**.
* **Tableau de Bord :** Vue d'ensemble des indicateurs clés (nombre de clients, solde total de la banque, comptes actifs).
* **Gestion Clientèle (CRUD) :** Création, lecture, modification et suppression des fiches clients avec numéros de compte uniques.
* **Moteur de Transactions :** Dépôts et retraits en temps réel avec vérification automatique du solde (gestion des découverts).
* **Historique complet :** Consultation de l'historique des opérations pour chaque client.
* **Interface Fluide :** Interface *Single Page Application* (SPA) avec bascule de thème Jour/Nuit persistant.

---

##  Stack Technique:

| Composant | Technologie |
| :--- | :--- |
| **Backend** | FastAPI (Python 3.11), Uvicorn |
| **Base de données** | SQLite + SQLAlchemy (ORM) |
| **Sécurité** | JWT (`python-jose`), Passlib (Hash Bcrypt) |
| **Frontend** | HTML5 / CSS3 (Flexbox & Grid) / JavaScript (ES6+ Vanille) |
| **Conteneurisation** | Docker |
| **CI/CD** | GitHub Actions (Tests automatisés avec `pytest` & `httpx`) |
| **Hébergement** | Railway PaaS |

---

##  Structure du Projet:

```text
bankos/
├── .github/
│   └── workflows/
│       └── ci.yml             # Pipeline GitHub Actions (Tests)
├── backend/
│   └── app/
│       ├── main.py            # Point d'entrée de l'API FastAPI
│       ├── database.py        # Configuration SQLAlchemy
│       ├── models.py          # Modèles relationnels de la base de données
│       ├── schemas.py         # Schémas de validation Pydantic
│       ├── auth.py            # Logique de sécurité et gestion JWT
│       ├── static/            # Fichiers du Frontend SPA (HTML/CSS/JS)
│       └── requirements.txt   # Dépendances Python
├── Dockerfile                 # Configuration du conteneur Docker
└── README.md                  # Documentation du projet
