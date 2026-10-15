#!/usr/bin/env bash
# ============================================================
# Microsoft Azure Automated Cloud Provisioning Script
# Mystic Insights - Spiritual Intelligence Platform
# Architecture: Azure Container Apps + Azure DB for PostgreSQL
# ============================================================

set -e

# Configuration Variables
RESOURCE_GROUP="rg-mystic-prod-eastus"
LOCATION="eastus"
ACR_NAME="acrmystic$RANDOM"
ENV_NAME="env-mystic-prod"
DB_SERVER_NAME="psql-mystic-$RANDOM"
DB_ADMIN_USER="mysticadmin"
DB_ADMIN_PASS="CelestialPass2026!"
DB_NAME="mystic_portal"

echo "☁️ [1/6] Creating Azure Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "📦 [2/6] Creating Azure Container Registry (ACR)..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv)

echo "🐘 [3/6] Provisioning Azure Database for PostgreSQL Flexible Server..."
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --location $LOCATION \
  --admin-user $DB_ADMIN_USER \
  --admin-password $DB_ADMIN_PASS \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15 \
  --database-name $DB_NAME \
  --yes

# Allow Azure internal services firewall access to PostgreSQL
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER_NAME \
  --rule-name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

echo "🐳 [4/6] Building & Pushing Images to ACR..."
az acr build --registry $ACR_NAME --image mystic-backend:latest ./backend
az acr build --registry $ACR_NAME --image mystic-frontend:latest ./frontend

echo "🌐 [5/6] Creating Azure Container Apps Environment..."
az containerapp env create \
  --name $ENV_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

DATABASE_URL="postgresql://${DB_ADMIN_USER}:${DB_ADMIN_PASS}@${DB_SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require"

echo "🚀 [6/6] Deploying Backend & Frontend Container Apps..."
# Backend API App
az containerapp create \
  --name mystic-backend-api \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image ${ACR_LOGIN_SERVER}/mystic-backend:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD \
  --target-port 8000 \
  --ingress external \
  --cpu 0.5 --memory 1.0Gi \
  --env-vars DATABASE_URL="$DATABASE_URL" REQUIRE_LOGIN_OTP="false"

BACKEND_FQDN=$(az containerapp show --name mystic-backend-api --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)

# Frontend UI App
az containerapp create \
  --name mystic-frontend-ui \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image ${ACR_LOGIN_SERVER}/mystic-frontend:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_NAME \
  --registry-password $ACR_PASSWORD \
  --target-port 80 \
  --ingress external \
  --cpu 0.25 --memory 0.5Gi

FRONTEND_FQDN=$(az containerapp show --name mystic-frontend-ui --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)

echo "============================================================"
echo "🎉 Azure Deployment Completed Successfully!"
echo "Backend URL:  https://${BACKEND_FQDN}/docs"
echo "Frontend URL: https://${FRONTEND_FQDN}"
echo "============================================================"
