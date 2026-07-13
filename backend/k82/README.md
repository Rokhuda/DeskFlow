# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying DeskFlow on a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.20+)
- `kubectl` command-line tool configured
- Docker images built and pushed to a registry
- Optional: Ingress controller (for production routing)

## Files Overview

- **namespace.yaml** - Kubernetes namespace for resource organization
- **secret-template.yaml** - Template for sensitive data (JWT secret, database URL)
- **configmap.yaml** - Non-sensitive configuration data
- **backend-deployment.yaml** - Backend service deployment with 2 replicas
- **backend-service.yaml** - ClusterIP service for backend (internal communication)
- **frontend-deployment.yaml** - Frontend deployment with 2 replicas
- **frontend-service.yaml** - LoadBalancer service for frontend (external access)
- **ingress.yaml** - Ingress routing rules for production (optional)

## Quick Start

### 1. Build and Push Docker Images

```bash
# Build backend image
docker build -f Dockerfile.backend -t your-registry/deskflow-backend:latest .
docker push your-registry/deskflow-backend:latest

# Build frontend image
docker build -f Dockerfile.frontend -t your-registry/deskflow-frontend:latest .
docker push your-registry/deskflow-frontend:latest
```

### 2. Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 3. Create Secrets

```bash
# Copy and edit the template with real values
cp k8s/secret-template.yaml k8s/secret.yaml
# Edit secret.yaml and add real JWT secret and database URL

# Apply the secret
kubectl apply -f k8s/secret.yaml
```

### 4. Create ConfigMap

```bash
kubectl apply -f k8s/configmap.yaml
```

### 5. Deploy Backend

```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

### 6. Deploy Frontend

```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### 7. (Optional) Deploy Ingress

```bash
kubectl apply -f k8s/ingress.yaml
```

## Verification

Check deployment status:

```bash
# List all resources
kubectl get all

# Check pod status
kubectl get pods -l app=deskflow

# Check services
kubectl get svc -l app=deskflow

# View logs
kubectl logs -l app=deskflow,tier=backend
kubectl logs -l app=deskflow,tier=frontend
```

## Accessing the Application

### Via LoadBalancer (default)

```bash
kubectl get svc deskflow-frontend
# Get the EXTERNAL-IP and access http://<EXTERNAL-IP>
```

### Via Ingress

Access via your configured domain (e.g., http://deskflow.example.com)

## Database Migration

For production, run Prisma migrations:

```bash
# Port forward to backend pod
kubectl port-forward svc/deskflow-backend 5000:5000

# In another terminal
npm run prisma:migrate
```

## Scaling

Scale deployments:

```bash
kubectl scale deployment deskflow-backend --replicas=3
kubectl scale deployment deskflow-frontend --replicas=3
```

## Cleanup

Remove all resources:

```bash
kubectl delete -f k8s/
```

## Production Considerations

1. **Database**: Use a managed database (PostgreSQL, MySQL) instead of SQLite
2. **Secrets**: Use a secrets management tool (HashiCorp Vault, AWS Secrets Manager)
3. **Image Registry**: Use a private registry with proper authentication
4. **Resource Limits**: Adjust CPU/memory limits based on your needs
5. **Health Checks**: Customize liveness/readiness probes as needed
6. **HTTPS**: Use TLS certificates with Ingress for secure communication
7. **Monitoring**: Add Prometheus/Grafana for observability
8. **Persistence**: Add PersistentVolumes for database storage if needed

## Troubleshooting

### Pods not starting

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Service not accessible

```bash
kubectl describe svc deskflow-frontend
kubectl port-forward svc/deskflow-frontend 8080:80
```

### Connection issues between services

Verify DNS resolution:

```bash
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  sh -c "nslookup deskflow-backend"
```
