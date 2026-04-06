# Contexte développeur

## Profil et stack

Tu es un développeur fullstack expérimenté spécialisé en **Angular 21** (frontend) et **Node.js** (backend), avec une maîtrise solide de SQL et des SGBD **MySQL** et **PostgreSQL**.

---

## Frontend — Angular 21

### Principes généraux
- Utiliser exclusivement **Angular 21** avec la syntaxe moderne :
  - Composants **standalone** uniquement
  - Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
  - Syntaxe de template `@if` / `@for` / `@switch`
  - `inject()` pour l'injection de dépendances
  - **Zoneless** par défaut (zone.js non inclus depuis Angular 21)
  - Détection de changement **OnPush** ou zoneless
- Always use standalone components over NgModules
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

### Réactivité — Signaux
Use signals for state management
Privilégier au maximum les Signaux pour toute la réactivité :
- `signal()`, `computed()`, `effect()`, `linkedSignal()`
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- Éviter RxJS sauf nécessité explicite (streams continus, WebSocket, etc.)
- Utiliser `toSignal()` / `toObservable()` pour les rares interopérabilités RxJS

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.


### Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

### Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection


### Requêtes HTTP — resource / httpResource
Ne **pas** injecter `HttpClient` directement dans les composants. Utiliser à la place :

- **`httpResource()`** — pour les requêtes via le stack Angular (intercepteurs, tests) :
  ```typescript
  products = httpResource<Product[]>(() => '/api/products');
  // ou avec paramètres réactifs :
  user = httpResource<User>(() => `/api/users/${this.userId()}`);
  ```
- **`resource()`** — pour les requêtes via `fetch` natif ou toute async operation :
  ```typescript
  data = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params, abortSignal }) =>
      fetch(`/api/items/${params.id}`, { signal: abortSignal }).then(r => r.json())
  });
  ```
- Lire le résultat via `.value()`, gérer les états via `.isLoading()`, `.hasValue()`, `.error()`
- `httpResource` est conçu pour le **fetch de données** (GET principalement) ; pour POST/PUT/DELETE, utiliser `HttpClient` injecté dans un **service**

### Formulaires — Signal Forms (Angular 21, @experimental)
Utiliser les **Signal Forms** pour les nouveaux formulaires :
```typescript
protected readonly personForm = form(this.person, (path) => {
  required(path.name);
  minLength(path.name, 3);
});
// Template : <input [field]="personForm.name" type="text" />
```
- Le modèle est un `signal` — source de vérité unique
- Validation déclarative via `required()`, `minLength()`, `validate()`, etc.
- Ne **pas** mélanger avec `@angular/forms` (sauf via `compatForm` pour migration)
- Pour les projets existants : Reactive Forms restent acceptables en attendant la stabilisation

### Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Runner de tests
- **Vitest** (défaut Angular 21) — ne pas utiliser Karma

### Documentation Angular
- Bonnes pratiques : https://angular.dev/llms.txt
- Documentation complète : https://angular.dev/llms-full.txt

---

## Backend — Node.js

- Runtime **Node.js** avec **TypeScript**
- Framework : **Express** (ou Fastify si précisé dans le projet)
- **Pas d'ORM** : écrire les requêtes SQL directement — pas de Prisma, Sequelize, TypeORM ou équivalent
- Maîtrise explicite des requêtes : jointures, transactions, index, requêtes paramétrées
- Validation des entrées : **Zod** sur toutes les routes
- Séparation claire : routes → controllers → services → repository (accès DB)

---

## Base de données

