# API Contract: Authentication

**Base Path**: `/api/auth`
**Auth Required**: No

---

## POST /api/auth/register

Register a new user account.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "mypassword123",
  "username": "spotlover"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 201 | Account created; sets HttpOnly JWT cookie |
| 400 | Validation error (invalid email, password < 8 chars, username invalid) |
| 409 | Email or username already registered |

**201 Body**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "spotlover"
}
```

---

## POST /api/auth/login

Authenticate and receive a session token.

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Authenticated; sets HttpOnly JWT cookie |
| 401 | Invalid credentials (intentionally vague — do not reveal which field is wrong) |

**200 Body**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "spotlover"
}
```

---

## POST /api/auth/logout

Clear the session cookie.

**Auth Required**: Yes (cookie)

**Responses**

| Status | Description |
|--------|-------------|
| 204 | Cookie cleared |

---

## GET /api/auth/me

Return the current authenticated user.

**Auth Required**: Yes (cookie)

**Responses**

| Status | Description |
|--------|-------------|
| 200 | Current user object |
| 401 | Not authenticated |
