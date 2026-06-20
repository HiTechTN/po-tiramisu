# 🤝 Contribuer à Po Tiramisu

Merci de votre intérêt pour contribuer à Po Tiramisu ! Ce guide vous explique comment participer au développement de la plateforme.

---

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Types de contribution](#types-de-contribution)
- [Débuter](#débuter)
- [Workflow de développement](#workflow-de-développement)
- [Conventions de code](#conventions-de-code)
- [Tester vos changements](#tester-vos-changements)
- [Soumettre une PR](#soumettre-une-pr)

---

## 📜 Code de conduite

Ce projet suit le [Contributor Covenant v2.1](CODE_OF_CONDUCT.md). En participant, vous acceptez de respecter ce code de conduite. Signalez tout comportement inacceptable à dev@hitechtn.tn.

---

## 🎯 Types de contribution

Nous accueillons toutes sortes de contributions :

| Type | Description | Difficulté |
|------|-------------|------------|
| 🐛 **Bug fix** | Corriger un problème existant | ⭐ |
| ✨ **Feature** | Ajouter une nouvelle fonctionnalité | ⭐⭐ |
| 📝 **Documentation** | Améliorer la doc (README, guides, commentaires) | ⭐ |
| 🧪 **Tests** | Ajouter ou améliorer les tests | ⭐⭐ |
| 🎨 **UI/UX** | Améliorer l'interface utilisateur | ⭐⭐ |
| 🔧 **Refactoring** | Améliorer la qualité du code | ⭐⭐⭐ |
| 🌍 **Traduction** | Traduire l'interface (FR/AR/EN) | ⭐⭐ |
| 📱 **Mobile** | Améliorer l'app React Native | ⭐⭐⭐ |

---

## 🚀 Débuter

### Prérequis

- **Git** — [Installation](https://git-scm.com/downloads)
- **Node.js 20+** — [Installation](https://nodejs.org/)
- **Python 3.11+** — [Installation](https://www.python.org/)
- **Docker & Docker Compose** — [Installation](https://docs.docker.com/get-docker/)
- **Un éditeur de code** — VS Code recommandé avec extensions ESLint + Pylance

### Cloner et configurer

```bash
# 1. Fork le projet sur GitHub
# 2. Cloner votre fork
git clone https://github.com/VOTRE_USERNAME/po-tiramisu.git
cd po-tiramisu

# 3. Ajouter le remote upstream
git remote add upstream https://github.com/HiTechTN/po-tiramisu.git

# 4. Lancer le projet en développement
make dev

# 5. Vérifier que tout fonctionne
#    → Frontend: http://localhost:3000
#    → Backend:  http://localhost:8000/docs
```

---

## 🔄 Workflow de développement

### 1. Créer une branche

```bash
# Synchroniser avec upstream
git fetch upstream
git checkout -b feature/ma-nouvelle-fonctionnalite upstream/master
```

**Convention de nommage des branches :**

| Préfixe | Usage |
|---------|-------|
| `feature/` | Nouvelle fonctionnalité |
| `fix/` | Correction de bug |
| `docs/` | Documentation |
| `test/` | Ajout/modification de tests |
| `refactor/` | Refactoring |
| `chore/` | Maintenance (deps, CI, etc.) |

### 2. Développer

```bash
# Faire vos modifications...
# Tester localement
make test

# Committer avec des messages conventionnels
git commit -m "feat: ajouter le suivi de livraison GPS"
git commit -m "fix: corriger le calcul du panier avec code promo"
git commit -m "docs: ajouter la section API dans le README"
git commit -m "test: ajouter les tests pour l'endpoint orders"
```

**Convention de commit :**

```
<type>(<scope>): <description courte>

<description optionnelle en plusieurs lignes>

<références optionnelles>
```

Types : `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `style`, `perf`, `ci`

### 3. Pusher et créer une PR

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

Puis ouvrez une Pull Request sur GitHub contre la branche `master`.

---

## 📏 Conventions de code

### Backend (Python/FastAPI)

```bash
# Style : PEP 8, max 120 caractères par ligne
# Linter : flake8 (optionnel)
cd backend && python -m flake8 app/ --max-line-length=120

# Types : Pydantic pour la validation, SQLAlchemy pour les models
# Async : utiliser async/await pour les endpoints
# Naming : snake_case pour les fonctions/variables, PascalCase pour les classes
```

**Règles :**
- Tous les endpoints doivent avoir un `response_model` Pydantic
- Les erreurs doivent lever `HTTPException` avec un message clair
- Les queries DB doivent utiliser SQLAlchemy ORM (pas de SQL brut)
- Les imports doivent être triés : stdlib → third-party → local

### Frontend (TypeScript/React)

```bash
# Linter : ESLint (next/core-web-vitals)
cd frontend && npm run lint

# Types : TypeScript strict
# State : Zustand pour l'état global
# Data : React Query pour le fetch
# Style : TailwindCSS (pas de CSS custom)
# Naming : PascalCase pour les composants, camelCase pour les fonctions
```

**Règles :**
- Tous les fichiers doivent être typés (pas de `any`)
- Les composants doivent utiliser `'use client'` si besoin de hooks React
- Les appels API doivent passer par `lib/api.ts`
- Les styles doivent utiliser les classes TailwindCSS existantes

### Mobile (React Native/Expo)

```bash
# Linter : Expo lint
cd mobile && npx expo lint

# State : Zustand
# Navigation : React Navigation (Stack + Tabs)
# Style : StyleSheet.create
# API : Client dans src/api.ts avec interceptors JWT
```

---

## 🧪 Tester vos changements

### Tests backend

```bash
cd backend
python -m pytest tests/ -v --tb=short
```

**Minimum requis :**
- Tous les tests existants doivent passer
- Les nouveaux endpoints doivent avoir des tests
- Utiliser les fixtures de `conftest.py`

### Tests frontend

```bash
cd frontend
npm run lint    # Lint
npm run build   # Build production
```

### Tests mobile

```bash
cd mobile
npx expo lint   # Lint
npx expo start  # Vérifier que l'app démarre
```

### Docker

```bash
# Vérifier que les images Docker buildent
make docker-build

# Vérifier que le stack complet démarre
make dev
```

---

## 📬 Soumettre une PR

### Checklist avant de soumettre

- [ ] Les tests passent (`make test`)
- [ ] Le lint passe (`make lint`)
- [ ] Le build Docker fonctionne (`make docker-build`)
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les commits sont conventionnels et propres
- [ ] La PR a un titre clair et une description détaillée

### Template de PR

```markdown
## Description
Décrivez vos changements en détail.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Documentation
- [ ] Refactoring
- [ ] Autre

## Comment tester
Décrivez comment tester vos changements.

## Screenshots (si applicable)
Ajoutez des captures d'écran pour les changements UI.

## Checklist
- [ ] Tests passent
- [ ] Lint passe
- [ ] Documentation mise à jour
```

### Après la soumission

1. Un reviewer examinera votre PR sous 48h
2. Vous recevrez des retours ou une approbation
3. Après approbation, la PR sera mergée sur `master`
4. Le pipeline CI/CD se déclenchera automatiquement

---

## 🏗️ Architecture du projet

Pour comprendre la structure du code, consultez :

- [README.md](README.md) — Vue d'ensemble
- [ARCHITECTURE_GUIDE_PO_TIRAMISU.md](ARCHITECTURE_GUIDE_PO_TIRAMISU.md) — Architecture détaillée
- [PO_TIRAMISU_PRD_COMPLETE.md](PO_TIRAMISU_PRD_COMPLETE.md) — Spécifications produit

---

## ❓ Besoin d'aide ?

- **GitHub Issues** — Pour les bugs et les demandes de fonctionnalités
- **GitHub Discussions** — Pour les questions et idées
- **Email** — dev@hitechtn.tn pour les questions urgentes

---

## 🙏 Merci !

Chaque contribution compte. Merci de faire partie de la communauté Po Tiramisu !
