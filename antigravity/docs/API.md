# API Documentation Template

> Template cho API documentation. Sử dụng khi document REST APIs.

## Overview

[Brief description of the API]

## Base URL

```
Production: https://api.example.com/v1
Staging: https://api-staging.example.com/v1
Local: http://localhost:3000/api/v1
```

## Authentication

### Bearer Token

```bash
curl -H "Authorization: Bearer <token>" https://api.example.com/v1/resource
```

### API Key

```bash
curl -H "X-API-Key: <key>" https://api.example.com/v1/resource
```

## Endpoints

### Resource Operations

#### GET /resource

Get all resources.

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| page | query | integer | No | Page number (default: 1) |
| limit | query | integer | No | Items per page (default: 20, max: 100) |
| sort | query | string | No | Sort field (e.g., "-createdAt") |
| filter | query | string | No | Filter expression |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

#### GET /resource/:id

Get a single resource.

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string (UUID) | Yes | Resource ID |

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

**Error Response (404):**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

---

#### POST /resource

Create a new resource.

**Request Body:**

```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "tags": ["string"]
}
```

**Response (201):**

```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "tags": ["string"],
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

**Error Response (400):**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

---

#### PUT /resource/:id

Update a resource.

**Request Body:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

**Response (200):**

```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "updatedAt": "ISO8601"
  }
}
```

---

#### DELETE /resource/:id

Delete a resource.

**Response (204):** No content

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request body or parameters |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict (e.g., duplicate) |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

| Tier | Limit | Window |
|------|-------|--------|
| Free | 100 requests | 1 minute |
| Pro | 1,000 requests | 1 minute |
| Enterprise | 10,000 requests | 1 minute |

## Examples

### cURL

```bash
# Create resource
curl -X POST https://api.example.com/v1/resource \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Resource"}'

# Get all resources
curl https://api.example.com/v1/resource?limit=10 \
  -H "Authorization: Bearer <token>"
```

### JavaScript

```javascript
// Create resource
const response = await fetch('https://api.example.com/v1/resource', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'My Resource' })
});

const { data } = await response.json();
console.log(data);
```

### Python

```python
import requests

# Create resource
response = requests.post(
    'https://api.example.com/v1/resource',
    headers={'Authorization': f'Bearer {token}'},
    json={'name': 'My Resource'}
)

data = response.json()
print(data['data'])
```

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-01 | Initial release |
