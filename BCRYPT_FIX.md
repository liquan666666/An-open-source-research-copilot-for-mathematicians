# bcrypt Compatibility Fix

## Problem
The application was experiencing bcrypt compatibility issues:
- `AttributeError: module 'bcrypt' has no attribute '__about__'`
- `ValueError: password cannot be longer than 72 bytes`

This occurred because `passlib` library is incompatible with newer versions of `bcrypt` (4.0.0+).

## Solution
Fixed by implementing a complete user authentication system with proper bcrypt version pinning:

### 1. Updated Dependencies (Dockerfile)
- Pinned `bcrypt==4.0.1` for compatibility
- Pinned `passlib[bcrypt]==1.7.4` for compatibility
- Added `python-jose[cryptography]` for future JWT support
- Added `python-multipart` for form data support

### 2. Created User Model
Added `User` table in `server/db/models.py` with:
- Email (unique, indexed)
- Username (unique, indexed)
- Hashed password
- Active status
- Created timestamp

### 3. Created Password Hashing Module
Implemented `server/auth/password.py` with:
- `hash_password()`: Safely hashes passwords with bcrypt 72-byte limit handling
- `verify_password()`: Verifies passwords against hashed versions
- Automatic password truncation for passwords >72 bytes

### 4. Created Authentication Endpoints
Added `server/routes/auth.py` with:
- `POST /api/auth/register`: User registration
- `POST /api/auth/login`: User login

## Testing the Fix

### 1. Rebuild Docker Containers
```bash
cd ~/math-copilot
docker-compose down -v
docker-compose up --build
```

### 2. Test User Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "securepassword123"
  }'
```

Expected response:
```json
{
  "id": 1,
  "email": "test@example.com",
  "username": "testuser",
  "is_active": true
}
```

### 3. Test User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepassword123"
  }'
```

Expected response:
```json
{
  "id": 1,
  "email": "test@example.com",
  "username": "testuser",
  "is_active": true
}
```

### 4. Test Long Password (>72 bytes)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "longpass@example.com",
    "username": "longpassuser",
    "password": "ThisIsAVeryLongPasswordThatExceedsSeventyTwoBytesInLengthAndShouldBeHandledProperly123456789"
  }'
```

Should succeed without errors (password automatically truncated to 72 bytes).

## Key Features
- **bcrypt 72-byte limit handling**: Passwords are automatically truncated to prevent `ValueError`
- **Version pinning**: Ensures compatibility between `passlib` and `bcrypt`
- **Duplicate prevention**: Checks for existing email/username before registration
- **Error handling**: Clear error messages for invalid credentials
- **Database integration**: Seamlessly integrates with existing SQLAlchemy models

## Files Modified
- `apps/api/Dockerfile`: Added bcrypt and passlib dependencies
- `apps/api/server/db/models.py`: Added User model
- `apps/api/server/main.py`: Registered auth router

## Files Created
- `apps/api/server/auth/__init__.py`: Auth module init
- `apps/api/server/auth/password.py`: Password hashing utilities
- `apps/api/server/routes/auth.py`: Authentication endpoints

## API Documentation
Once the server is running, visit:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

Look for the "auth" tag to see all authentication endpoints.
