# Production Readiness Checklist - GMB AI Manager

Use this checklist to verify that all components are production-ready before deployment.

---

## Code Quality & Security

### Frontend
- [ ] `npm run lint` passes without errors
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] `npm run build` completes successfully
- [ ] No console.log statements in production code
- [ ] Environment variables properly scoped with `NEXT_PUBLIC_` prefix
- [ ] All API calls use environment variables for URLs
- [ ] TypeScript strict mode enabled and no `any` types
- [ ] All dependencies up to date

### Backend
- [ ] `mvn clean verify` passes all tests
- [ ] `mvn dependency-check:check` has no critical vulnerabilities
- [ ] No hardcoded credentials in code
- [ ] All environment variables use proper Spring property injection
- [ ] Security headers configured
- [ ] CORS properly configured for production domain
- [ ] Logging configured with appropriate levels
- [ ] No DEBUG endpoints exposed in production

---

## Configuration & Secrets

### Environment Variables
- [ ] `.env.production.template` created and documented
- [ ] All required variables listed and documented
- [ ] JWT_SECRET is cryptographically secure (32+ characters)
- [ ] ANTHROPIC_API_KEY from valid Anthropic account
- [ ] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are production OAuth credentials
- [ ] MONGODB_URI points to production database
- [ ] NEXT_PUBLIC_API_URL correctly set
- [ ] FRONTEND_URL correctly set
- [ ] No secrets committed to git

### Secrets Management
- [ ] All secrets stored in AWS Secrets Manager (or equivalent)
- [ ] IAM roles properly restrict access to secrets
- [ ] Secrets rotation policy defined
- [ ] Backup of secrets stored securely
- [ ] Access logs enabled for secrets

---

## Database & Persistence

### Setup
- [ ] Production database provisioned (MongoDB Atlas or AWS DocumentDB)
- [ ] Database backups configured and tested
- [ ] Backup retention policy set (minimum 30 days)
- [ ] Point-in-time recovery enabled
- [ ] Database encryption at rest enabled
- [ ] Database encryption in transit (TLS) enabled

### Migrations & Schema
- [ ] All database migrations tested on staging
- [ ] Schema changes backward compatible
- [ ] Indexes created for queries
- [ ] Foreign keys properly configured

### Monitoring
- [ ] Database performance monitored
- [ ] Slow query logs enabled
- [ ] Connection pool configured appropriately
- [ ] Disk usage monitoring set up

---

## Infrastructure & Deployment

### Docker Images
- [ ] Dockerfile uses multi-stage builds
- [ ] Images are optimized (minimal size)
- [ ] Non-root user runs containers
- [ ] Health checks defined
- [ ] Images built from scratch or minimal base images
- [ ] Images pushed to private ECR repository

### AWS ECS / Fargate
- [ ] ECS cluster created
- [ ] Task definitions created for backend and frontend
- [ ] Services created with desired count ≥ 2 (for redundancy)
- [ ] Auto-scaling policies configured
- [ ] CloudWatch Container Insights enabled
- [ ] Launch type set to FARGATE
- [ ] Network mode set to awsvpc
- [ ] IAM roles properly configured

### Load Balancing
- [ ] Application Load Balancer created
- [ ] Target groups configured for both services
- [ ] Health check paths correctly configured
- [ ] Path-based routing rules configured (e.g., /api → backend)
- [ ] Stickiness configuration reviewed
- [ ] Deregistration delay configured appropriately

---

## SSL/TLS & HTTPS

### Certificates
- [ ] SSL certificate obtained (ACM recommended)
- [ ] Certificate covers all required domains
- [ ] Certificate auto-renewal configured
- [ ] Certificate validity checked (not expiring soon)

### ALB Configuration
- [ ] HTTPS listener configured on port 443
- [ ] HTTP listener redirects to HTTPS
- [ ] SSL policy set to recommended version
- [ ] Certificate selected in ALB listener

### Application Configuration
- [ ] HSTS header enabled in middleware
- [ ] Secure cookies configured (HTTPOnly, Secure, SameSite)
- [ ] Mixed content warnings resolved

---

## Security Hardening

### Network Security
- [ ] Security groups configured with least privilege
- [ ] ALB allows public traffic on port 443 only
- [ ] ECS tasks only accept traffic from ALB
- [ ] Database only accepts traffic from ECS backend security group
- [ ] VPC configured with public/private subnets
- [ ] NAT Gateway configured for private subnet egress
- [ ] VPC Flow Logs enabled

### Application Security
- [ ] CORS configured for production domain only
- [ ] JWT secrets are secure and rotated periodically
- [ ] Rate limiting configured
- [ ] SQL injection protection verified (no manual SQL queries)
- [ ] XSS protection headers enabled
- [ ] CSRF protection enabled
- [ ] Content-Security-Policy header configured
- [ ] X-Frame-Options header set to SAMEORIGIN

### WAF (Web Application Firewall)
- [ ] AWS WAF attached to ALB
- [ ] Common rule sets enabled
- [ ] Rate limiting rules configured
- [ ] GeoIP blocking configured if applicable
- [ ] IP reputation lists enabled

---

## Monitoring & Logging

### CloudWatch
- [ ] CloudWatch Log Groups created for:
  - [ ] Backend ECS tasks
  - [ ] Frontend ECS tasks
  - [ ] ALB access logs
  - [ ] WAF logs
- [ ] Log retention policies set (e.g., 30-90 days)
- [ ] Alarms configured for:
  - [ ] High CPU utilization
  - [ ] High memory usage
  - [ ] Unhealthy targets
  - [ ] High error rate
  - [ ] Slow response times
  - [ ] Database connection issues

