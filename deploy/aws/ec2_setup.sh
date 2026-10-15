#!/usr/bin/env bash
# ============================================================
# AWS EC2 Automated Provisioning & Deployment Script
# Mystic Insights - Spiritual Intelligence Platform
# OS Target: Ubuntu 22.04 / 24.04 LTS
# ============================================================

set -e

echo "🌟 [1/6] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw certbot

echo "🐳 [2/6] Installing Docker Engine & Compose..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Grant current user docker execution permissions
sudo usermod -aG docker $USER

echo "🛡️ [3/6] Configuring Security Firewall (UFW)..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (SSL Challenges / Redirect)
sudo ufw allow 443/tcp   # HTTPS Production
sudo ufw --force enable

echo "📂 [4/6] Setting up Application Directory..."
INSTALL_DIR="/opt/mystic-portal"
sudo mkdir -p $INSTALL_DIR
sudo chown -R $USER:$USER $INSTALL_DIR

echo "⚙️ [5/6] Systemd Service Configuration (Auto-heal on VM restart)..."
cat << 'EOF' | sudo tee /etc/systemd/system/mystic-portal.service
[Unit]
Description=Mystic Insights Docker Compose Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/mystic-portal
ExecStart=/usr/bin/docker compose -f deploy/aws/docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f deploy/aws/docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable mystic-portal.service

echo "🚀 [6/6] Setup completed successfully!"
echo "Next Steps:"
echo "1. Clone your repo into $INSTALL_DIR"
echo "2. Copy your production .env into $INSTALL_DIR"
echo "3. Run: cd $INSTALL_DIR && docker compose -f deploy/aws/docker-compose.prod.yml up --build -d"
