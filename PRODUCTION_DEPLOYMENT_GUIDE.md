# Production Deployment Guide - GMB AI Manager

This guide outlines the complete process for deploying the GMB AI Manager to production environments.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Building for Production](#building-for-production)
4. [Docker Container Deployment](#docker-container-deployment)
5. [AWS ECS Deployment](#aws-ecs-deployment)
6. [Database Setup](#database-setup)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Disaster Recovery](#backup--disaster-recovery)
10. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

Before deploying to production, ensure the following:

- [ ] All tests pass: `npm run test` (frontend) and `mvn test` (backend)
- [ ] No security vulnerabilities: `npm audit` and `mvn dependency-check:check`
- [ ] Environment variables configured for production
- [ ] Database backups created
- [ ] SSL/TLS certificates obtained and configured
- [ ] CDN configured for static assets
- [ ] Monitoring and alerting systems set up
- [ ] Team aware of deployment schedule
- [ ] Rollback plan documented
- [ ] Database migrations tested on staging

### Security Verification

```bash
# Frontend
npm audit
npm run lint
npm run build

# Backend
mvn clean verify
mvn dependency-check:check
mvn spotbugs:check
```

---

## Environment Configuration

### 1. Create Production Environment File

Copy the production template and configure with your credentials:

```bash
cp .env.production.template .env.production
```

**Critical variables to set:**

```
SPRING_PROFILES_ACTIVE=prod
NODE_ENV=production
GOOGLE_API_MODE=PRODUCTION

# Generate a cryptographically secure JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)

# Use production Google OAuth credentials
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-secret

# Production Anthropic API key
ANTHROPIC_API_KEY=sk-ant-your-production-key

# Production database
MONGODB_URI=mongodb://your-production-cluster/gmbai

# Production URLs
FRONTEND_URL=https://your-production-domain.com
NEXT_PUBLIC_API_URL=https://api.your-production-domain.com
```

### 2. AWS Secrets Manager Setup

Store sensitive values in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name gmb/prod/jwt-secret \
  --secret-string $(openssl rand -base64 32)

aws secretsmanager create-secret \
  --name gmb/prod/google-oauth \
  --secret-string '{
    "client_id": "your-id",
    "client_secret": "your-secret"
  }'

aws secretsmanager create-secret \
  --name gmb/prod/anthropic-api-key \
  --secret-string "sk-ant-your-key"

aws secretsmanager create-secret \
  --name gmb/prod/db-credentials \
  --secret-string '{
    "username": "dbuser",
    "password": "secure-password"
  }'
```

---

## Building for Production

### Frontend Build

```bash
cd frontend
npm install
npm run build

# Verify build succeeded
ls -la .next/
```

**Build optimization checks:**

- Tree shaking enabled
- Code splitting configured
- Images optimized
- CSS purified
- No console logs in production build

### Backend Build

```bash
cd backend
mvn clean package -P prod -DskipTests

# Verify JAR created
ls -la target/*.jar
```

**Verify:**

```bash
# Check JAR size (should be < 200MB)
du -sh target/manager-*.jar

# List included dependencies
jar tf target/manager-*.jar | grep "\.jar$" | wc -l
```

---

## Docker Container Deployment

### 1. Build Docker Images

```bash
# Build backend
docker build -t gmb-backend:latest ./backend
docker tag gmb-backend:latest $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com/gmb-backend:latest

# Build frontend
docker build -t gmb-frontend:latest ./frontend
docker tag gmb-frontend:latest $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com/gmb-frontend:latest
```

### 2. Verify Docker Images

```bash
# Test backend container
docker run --rm -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e MONGODB_URI=mongodb://mongodb:27017/gmbai \
  gmb-backend:latest

# Test frontend container
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080 \
  gmb-frontend:latest
```

### 3. Push to AWS ECR

```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com

# Push images
docker push $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com/gmb-backend:latest
docker push $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com/gmb-frontend:latest

# Tag with version
docker tag gmb-backend:latest $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com/gmb-backend:v1.0.0
docker tag gmb-frontend:latest $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com/gmb-frontend:v1.0.0
docker push $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com/gmb-backend:v1.0.0
docker push $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com/gmb-frontend:v1.0.0
```

---

## AWS ECS Deployment

### 1. Create ECS Task Definitions

Create task definitions for both services:

**Backend Task Definition:**

```json
{
  "family": "gmb-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/gmb-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "hostPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        },
        {
          "name": "FRONTEND_URL",
          "value": "https://your-domain.com"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:AWS_ACCOUNT_ID:secret:gmb/prod/jwt-secret:jwt_secret::"
        },
        {
          "name": "ANTHROPIC_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:AWS_ACCOUNT_ID:secret:gmb/prod/anthropic-api-key:api_key::"
        },
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:AWS_ACCOUNT_ID:secret:gmb/prod/mongodb-uri:uri::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/gmb-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

**Frontend Task Definition:**

```json
{
  "family": "gmb-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/gmb-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://api.your-domain.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/gmb-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### 2. Create ECS Services

```bash
# Backend service
aws ecs create-service \
  --cluster gmb-production \
  --service-name gmb-backend \
  --task-definition gmb-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration awsvpcConfiguration='{
    subnets=[subnet-xxx,subnet-yyy],
    securityGroups=[sg-zzz],
    assignPublicIp=DISABLED
  }' \
  --load-balancers 'targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8080' \
  --enable-ecs-managed-tags

# Frontend service
aws ecs create-service \
  --cluster gmb-production \
  --service-name gmb-frontend \
  --task-definition gmb-frontend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration awsvpcConfiguration='{
    subnets=[subnet-xxx,subnet-yyy],
    securityGroups=[sg-zzz],
    assignPublicIp=DISABLED
  }' \
  --load-balancers 'targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=frontend,containerPort=3000' \
  --enable-ecs-managed-tags
```

### 3. Configure Application Load Balancer (ALB)

Create routing rules:

```bash
# Register target group for backend
aws elbv2 create-target-group \
  --name gmb-backend-tg \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-xxx \
  --health-check-enabled

# Register target group for frontend
aws elbv2 create-target-group \
  --name gmb-frontend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx \
  --health-check-enabled

# Add listener rules to ALB
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --conditions Field=path-pattern,Values="/api/*" "/oauth2/*" \
  --priority 1 \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:.../gmb-backend-tg

aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --conditions Field=path-pattern,Values="/*" \
  --priority 2 \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:.../gmb-frontend-tg
```

---

## Database Setup

### 1. MongoDB Atlas Setup (Recommended for Production)

```bash
# Create project and cluster via AWS Console or MongoDB CLI
# Connection string format:
mongodb+srv://username:password@cluster.mongodb.net/gmbai?retryWrites=true&w=majority
```

### 2. Database Initialization

```bash
# Run migration scripts
mongosh "mongodb://your-connection-string" << EOF
  use gmbai
  db.createCollection("users")
  db.createCollection("businesses")
  db.createCollection("reviews")
  db.createIndex("users", { "email": 1 }, { "unique": true })
  db.createIndex("businesses", { "googleId": 1 }, { "unique": true })
EOF
```

### 3. Backup Strategy

```bash
# Schedule daily backups
aws backup create-backup-plan \
  --backup-plan '{
    "BackupPlanName": "gmb-daily-backup",
    "Rules": [{
      "RuleName": "DailyBackups",
      "TargetBackupVaultName": "gmb-vault",
      "ScheduleExpression": "cron(0 2 * * ? *)",
      "StartWindowMinutes": 60,
      "CompletionWindowMinutes": 120,
      "Lifecycle": {
        "MoveToColdStorageAfterDays": 30,
        "DeleteAfterDays": 365
      }
    }]
  }'
```

---

## Security Hardening

### 1. SSL/TLS Configuration

```bash
# Request ACM certificate
aws acm request-certificate \
  --domain-name your-domain.com \
  --subject-alternative-names "*.your-domain.com" "api.your-domain.com" \
  --validation-method DNS

# Update ALB listener to use HTTPS
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:...
```

### 2. Security Groups

```bash
# ALB security group (allow public HTTPS)
aws ec2 authorize-security-group-ingress \
  --group-id sg-alb \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# ECS security group (allow ALB only)
aws ec2 authorize-security-group-ingress \
  --group-id sg-ecs \
  --protocol tcp \
  --port 8080 \
  --source-security-group-id sg-alb

aws ec2 authorize-security-group-ingress \
  --group-id sg-ecs \
  --protocol tcp \
  --port 3000 \
  --source-security-group-id sg-alb
```

### 3. WAF Rules

```bash
# Create AWS WAF Web ACL for rate limiting and filtering
aws wafv2 create-web-acl \
  --name gmb-waf \
  --scope REGIONAL \
  --default-action Block={} \
  --rules '[
    {
      "Name": "AWSManagedRulesCommonRuleSet",
      "Priority": 0,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesCommonRuleSet"
        }
      },
      "OverrideAction": {"None": {}},
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "AWSManagedRulesCommonRuleSetMetric"
      }
    }
  ]'
```

---

## Monitoring & Logging

### 1. CloudWatch Monitoring

```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name gmb-production \
  --dashboard-body file://dashboard-config.json

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name gmb-backend-cpu-high \
  --alarm-description "Alert when backend CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=gmb-backend Name=ClusterName,Value=gmb-production

aws cloudwatch put-metric-alarm \
  --alarm-name gmb-backend-errors \
  --alarm-description "Alert on backend errors" \
  --metric-name ErrorCount \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

### 2. Log Analysis

```bash
# Query logs in CloudWatch Insights
aws logs start-query \
  --log-group-name /ecs/gmb-backend \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | stats count() by @message'
```

### 3. Error Tracking (Sentry)

```bash
# Set Sentry DSN in environment variables
SENTRY_DSN=https://key@sentry.io/project-id

# Errors automatically tracked by application
```

---

## Backup & Disaster Recovery

### 1. Database Backup Strategy

```bash
# Automated daily backups via MongoDB Atlas or AWS Backup
# Retention: 30 days operational, 1 year in cold storage

# Manual backup before major changes
mongodump --uri="mongodb://..." --out=./backups/$(date +%Y%m%d)
```

### 2. Application Code Backup

```bash
# Tag releases
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Docker image versioning (already done with ECR tags)
```

### 3. Configuration Backup

```bash
# Export current environment
aws secretsmanager list-secrets \
  --filters Key=name,Values=gmb/prod \
  --output json > config-backup.json

# Backup to S3
aws s3 cp config-backup.json s3://gmb-backups/$(date +%Y%m%d)/
```

---

## Rollback Procedures

### 1. Quick Rollback (ECS Service)

```bash
# Revert to previous task definition
aws ecs update-service \
  --cluster gmb-production \
  --service gmb-backend \
  --task-definition gmb-backend:PREVIOUS_REVISION \
  --force-new-deployment
```

### 2. Database Rollback

```bash
# Restore from backup
mongorestore --uri="mongodb://..." --archive=backup-file.archive
```

### 3. Post-Rollback Verification

```bash
# Check service health
aws ecs describe-services \
  --cluster gmb-production \
  --services gmb-backend gmb-frontend \
  --query 'services[].{Name:serviceName,Status:status,Running:runningCount,Desired:desiredCount}'

# Monitor logs for errors
aws logs tail /ecs/gmb-backend --follow
aws logs tail /ecs/gmb-frontend --follow
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Backend health
curl -I https://api.your-domain.com/actuator/health

# Frontend health
curl -I https://your-domain.com/

# Database connectivity
aws ecs execute-command \
  --cluster gmb-production \
  --task TASK_ID \
  --container backend \
  --interactive \
  --command "/bin/sh -c 'mongosh $MONGODB_URI --eval \"db.adminCommand(\'ping\')\"'"
```

### 2. Smoke Tests

```bash
# Test login flow
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test API endpoints
curl https://api.your-domain.com/api/businesses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Performance Monitoring

```bash
# Check response times
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Average,Maximum
```

---

## Support & Troubleshooting

### Common Issues

1. **Service won't start**: Check logs in CloudWatch
2. **Database connection errors**: Verify MongoDB URI and network connectivity
3. **CORS errors**: Check FRONTEND_URL configuration
4. **Out of memory**: Increase ECS task memory allocation

### Debug Commands

```bash
# SSH into container
aws ecs execute-command \
  --cluster gmb-production \
  --task TASK_ID \
  --container backend \
  --interactive \
  --command "/bin/sh"

# Check environment variables
printenv | grep -E "(MONGO|ANTHROPIC|JWT|GOOGLE)"

# View application logs
tail -f /var/log/application.log
```

---

## Runbook

### Deployment Steps (Quick Reference)

1. [ ] Merge to main branch
2. [ ] Create git tag: `git tag v1.x.x && git push origin v1.x.x`
3. [ ] Build Docker images
4. [ ] Push to ECR
5. [ ] Update ECS task definitions
6. [ ] Deploy via AWS Console or CLI
7. [ ] Monitor CloudWatch logs
8. [ ] Run smoke tests
9. [ ] Notify stakeholders

### Contact Information

- **On-Call Engineer**: [contact info]
- **Database Admin**: [contact info]
- **DevOps Team**: [contact info]
- **Emergency Escalation**: [contact info]

---

## Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Spring Boot Production](https://spring.io/guides/gs/spring-boot/)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [OWASP Security](https://owasp.org/www-project-top-ten/)