### Application Metrics
- [ ] Spring Actuator endpoints exposed (health, metrics)
- [ ] Prometheus metrics enabled
- [ ] Custom application metrics tracked
- [ ] Request latency monitored
- [ ] Error rate monitored
- [ ] API rate limits tracked

### Error Tracking
- [ ] Error tracking service configured (e.g., Sentry)
- [ ] Error notifications sent to team
- [ ] Stack traces captured for debugging
- [ ] Error dashboard accessible to team

### Log Aggregation
- [ ] Logs structured in JSON format
- [ ] Log levels appropriate for production
- [ ] Sensitive data not logged
- [ ] Log analysis queries defined
- [ ] Log archives configured

---

## Performance Optimization

### Frontend
- [ ] Static assets cached with long TTL
- [ ] Images optimized and lazy loaded
- [ ] Code splitting configured
- [ ] Bundle size analyzed and optimized
- [ ] CSS critical path optimized
- [ ] JavaScript minified and tree-shaken
- [ ] CDN configured for static assets
- [ ] Compression enabled (gzip/brotli)

### Backend
- [ ] Database connection pooling configured
- [ ] Query performance optimized
- [ ] N+1 queries eliminated
- [ ] Caching strategy implemented
- [ ] API response sizes minimized
- [ ] Compression enabled for responses

### Infrastructure
- [ ] ECS task CPU/memory allocation appropriate
- [ ] Auto-scaling policies configured
- [ ] ALB deregistration delay optimized
- [ ] Connection draining configured

---

## Backup & Disaster Recovery

### Backups
- [ ] Automated daily database backups enabled
- [ ] Backup tested and verified restorable
- [ ] Backup encryption enabled
- [ ] Backup retention policy defined
- [ ] Off-site backup replication configured

### Disaster Recovery
- [ ] RTO (Recovery Time Objective) defined
- [ ] RPO (Recovery Point Objective) defined
- [ ] Runbook documented for common failures
- [ ] Failover procedures tested
- [ ] Multi-region setup considered (if required)

---

## Documentation

### README Files
- [ ] README.md updated with production info
- [ ] PRODUCTION_DEPLOYMENT_GUIDE.md complete and reviewed
- [ ] PRODUCTION_CHECKLIST.md (this document)
- [ ] Architecture diagram provided
- [ ] API documentation current

### Runbooks
- [ ] Deployment runbook created
- [ ] Incident response runbook created
- [ ] Scaling procedures documented
- [ ] Rollback procedures documented
- [ ] Emergency contacts listed

### Configuration
- [ ] Environment variable documentation complete
- [ ] .env.template and .env.production.template provided
- [ ] Configuration management strategy documented
- [ ] Secrets management documented

---

## Testing

### Automated Tests
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] End-to-end tests pass
- [ ] Performance tests baseline established
- [ ] Security tests passing

### Manual Testing
- [ ] Login flow tested
- [ ] Data submission tested
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Responsive design verified on mobile
- [ ] Accessibility verified (WCAG 2.1 AA)
- [ ] Browser compatibility verified

### Load Testing
- [ ] Load test conducted
- [ ] Performance baseline established
- [ ] Scaling behavior verified
- [ ] Database handles peak load

---

## Compliance & Legal

### Data Protection
- [ ] GDPR compliance verified (if applicable)
- [ ] Data retention policies implemented
- [ ] PII encryption enabled
- [ ] Privacy policy updated

### Terms of Service
- [ ] Terms of Service current
- [ ] Privacy Policy current
- [ ] Data processing agreements in place

### Audit
- [ ] Source code audit completed
- [ ] Security audit completed
- [ ] Compliance audit completed
- [ ] Approval from stakeholders obtained

---

## Team & Communication

### Notifications
- [ ] On-call schedule established
- [ ] Escalation procedures documented
- [ ] Alerts configured to notify on-call engineer
- [ ] Incident communication template created

### Knowledge Transfer
- [ ] Team trained on deployment procedures
- [ ] Team trained on monitoring and alerting
- [ ] Team trained on incident response
- [ ] Documentation reviewed by team

### Pre-Deployment
- [ ] Change log prepared for release notes
- [ ] Deployment scheduled during low-traffic window
- [ ] Stakeholders notified of deployment
- [ ] Rollback plan agreed upon
- [ ] Team available for post-deployment monitoring

---

## Final Sign-Off

### Pre-Deployment Review
- [ ] Technical lead reviewed all changes
- [ ] Security team approved configuration
- [ ] DevOps team verified infrastructure
- [ ] Product lead approved feature set

### Post-Deployment
- [ ] Service health verified
- [ ] Smoke tests passed
- [ ] Performance meets expectations
- [ ] Error rate acceptable
- [ ] Team notified of successful deployment
- [ ] Post-incident review scheduled (if any issues)

---

## Go/No-Go Decision

**Decision:** ☐ GO | ☐ NO-GO

**Reasons (if NO-GO):**
```
[List any outstanding issues or concerns]
```

**Approved by:**
- Technical Lead: __________________ Date: ________
- DevOps Lead: __________________ Date: ________
- Product Lead: __________________ Date: ________

**Deployment Date:** ___________________
**Deployed by:** ___________________
**Verified by:** ___________________

---

## Quick Links

- [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- [README.md](./README.md)
- [.env.production.template](./.env.production.template)
- AWS Console: https://console.aws.amazon.com
- GitHub: [repository-url]
- Monitoring Dashboard: [CloudWatch-URL]
- Error Tracking: [Sentry-URL]

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | DevOps | Initial checklist created |

