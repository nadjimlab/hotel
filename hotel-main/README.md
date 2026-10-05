# La Gazelle d'Or Resort & Spa – Official Web Platform, Booking Engine & PMS

Plateforme officielle de haute hospitalité, moteur de réservation transactionnel avec protection anti-double réservation et système de gestion hôtelière (PMS) pour **La Gazelle d'Or Resort & Spa (El Oued, Algérie)**.

---

## Architecture Générale

```
┌────────────────────────────────────────────────────────┐
│             Client Viewport (Web & Mobile)             │
│   - Site Vitrine & Découverte (140 ha d'oasis, Souf)   │
│   - Moteur de Réservation Indépendant (Wizard 4 étapes)│
│   - Espace Client (/my-bookings, Vouchers PDF)         │
│   - Console PMS & Direction (/admin, KPIs, Calendrier) │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST API (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Serveur Express (server.ts)              │
│   - API Routes (/api/auth, /api/rooms, /api/booking)   │
│   - Gardes de Sécurité & Sessions                      │
│   - Calcul des Tarifs & Disponibilités Serveur         │
│   - Abstraction Paiements (Arrivée, CIB, Edahabia)     │
└───────────────────────────┬────────────────────────────┘
                            │ Transactions ACID / Locks
                            ▼
┌────────────────────────────────────────────────────────┐
│             PostgreSQL (Source de Vérité)              │
│   - Clés primaires UUID, Contraintes CHECK             │
│   - Verrouillage SELECT FOR UPDATE anti-conflit        │
│   - Historique d'audit & Journal des transactions      │
└────────────────────────────────────────────────────────┘
```

---

## 1. Prérequis & Installation

### Prérequis
- Node.js 18+ ou 20+
- npm ou yarn
- Instance PostgreSQL hébergée (Optionnelle en développement grâce au moteur WASM PGlite avec persistance locale)

### Installation
```bash
# 1. Cloner ou ouvrir le projet
cd hotel-lagazelledor-dz

# 2. Installer les dépendances
npm install
```

---

## 2. Variables d'Environnement (`.env`)

Copiez le fichier `.env.example` vers `.env` et adaptez les valeurs selon votre environnement :

```env
# Connexion PostgreSQL (Production / Cloud SQL / Supabase / Neon / RDS)
DATABASE_URL="postgresql://user:password@localhost:5432/lagazelledor"

# URLs des Domaines & Sous-Domaines
APP_URL="https://hotel-lagazelledor.dz"
BOOKING_URL="https://booking.hotel-lagazelledor.dz"
ADMIN_URL="https://admin.hotel-lagazelledor.dz"

# Sécurité Serveur & Clés de Chiffrement
SESSION_SECRET="votre-cle-secrete-de-session-minimum-32-caracteres"
JWT_SECRET="votre-cle-secrete-pour-signatures-jwt"

# Fournisseur de Paiement ('arrival' | 'cib_edahabia_sim' | 'international_card_sim')
PAYMENT_PROVIDER="arrival"

# Notifications SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="reservations@hotel-lagazelledor.dz"
SMTP_PASSWORD="votre-mot-de-passe-smtp"
SMTP_FROM="La Gazelle d'Or <reservations@hotel-lagazelledor.dz>"

PORT=3000
```

---

## 3. Gestion de la Base de Données (Migrations & Seeds)

Le projet intègre un système de migrations et de seeds idempotent :

```bash
# Exécuter les migrations DDL
npm run db:migrate

# Réinitialiser / Rollback de la base
npm run db:rollback

# Injecter les données de démonstration du complexe (Hébergements, Tarifs, Services, Admin)
npm run db:seed
```

### Données Administrateur par Défaut :
- **Email** : `admin@hotel-lagazelledor.dz`
- **Mot de passe** : `Gazelle2026!`

---

## 4. Démarrage en Développement

```bash
npm run dev
```
Le serveur Express démarre sur `http://localhost:3000` et monte les middlewares Vite avec rechargement instantané.

---

## 5. Construction pour la Production & Déploiement

```bash
# Construire les assets statiques frontend
npm run build

# Démarrer le serveur full-stack en mode production
npm start
```

---

## 6. Protection Anti-Double Réservation (Double Booking)

La sécurité d'inventaire est assurée directement dans la transaction PostgreSQL :
1. Chaque tentative de réservation exécute un `SELECT id, total_units FROM rooms WHERE id = $1 FOR UPDATE`. Ce verrou exclusif sur la ligne de l'hébergement sérialise les requêtes concurrentes.
2. Le moteur compte les réservations actives qui chevauchent l'intervalle :
   `check_in < $requestedCheckOut AND check_out > $requestedCheckIn AND status NOT IN ('cancelled', 'expired', 'no_show')`
3. Si `booked_count >= total_units`, la transaction exécute un `ROLLBACK` immédiat et renvoie une erreur HTTP 409 `ROOM_UNAVAILABLE`.
4. Si la capacité est respectée, la réservation, les services associés, la transaction de paiement et l'audit log sont insérés avant le `COMMIT`.

---

## 7. Moteur de Test Automatisé

Exécutez la suite complète de 12 tests d'intégrité transactionnelle et de concurrence :

```bash
npm run test:db
```

Scénarios validés :
1. Création de réservation valide avec numéro `LGD-YYYY-XXXXXX`
2. Rejet des formats de dates invalides
3. Rejet de date de départ antérieure à l'arrivée (`CHECK (check_in < check_out)`)
4. Rejet en cas de dépassement de capacité maximale
5. **Tentatives concurrentes simultanées** : Deux requêtes parallèles pour la dernière unité disponible &rarr; exactement 1 réussit (201), la seconde est rejetée (409)
6. Blocage d'une réservation subséquente chevauchante
7. Libération immédiate de l'inventaire en cas d'annulation
8. Protection contre la falsification des prix (calcul serveur autoritaire)
9. Rejet des jetons administratifs invalides ou falsifiés
10. Marquage explicite des passerelles de test (simulateurs)
11. Rétention des logs d'audit.

---

## 8. Configuration des Domaines & Sous-Domaines

- `https://hotel-lagazelledor.dz/` : Portail principal vitrine et présentation du complexe
- `https://booking.hotel-lagazelledor.dz/` ou `/booking` : Moteur de réservation autonome
- `https://admin.hotel-lagazelledor.dz/` ou `/admin` : Console de gestion de la direction et de la réception.
