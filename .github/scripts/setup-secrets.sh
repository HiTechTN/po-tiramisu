#!/bin/bash
# 🔐 Setup GitHub Secrets for Po_Tiramisu CI/CD
# À exécuter localement avec gh CLI installé
# ou bien ajouter les secrets manuellement via https://github.com/HiTechTN/po-tiramisu/settings/secrets/actions

set -e

echo "🔐 Configuration des secrets GitHub Actions pour Po_Tiramisu..."
echo ""

# Générer une clé secrète JWT (32 octets minimum)
read -p "Générer une nouvelle SECRET_KEY ? (o/N) " -n 1 -r
SECRET_KEY=""
if [[ $REPLY =~ ^[Oo]$ ]]; then
    SECRET_KEY=$(openssl rand -hex 32)
    echo "SECRET_KEY généré : $SECRET_KEY"
else
    read -s -p "Entrez votre SECRET_KEY (≥32 chars) : " SECRET_KEY
fi

# Autres secrets
read -s -p "Entrez POSTGRES_PASSWORD : " POSTGRES_PASSWORD
read -s -p "Entrez FLOUCI_API_KEY : " FLOUCI_API_KEY
read -s -p "Entrez FLOUCI_MERCHANT_ID : " FLOUCI_MERCHANT_ID
read -s -p "Entrez DEPLOY_HOST (serveur prod) : " DEPLOY_HOST
read -s -p "Entrez DEPLOY_USER : " DEPLOY_USER
read -s -p "Collez votre clé SSH privée (~/.ssh/id_rsa) : " DEPLOY_SSH_KEY

# Ajouter les secrets via gh CLI
gh secret set SECRET_KEY --body "$SECRET_KEY"
gh secret set POSTGRES_PASSWORD --body "$POSTGRES_PASSWORD"
gh secret set FLOUCI_API_KEY --body "$FLOUCI_API_KEY"
gh secret set FLOUCI_MERCHANT_ID --body "$FLOUCI_MERCHANT_ID"
gh secret set DEPLOY_HOST --body "$DEPLOY_HOST"
gh secret set DEPLOY_USER --body "$DEPLOY_USER"
gh secret set DEPLOY_SSH_KEY --body "$DEPLOY_SSH_KEY"

echo "✅ Secrets configurés avec succès !"