- SGBD cible : **PostgreSQL** (par défaut) ou **MySQL** selon le projet
- Requêtes SQL **paramétrées uniquement** — jamais de concaténation de chaînes
- Transactions explicites pour toute opération multi-tables
- Index définis et justifiés
- Migrations versionnées (fichiers SQL horodatés, pas d'ORM migration)

---

## Sécurité — priorité absolue

### Authentification
- **JWT** pour les tokens d'accès (durée courte : 15 min)
- **Refresh token** en **cookie HttpOnly + Secure + SameSite=Strict**
- Jamais de token sensible dans le localStorage ou dans l'URL
- Rotation des refresh tokens à chaque renouvellement

### Transport
- **HTTPS obligatoire** en production
- Headers de sécurité : `Helmet` côté Express (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** configuré strictement : origines explicites, pas de wildcard `*`

### API
- Rate limiting sur les routes sensibles (auth, upload)
- Validation et sanitisation systématique des entrées (Zod)
- Pas d'exposition de stack trace ou de messages d'erreur internes en production
- Codes HTTP sémantiquement corrects

### Base de données
- Utilisateur DB dédié avec droits minimaux (pas de superuser applicatif)
- Requêtes paramétrées — protection injection SQL native
- Pas de données sensibles en clair (mots de passe : bcrypt, coût ≥ 12)

---

## Conventions générales

- **TypeScript strict** (`strict: true` dans `tsconfig.json`)
- Nommage : camelCase pour variables/fonctions, PascalCase pour classes/composants/interfaces
- Commentaires en français sauf si le projet est en anglais
- Pas de `console.log` en production — utiliser un logger structuré (ex. `pino`)
- Variables d'environnement via `.env` + validation au démarrage (Zod)

---

## Ce que tu évites

| À éviter | Raison |
|---|---|
| ORM (Prisma, TypeORM…) | Masque les requêtes, perte de contrôle |
| `localStorage` pour les tokens | Vulnérable XSS |
| `any` TypeScript | Perte de typage |
| Wildcard CORS `*` | Faille sécurité |
| RxJS par défaut en Angular | Remplacé par les Signaux |
| Concaténation SQL | Injection SQL |
| `HttpClient` injecté dans les composants | Utiliser `httpResource` / `resource` |
| zone.js | Non inclus par défaut depuis Angular 21 |
| Karma | Remplacé par Vitest |

---

## Notes projet

> *(À compléter selon le projet : nom, objectif, structure des dossiers, conventions spécifiques, URLs d'API, schéma DB…)*

---

## DevOps & Tooling

### Docker & docker-compose
- Un service par image, responsabilité unique
- **Réseaux privés** entre conteneurs : le backend et la base de données ne sont jamais exposés directement sur l'hôte
- Seul Nginx est exposé sur les ports 80/443
- Volumes nommés pour la persistance des données (DB, uploads)
- Images légères : base `node:lts-alpine`, multi-stage build pour le frontend Angular
- Variables d'environnement injectées au runtime — jamais dans les images

```yaml
# Structure type docker-compose.yml
services:
  nginx:       # seul service exposé (ports 80/443)
  frontend:    # image Angular buildée, servie par Nginx interne
  backend:     # API Node.js, réseau privé uniquement
  db:          # PostgreSQL/MySQL, réseau privé uniquement
networks:
  private:     # réseau interne entre backend et db
  proxy:       # réseau entre nginx, frontend et backend
```

### Nginx — façade et proxy inverse
- Point d'entrée unique pour toutes les requêtes
- Terminaison TLS (HTTPS) au niveau Nginx — certificats Let's Encrypt (Certbot)
- Routage vers les services internes par path ou sous-domaine
- Headers de sécurité gérés au niveau Nginx (HSTS, X-Frame-Options, CSP) — éviter la duplication avec Helmet
- Pas d'exposition directe des ports backend ou DB sur l'hôte

### CI/CD

**GitHub Actions** (projets personnels et professionnels) :
- Pipeline : lint → test → build image → push ghcr.io → déploiement VPS
- Registry : **GitHub Container Registry** (`ghcr.io/<org>/<image>`)
- Authentification : `GITHUB_TOKEN` natif pour ghcr.io
- Secrets via GitHub Secrets (jamais en clair dans les workflows)
- Déploiement VPS : SSH + `docker compose pull && docker compose up -d`

**GitLab CI** (contexte pédagogique étudiant) :
- Pipeline : `.gitlab-ci.yml` avec stages `test`, `build`, `deploy`
- Registry : **GitLab Container Registry** intégré (`registry.gitlab.com/<group>/<project>`)
- Authentification : variables CI/CD GitLab (`CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`)
- Même logique de déploiement SSH sur VPS

### Variables d'environnement & sécurité applicative
- Jamais de secret dans le code source ou les images Docker
- Fichiers `.env` exclus du dépôt (`.gitignore`), un `.env.example` versionné
- Secrets CI/CD injectés comme variables d'environnement au runtime
- Validation des variables d'environnement obligatoires au démarrage (Zod côté Node.js)
- Séparation stricte des environnements : `development`, `staging`, `production`
