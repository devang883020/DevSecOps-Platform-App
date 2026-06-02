# ☁️ Cloud Native DevSecOps Platform

A production-grade, end-to-end DevSecOps project deploying a three-tier **React + Node.js + MongoDB** application on **AWS EKS** using **Jenkins CI/CD**, **ArgoCD GitOps**, **Helm**, and **Prometheus/Grafana** monitoring — with security scanning baked into every stage of the pipeline.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Step 1 — AWS IAM Setup](#-step-1--aws-iam-setup)
- [Step 2 — Terraform Infrastructure](#-step-2--terraform-infrastructure)
- [Step 3 — Jenkins Setup](#-step-3--jenkins-setup)
- [Step 4 — SonarQube Setup](#-step-4--sonarqube-setup)
- [Step 5 — EKS Cluster](#-step-5--eks-cluster)
- [Step 6 — ECR Repositories](#-step-6--ecr-repositories)
- [Step 7 — Kubernetes Namespaces & Secrets](#-step-7--kubernetes-namespaces--secrets)
- [Step 8 — ArgoCD Setup](#-step-8--argocd-setup)
- [Step 9 — Jenkins Pipeline Configuration](#-step-9--jenkins-pipeline-configuration)
- [Step 10 — Deploy the Application](#-step-10--deploy-the-application)
- [Step 11 — Prometheus & Grafana Monitoring](#-step-11--prometheus--grafana-monitoring)
- [CI/CD Pipeline Flow](#-cicd-pipeline-flow)
- [Application Connection Flow](#-application-connection-flow)
- [Troubleshooting](#-troubleshooting)

---

## 📖 Project Overview

This project demonstrates a real-world DevSecOps workflow where:

- **Infrastructure** is provisioned using **Terraform** (EC2 for Jenkins, VPC, Security Groups)
- **CI pipelines** run on **Jenkins** with security scanning at every stage (SonarQube, OWASP, Trivy)
- **Docker images** are built, scanned, and pushed to **AWS ECR**
- **GitOps deployments** are handled by **ArgoCD** which watches Helm charts in this repo
- **Monitoring** is done via **Prometheus + Grafana** deployed on the EKS cluster

---

## 🏗️ Architecture

```
Developer pushes code
        │
        ▼
┌───────────────────┐
│   GitHub Repo     │  ◄── ArgoCD watches Helm charts here
│  (Single Monorepo)│
└────────┬──────────┘
         │ webhook
         ▼
┌───────────────────────────────────────────────────┐
│              Jenkins CI Pipeline (EC2)             │
│                                                   │
│  Checkout → SonarQube → Quality Gate → OWASP     │
│       → Trivy FS → Docker Build → Trivy Image    │
│       → Push to ECR → Update Helm values.yaml    │
└────────────────────┬──────────────────────────────┘
                     │ git push (image tag update)
                     ▼
┌───────────────────────────────────────────────────┐
│               ArgoCD (in EKS)                     │
│   Detects change → Renders Helm → Applies to EKS │
└────────────────────┬──────────────────────────────┘
                     │ deploy
                     ▼
┌───────────────────────────────────────────────────┐
│                  AWS EKS Cluster                  │
│                                                   │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│   │  Frontend   │  │   Backend   │  │ Database │ │
│   │   (React)   │─▶│  (Node.js)  │─▶│ (MongoDB)│ │
│   │   port 80   │  │  port 3500  │  │port 27017│ │
│   └─────────────┘  └─────────────┘  └──────────┘ │
│                                                   │
│   ┌───────────────────────────────────────────┐   │
│   │     Prometheus + Grafana (monitoring)     │   │
│   └───────────────────────────────────────────┘   │
└───────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Category | Tool |
|---|---|
| **Frontend** | React.js, Nginx |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Containerization** | Docker |
| **Container Registry** | AWS ECR |
| **Infrastructure** | Terraform |
| **Kubernetes** | AWS EKS |
| **Package Manager** | Helm |
| **CI/CD** | Jenkins |
| **GitOps** | ArgoCD |
| **Code Quality** | SonarQube |
| **Security Scanning** | Trivy, OWASP Dependency Check |
| **Monitoring** | Prometheus, Grafana |
| **Cloud** | AWS (EC2, EKS, ECR, VPC, IAM) |

---

## 📁 Project Structure

```
Cloud-Native-DevSecOps-Platform-App/
├── app/
│   ├── frontend/                    # React application
│   │   ├── src/
│   │   │   ├── App.js               # Main UI component
│   │   │   ├── Tasks.js             # Business logic (API calls)
│   │   │   ├── App.css              # Styles
│   │   │   └── services/
│   │   │       └── taskServices.js  # API service functions
│   │   ├── nginx.conf               # Nginx config with /api/ proxy
│   │   ├── Dockerfile               # Multi-stage Docker build
│   │   └── package.json
│   │
│   └── backend/                     # Node.js API
│       ├── index.js                 # Express server + health checks
│       ├── db.js                    # MongoDB connection
│       ├── models/
│       │   └── task.js              # Task model
│       ├── routes/
│       │   └── tasks.js             # CRUD routes
│       ├── Dockerfile
│       └── package.json
│
├── kubernetes/                      # Helm charts
│   ├── frontend/helm/
│   │   ├── Chart.yaml
│   │   ├── values.yaml              # Jenkins updates image.tag here
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       └── ingress.yaml
│   ├── backend/helm/
│   │   ├── Chart.yaml
│   │   ├── values.yaml              # Jenkins updates image.tag here
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       └── service.yaml
│   └── database/helm/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── pv.yaml
│           └── pvc.yaml
│
├── jenkins/
│   ├── jenkinsfile-frontend         # Frontend CI pipeline
│   └── jenkinsfile-backend          # Backend CI pipeline
│
├── argocd/
│   ├── frontend-app.yaml            # ArgoCD app for frontend
│   ├── backend-app.yaml             # ArgoCD app for backend
│   └── database-app.yaml            # ArgoCD app for database
│
└── terraform/
    ├── ec2.tf                       # Jenkins server (t2.2xlarge)
    ├── vpc.tf                       # VPC, subnets, security groups
    ├── iam-role.tf                  # IAM role for EC2
    ├── variables.tf                 # Variable declarations
    ├── variables.tfvars             # Variable values
    └── tools-install.sh             # Auto-installs all tools on EC2
```

---

## ✅ Prerequisites

Install these on your **local machine**:

```bash
# 1. AWS CLI
aws --version          # need v2+

# 2. Terraform
terraform -version     # need >= 1.0

# 3. kubectl
kubectl version --client

# 4. eksctl
eksctl version

# 5. Helm
helm version

# 6. Git
git --version
```

You also need:
- An **AWS account** with admin access
- A **GitHub account**
- An **AWS Key Pair** created in `us-east-1`

---

## 🔐 Step 1 — AWS IAM Setup

**1. Create an IAM User:**
- Go to **AWS Console → IAM → Users → Create User**
- Name: `devsecops-admin`
- Attach policy: `AdministratorAccess`
- Create **Access Key** (type: CLI)
- Save the `Access Key ID` and `Secret Access Key`

**2. Configure AWS CLI locally:**

```bash
aws configure
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region: us-east-1
# Default output format: json
```

**3. Verify:**

```bash
aws sts get-caller-identity
# Should return your Account ID and ARN
```

---

## 🏗️ Step 2 — Terraform Infrastructure

This provisions the **Jenkins EC2 server** with all tools pre-installed.

**1. Update `terraform/variables.tfvars`:**

```hcl
vpc-name      = "Jenkins-vpc"
igw-name      = "Jenkins-igw"
subnet-name   = "Jenkins-subnet"
rt-name       = "Jenkins-route-table"
sg-name       = "Jenkins-sg"
instance-name = "Jenkins-server"
key-name      = "your-key-pair-name"   # ← change this
iam-role      = "Jenkins-iam-role"
```

**2. Run Terraform:**

```bash
cd terraform

terraform init
terraform plan -var-file=variables.tfvars
terraform apply -var-file=variables.tfvars
# type 'yes' when prompted
```

**3. What gets created:**
- VPC with public subnet in `us-east-1a`
- Security Group opening ports: `22` (SSH), `8080` (Jenkins), `9000` (SonarQube), `9090` (Prometheus), `80` (HTTP)
- EC2 `t2.2xlarge` with 30GB storage
- IAM role with ECR and EKS permissions
- Auto-installs: Jenkins, Docker, SonarQube, AWS CLI, kubectl, eksctl, Terraform, Trivy, Helm

**4. Note the EC2 public IP** from the Terraform output or AWS Console.

> ⏱️ Wait 5-10 minutes after the instance starts for all tools to finish installing.

---

## 🔧 Step 3 — Jenkins Setup

**1. Access Jenkins:**

```
http://<ec2-public-ip>:8080
```

**2. Get the initial admin password:**

```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**3. Install suggested plugins** + these additional plugins:

Go to **Manage Jenkins → Plugins → Available** and install:
- `SonarQube Scanner`
- `OWASP Dependency-Check`
- `Docker Pipeline`
- `GitHub Integration`
- `Pipeline`

**4. Add Credentials** (Manage Jenkins → Credentials → Global → Add Credential):

| Credential ID | Type | Value |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | Secret text | Your AWS Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | Secret text | Your AWS Secret Access Key |
| `github-creds` | Username/Password | GitHub username + Personal Access Token |
| `sonar-token` | Secret text | SonarQube token (from Step 4) |

**5. Configure Global Tools** (Manage Jenkins → Tools):

- **JDK** → Name: `jdk` → Install from adoptium.net (Java 17)
- **NodeJS** → Name: `nodejs` → Version 16
- **SonarQube Scanner** → Name: `sonar-scanner` → Install automatically
- **OWASP Dependency-Check** → Name: `DP-Check` → Install automatically

**6. Configure SonarQube Server** (Manage Jenkins → Configure System → SonarQube servers):

- Name: `sonar-server`
- URL: `http://<ec2-public-ip>:9000`
- Token: select `sonar-token` credential

**7. Create Two Pipeline Jobs:**

For **Frontend Pipeline:**
- New Item → `frontend-pipeline` → Pipeline
- Build Triggers → ✅ GitHub hook trigger for GITScm polling
- Pipeline → Pipeline script from SCM → Git
- Repository URL: `https://github.com/<your-username>/Cloud-Native-DevSecOps-Platform-App`
- Credentials: `github-creds`
- Branch: `*/master`
- Script Path: `jenkins/jenkinsfile-frontend`

Repeat same for **Backend Pipeline** with Script Path: `jenkins/jenkinsfile-backend`

**8. Set up GitHub Webhook:**

Go to your GitHub repo → **Settings → Webhooks → Add webhook**:
- Payload URL: `http://<ec2-public-ip>:8080/github-webhook/`
- Content type: `application/json`
- Events: `Just the push event`

---

## 📊 Step 4 — SonarQube Setup

**1. Access SonarQube:**

```
http://<ec2-public-ip>:9000
```

Default credentials: `admin` / `admin` (change on first login)

**2. Generate a Token:**
- **My Account → Security → Generate Token**
- Name: `jenkins-token`
- Copy the token and add it to Jenkins credentials as `sonar-token`

**3. Add Webhook (so Jenkins Quality Gate works):**
- **Administration → Configuration → Webhooks → Create**
- Name: `jenkins`
- URL: `http://<ec2-public-ip>:8080/sonarqube-webhook/`

---

## ☸️ Step 5 — EKS Cluster

SSH into your EC2 Jenkins server and run:

**1. Configure AWS CLI on EC2:**

```bash
aws configure
# Enter your Access Key, Secret Key, region: us-east-1
```

**2. Create EKS Cluster:**

```bash
eksctl create cluster \
  --name cloud-native-cluster \
  --region us-east-1 \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```

> ⏱️ Takes 15-20 minutes. Do not close the terminal.

**3. Connect kubectl:**

```bash
aws eks update-kubeconfig \
  --region us-east-1 \
  --name cloud-native-cluster

# Verify nodes are Ready
kubectl get nodes
```

**4. Create Namespaces:**

```bash
kubectl create namespace frontend
kubectl create namespace backend
kubectl create namespace database
kubectl create namespace monitoring
```

---

## 📦 Step 6 — ECR Repositories

```bash
# Create frontend repo
aws ecr create-repository \
  --repository-name frontend-app \
  --region us-east-1

# Create backend repo
aws ecr create-repository \
  --repository-name backend-app \
  --region us-east-1
```

Note your **Account ID**:

```bash
aws sts get-caller-identity --query Account --output text
```

Update the `image.repository` in:
- `kubernetes/frontend/helm/values.yaml`
- `kubernetes/backend/helm/values.yaml`

Replace `975049914104` with your actual Account ID.

---

## 🔑 Step 7 — Kubernetes Namespaces & Secrets

**1. Create ECR Pull Secrets** (so pods can pull images from ECR):

```bash
ECR_PASSWORD=$(aws ecr get-login-password --region us-east-1)
ECR_REGISTRY="<your-account-id>.dkr.ecr.us-east-1.amazonaws.com"

# Frontend namespace
kubectl create secret docker-registry ecr-secret \
  --docker-server=${ECR_REGISTRY} \
  --docker-username=AWS \
  --docker-password=${ECR_PASSWORD} \
  -n frontend

# Backend namespace
kubectl create secret docker-registry ecr-secret \
  --docker-server=${ECR_REGISTRY} \
  --docker-username=AWS \
  --docker-password=${ECR_PASSWORD} \
  -n backend
```

**2. Create MongoDB Secrets:**

```bash
# In database namespace (MongoDB pod reads this)
kubectl create secret generic mongo-sec \
  --from-literal=username=admin \
  --from-literal=password=password123 \
  -n database

# In backend namespace (backend pod reads this)
kubectl create secret generic mongo-sec \
  --from-literal=username=admin \
  --from-literal=password=password123 \
  -n backend
```

> ⚠️ Use a strong password in production. Never commit credentials to GitHub.

---

## 🔄 Step 8 — ArgoCD Setup

**1. Install ArgoCD:**

```bash
kubectl create namespace argocd

kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be Running
kubectl get pods -n argocd -w
```

**2. Expose ArgoCD UI:**

```bash
kubectl patch svc argocd-server -n argocd \
  -p '{"spec": {"type": "LoadBalancer"}}'

# Get the external URL (wait 2-3 mins)
kubectl get svc argocd-server -n argocd
```

**3. Get Admin Password:**

```bash
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 -d && echo
```

Access: `http://<argocd-external-ip>` | Username: `admin`

**4. Apply ArgoCD Applications:**

```bash
kubectl apply -f argocd/frontend-app.yaml
kubectl apply -f argocd/backend-app.yaml
kubectl apply -f argocd/database-app.yaml

# Verify all apps are registered
kubectl get applications -n argocd
```

---

## ⚙️ Step 9 — Jenkins Pipeline Configuration

Make sure these values are correct in Jenkinsfiles before running:

**`jenkins/jenkinsfile-frontend` and `jenkins/jenkinsfile-backend`:**

```groovy
AWS_ACCOUNT_ID = "your-12-digit-account-id"   // ← update this
AWS_REGION     = "us-east-1"
```

**`kubernetes/frontend/helm/values.yaml`:**

```yaml
image:
  repository: <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend-app
```

**`kubernetes/backend/helm/values.yaml`:**

```yaml
image:
  repository: <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/backend-app
```

---

## 🚀 Step 10 — Deploy the Application

**Option A — Trigger via Git push (recommended):**

Make any change to `app/frontend/` or `app/backend/` and push to master. Jenkins will automatically:
1. Run all security scans
2. Build and push Docker image to ECR
3. Update Helm values.yaml with new image tag
4. Push changes to GitHub
5. ArgoCD detects the change and deploys to EKS

**Option B — Manual first deployment:**

```bash
# Install frontend via Helm
helm install cloud-native-frontend kubernetes/frontend/helm \
  -n frontend

# Install backend via Helm
helm install cloud-native-backend kubernetes/backend/helm \
  -n backend

# Install database via Helm
helm install cloud-native-database kubernetes/database/helm \
  -n database
```

**Check everything is running:**

```bash
kubectl get pods -n frontend
kubectl get pods -n backend
kubectl get pods -n database
```

**Get the Frontend URL:**

```bash
kubectl get svc -n frontend
# Copy the EXTERNAL-IP — open it in your browser
```

---

## 📈 Step 11 — Prometheus & Grafana Monitoring

**1. Install kube-prometheus-stack:**

```bash
helm repo add prometheus-community \
  https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.service.type=LoadBalancer \
  --set grafana.service.type=LoadBalancer \
  --set grafana.adminPassword=admin@123
```

**2. Get URLs:**

```bash
kubectl get svc -n monitoring
```

| Tool | URL | Login |
|---|---|---|
| Grafana | `http://<grafana-external-ip>` | admin / admin@123 |
| Prometheus | `http://<prometheus-external-ip>:9090` | no login |

**3. Import Grafana Dashboards:**

Go to **Dashboards → Import** and use these IDs:

| ID | Dashboard |
|---|---|
| `15661` | Kubernetes Cluster Overview |
| `6417` | Pod Resource Usage |
| `1860` | Node Exporter — EC2 Node Metrics |

**4. Verify Prometheus is scraping:**

Open Prometheus → **Status → Targets** — all targets should show `UP`.

---

## 🔁 CI/CD Pipeline Flow

```
Developer pushes code to GitHub
            │
            ▼ (webhook)
    Jenkins Pipeline starts
            │
    ┌───────┴────────┐
    │ Skip if Jenkins│ ← prevents infinite loop
    │ auto-commit    │
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │ Detect Changes │ ← only runs if app/ files changed
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │  SonarQube     │ ← static code analysis
    │  Analysis      │
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │  Quality Gate  │ ← fails pipeline if code quality poor
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │  OWASP         │ ← scans npm packages for CVEs
    │  Dependency    │
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │  Trivy FS Scan │ ← scans source code files
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │  Docker Build  │ ← builds container image
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │  Trivy Image   │ ← scans Docker image for CVEs
    │  Scan          │
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │  Push to ECR   │ ← pushes verified image to AWS ECR
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │  Update Helm   │ ← updates image tag in values.yaml
    │  values.yaml   │
    └───────┬────────┘
            │
    ┌───────┴────────┐
    │  Git Push      │ ← pushes updated Helm chart to GitHub
    └───────┬────────┘
            │
            ▼ (ArgoCD detects change)
    ArgoCD syncs → EKS deploys new pods ✅
```

---

## 🔗 Application Connection Flow

```
Browser
   │ HTTP GET http://<frontend-lb>/
   ▼
Nginx (Frontend Pod — port 80)
   │
   ├── serves React app for /
   │
   └── proxies /api/* to backend via K8s internal DNS
              │
              ▼
        cloud-native-backend.backend.svc.cluster.local:3500
              │
              ▼
        Node.js Backend (port 3500)
              │ MONGO_CONN_STR env var
              ▼
        mongodb-svc.database.svc.cluster.local:27017
              │
              ▼
        MongoDB Pod (port 27017)
              │
              ▼
        PersistentVolume (data stored on EKS node disk)
```

---

## 🛠️ Troubleshooting

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

**Frontend shows white screen:**
```bash
# Check if nginx.conf has proxy_pass
kubectl exec -it <frontend-pod> -n frontend \
  -- cat /etc/nginx/conf.d/default.conf
```

**Backend can't connect to MongoDB:**
```bash
# Check backend logs
kubectl logs -n backend $(kubectl get pod -n backend \
  -o jsonpath='{.items[0].metadata.name}')

# Verify mongo-sec secret exists
kubectl get secret mongo-sec -n backend
kubectl get secret mongo-sec -n database
```

**ECR pull fails (ImagePullBackOff):**
```bash
# Refresh ECR secret (token expires every 12 hours)
kubectl delete secret ecr-secret -n frontend
kubectl delete secret ecr-secret -n backend

ECR_PASSWORD=$(aws ecr get-login-password --region us-east-1)
ECR_REGISTRY="<account-id>.dkr.ecr.us-east-1.amazonaws.com"

kubectl create secret docker-registry ecr-secret \
  --docker-server=${ECR_REGISTRY} \
  --docker-username=AWS \
  --docker-password=${ECR_PASSWORD} \
  -n frontend

kubectl create secret docker-registry ecr-secret \
  --docker-server=${ECR_REGISTRY} \
  --docker-username=AWS \
  --docker-password=${ECR_PASSWORD} \
  -n backend
```

**ArgoCD not syncing:**
```bash
# Force sync
kubectl patch application cloud-native-frontend -n argocd \
  --type merge \
  -p '{"operation": {"initiatedBy": {"username": "admin"}, "sync": {"revision": "HEAD"}}}'

# Check sync status
kubectl get applications -n argocd
```

**Jenkins webhook not triggering:**
- Check GitHub → Settings → Webhooks → Recent Deliveries
- Verify port 8080 is open in EC2 Security Group
- Webhook URL must end with `/` → `http://<ip>:8080/github-webhook/`

---

## 🧹 Cleanup

To avoid AWS charges, delete everything when done:

```bash
# Delete EKS cluster
eksctl delete cluster --name cloud-native-cluster --region us-east-1

# Delete ECR repositories
aws ecr delete-repository --repository-name frontend-app --force
aws ecr delete-repository --repository-name backend-app --force

# Destroy Terraform infrastructure (Jenkins EC2)
cd terraform
terraform destroy -var-file=variables.tfvars
```

---

## 👥 Authors

- **Pravin Choudhar** — [@pravinchoudhar-01](https://github.com/pravinchoudhar-01)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using AWS · Kubernetes · Jenkins · ArgoCD · Helm · Terraform
</p>
