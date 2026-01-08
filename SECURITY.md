# Security Features - Aplikasi Struktur Anggaran

## Authentication & Authorization

### JWT (JSON Web Token) Authentication

Aplikasi menggunakan JWT untuk autentikasi yang aman:

✅ **Token-based authentication** - Tidak ada session di server  
✅ **Secure token storage** - Token disimpan di localStorage  
✅ **Auto token validation** - Token divalidasi pada setiap request  
✅ **Token expiration** - Token expire setelah 7 hari (configurable)  
✅ **Auto logout** - User otomatis logout jika token invalid/expired

### Implementation Details

**Backend (NestJS):**
- JWT secret key di environment variable
- Token signed dengan HS256 algorithm
- Payload includes: username, user ID, role
- Guards untuk protect routes
- Role-based access control (RBAC)

**Frontend (Next.js):**
- Token stored in localStorage
- Automatic Bearer token injection
- 401 response handler (auto logout)
- Token validation before protected routes

## Security Best Practices Implemented

### 1. Password Security
```typescript
✅ Passwords hashed with bcrypt (10 rounds)
✅ Minimum 6 characters password requirement
✅ Never stored in plain text
✅ Not returned in API responses
```

### 2. Input Validation
```typescript
✅ Class-validator for DTO validation
✅ Whitelist mode (strip unknown properties)
✅ Transform enabled for type safety
✅ Max length constraints on inputs
```

### 3. CORS Protection
```typescript
✅ Origin whitelist (localhost:3000 in dev)
✅ Credentials enabled for cookies
✅ Configurable for production
```

### 4. API Security
```typescript
✅ Authentication required for all protected routes
✅ Role-based authorization (Admin/Superadmin)
✅ JWT token verification on every request
✅ Activity logging for audit trail
```

### 5. MongoDB Security
```typescript
✅ Input sanitization (via mongoose)
✅ Query injection prevention
✅ Indexed fields for performance
✅ Connection string in environment variables
```

## Production Security Checklist

Before deploying to production:

### Environment Variables
- [ ] Change `JWT_SECRET` to strong random string (min 32 characters)
- [ ] Update `MONGODB_URI` to production database
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origin to production domain

### Password Policy
- [ ] Enforce stronger password requirements (8+ chars, special chars, etc.)
- [ ] Implement password change on first login
- [ ] Add password reset functionality
- [ ] Implement account lockout after failed attempts

### HTTPS/SSL
- [ ] Enable HTTPS for all connections
- [ ] Use SSL for MongoDB connection
- [ ] Set secure cookies (if using cookies)
- [ ] Implement HSTS headers

### Additional Security
- [ ] Implement rate limiting
- [ ] Add request throttling
- [ ] Enable helmet.js for security headers
- [ ] Implement CSRF protection
- [ ] Add IP whitelisting if needed
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated

## JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "username": "superadmin",
    "sub": "user_id_here",
    "role": "superadmin",
    "iat": 1234567890,
    "exp": 1234567890
  }
}
```

## API Authentication Flow

```
1. User login with username/password
   ↓
2. Backend validates credentials
   ↓
3. Backend generates JWT token
   ↓
4. Frontend stores token in localStorage
   ↓
5. Frontend sends token in Authorization header
   ↓
6. Backend validates token on each request
   ↓
7. If valid: process request
   If invalid: return 401, frontend auto logout
```

## Security Notes

⚠️ **Important:**
- JWT tokens in localStorage are vulnerable to XSS attacks
- Always validate and sanitize user inputs
- Never expose sensitive data in JWT payload
- Implement proper logging for security events
- Regular backup of database
- Monitor for suspicious activities

✅ **Current Protection:**
- Input validation prevents XSS
- CORS prevents CSRF
- JWT prevents session hijacking
- Bcrypt prevents rainbow table attacks
- Guards prevent unauthorized access

## Reporting Security Issues

If you discover a security vulnerability, please report it to:
- Email: security@your-domain.com
- Or create a private issue in the repository

**Do not** disclose security issues publicly until they are resolved.
