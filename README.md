# Po Tiramisu - E-commerce & Logistics OS


[![iOS Build](https://github.com/HiTechTN/po-tiramisu/actions/workflows/ios.yml/badge.svg)](https://github.com/HiTechTN/po-tiramisu/actions/workflows/ios.yml)
[![Android Build](https://github.com/HiTechTN/po-tiramisu/actions/workflows/mobile.yml/badge.svg)](https://github.com/HiTechTN/po-tiramisu/actions/workflows/mobile.yml)
[![Web Deploy](https://github.com/HiTechTN/po-tiramisu/actions/workflows/nextjs.yml/badge.svg)](https://github.com/HiTechTN/po-tiramisu/actions/workflows/nextjs.yml)
[![Admin CI](https://github.com/HiTechTN/po-tiramisu/actions/workflows/admin.yml/badge.svg)](https://github.com/HiTechTN/po-tiramisu/actions/workflows/admin.yml)
Bienvenue dans le dépôt officiel de **Po Tiramisu**, une plateforme complète d'e-commerce et de logistique spécialement conçue pour la vente de tiramisus artisanaux.

Le projet est divisé en plusieurs applications :
- **Web App / Mobile App (Android & iOS)** : L'application client-facing (développée avec Next.js et Capacitor).
- **Admin Dashboard** : L'interface de gestion interne des commandes.
- **Backend** : Supabase (Base de données PostgreSQL, Authentification, et Fonctions Edge).

## Table des matières
1. [Prérequis](#prérequis)
2. [Installation & Déploiement Local](#installation--déploiement-local)
3. [Génération et Lancement des Applications Mobiles (Android & iOS)](#génération-et-lancement-des-applications-mobiles-android--ios)
4. [Déploiement en Production](#déploiement-en-production)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :
- [Node.js](https://nodejs.org/) (version 18+)
- [Git](https://git-scm.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (pour gérer la base de données localement)
- [Docker](https://www.docker.com/) (requis par Supabase CLI pour la base locale)
- [Android Studio](https://developer.android.com/studio) (pour compiler l'application Android)
- [Xcode](https://developer.apple.com/xcode/) (pour compiler l'application iOS, nécessite macOS)

---

## Installation & Déploiement Local

### 1. Cloner le projet
```bash
git clone https://github.com/HiTechTN/po-tiramisu.git
cd po-tiramisu
```

### 2. Démarrer le Backend (Supabase Local)
```bash
# Lance les conteneurs Docker de Supabase
supabase start

# Optionnel: si vous avez modifié les migrations, réinitialisez la base
supabase db reset
```
Les URL d'accès API et les clés locales (`anon key`, `service_role`) seront affichées dans votre terminal.

### 3. Configurer les variables d'environnement
Dans le dossier `apps/web` et `apps/admin`, créez un fichier `.env.local` et ajoutez les clés générées par Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_locale
```

### 4. Lancer l'Application Web Client (`apps/web`)
```bash
cd apps/web
npm install
npm run dev
```
L'application web sera accessible sur `http://localhost:3000`.

### 5. Lancer le Dashboard Admin (`apps/admin`)
```bash
cd apps/admin
npm install
npm run dev
```
L'administration sera accessible sur `http://localhost:3001`.

---

## Génération et Lancement des Applications Mobiles (Android & iOS)

Nous utilisons **Capacitor** pour transformer l'application Web Next.js ultra-performante en applications natives Android et iOS.

### 1. Préparer le code Web
La première étape consiste à compiler le code web en fichiers statiques qui seront lus par l'application mobile :
```bash
cd apps/web
CAPACITOR_BUILD=1 npm run build
```

### 2. Lancer l'Application Android
Assurez-vous d'avoir installé Android Studio.
```bash
npx cap sync android
npx cap open android
```
Cela va ouvrir Android Studio.
1. Attendez que Gradle finisse de synchroniser (barre de progression en bas à droite).
2. Cliquez sur le bouton "Play" (Run) en haut pour lancer l'application sur un émulateur ou sur votre téléphone Android branché en USB.
3. Pour générer l'APK final : Allez dans **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

### 3. Lancer l'Application iOS
Assurez-vous d'avoir un Mac avec Xcode installé.
```bash
npx cap sync ios
npx cap open ios
```
Cela va ouvrir Xcode.
1. Sélectionnez le simulateur ou votre iPhone branché dans la barre supérieure.
2. Cliquez sur le bouton "Play" (Run) pour compiler et lancer l'application.
3. Pour publier sur l'App Store, utilisez l'option **Product > Archive**.

---

## Déploiement en Production

### Hébergement Web
Le projet web est actuellement configuré pour être déployé automatiquement sur **GitHub Pages** via les GitHub Actions à chaque `push` sur la branche `master`.

### Hébergement Base de données
Créez un projet sur la plateforme en ligne [Supabase](https://supabase.com/) et connectez-le à ce dépôt GitHub. Exécutez les migrations sur le serveur de production.

### Hébergement Mobile (App Store & Play Store)
Une fois les fichiers APK (Android) et IPA (iOS) compilés depuis Android Studio et Xcode, vous pourrez les publier respectivement sur la [Google Play Console](https://play.google.com/console) et [App Store Connect](https://appstoreconnect.apple.com/).
