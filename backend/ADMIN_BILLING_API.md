# Admin Billing API Documentation

## Overview
Admin-specific billing endpoints that provide access to billing data across all users in the system.

## Authentication
All endpoints require:
1. Firebase authentication token in the `Authorization` header
2. Admin role verification via `isAdmin` middleware

## Endpoints

### 1. Get Admin Billing History
Get billing history across all users with filtering options.

**Endpoint:** `GET /api/billing/admin/history`

**Query Parameters:**
- `status` (optional): Filter by payment status (`completed`, `failed`, `pending`, `refunded`, or `all`)
- `clientEmail` (optional): Filter by specific user/client email address
- `startDate` (optional): Filter by start date (ISO 8601 format)
- `endDate` (optional): Filter by end date (ISO 8601 format)
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of records per page

**Example Request:**
```http
GET /api/billing/admin/history?status=completed&page=1&limit=10&clientEmail=user@example.com
Authorization: Bearer <firebase-token>
```

**Example Response:**
```json
{
  "data": [
    {
      "_id": "billing_id",
      "user_email": "user@example.com",
      "user_id": "user123",
      "invoice_id": "INV-001",
      "service_name": "Premium Service",
      "amount": 99.99,
      "currency": "aud",
      "payment_status": "completed",
      "payment_method": "card",
      "stripe_payment_intent_id": "pi_xyz",
      "payment_date": "2026-01-19T10:30:00Z",
      "createdAt": "2026-01-19T10:00:00Z",
      "updatedAt": "2026-01-19T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  },
  "message": "Admin billing history retrieved successfully"
}
```

---

### 2. Get Admin Billing Stats
Get aggregated statistics for all users' billing data.

**Endpoint:** `GET /api/billing/admin/stats`

**Query Parameters:** None

**Example Request:**
```http
GET /api/billing/admin/stats
Authorization: Bearer <firebase-token>
```

**Example Response:**
```json
{
  "stats": [
    {
      "_id": "completed",
      "count": 120,
      "totalAmount": 12450.00
    },
    {
      "_id": "pending",
      "count": 15,
      "totalAmount": 1200.00
    },
    {
      "_id": "failed",
      "count": 8,
      "totalAmount": 650.00
    },
    {
      "_id": "refunded",
      "count": 3,
      "totalAmount": 300.00
    }
  ],
  "totalPaid": 12450.00,
  "message": "Admin billing stats retrieved successfully"
}
```

---

### 3. Delete Admin Billing Record
Delete a billing history record (admin only).

**Endpoint:** `DELETE /api/billing/admin/history/:id`

**URL Parameters:**
- `id` (required): Billing record ID to delete

**Example Request:**
```http
DELETE /api/billing/admin/history/65abc123def456789
Authorization: Bearer <firebase-token>
```

**Example Response:**
```json
{
  "message": "Billing record deleted successfully",
  "deletedRecord": {
    "id": "65abc123def456789",
    "user_email": "user@example.com",
    "amount": 99.99,
    "status": "failed"
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden (Not Admin)
```json
{
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "message": "Billing record not found"
}
```

### 500 Server Error
```json
{
  "message": "Server Error",
  "error": "Error details..."
}
```

---

## Related Endpoints

### Get Client List
To populate the client filter dropdown, use the existing profiles endpoint:

**Endpoint:** `GET /api/profiles?limit=1000`

This returns all user profiles that can be used as clients in the filter.

---

## Implementation Notes

1. **Admin Middleware**: All admin endpoints use the `isAdmin` middleware which checks:
   - User has an active admin role
   - User has admin permissions (MANAGE_ROLES, MANAGE_USERS, etc.)
   - User's profile `role_type` is 'admin user'

2. **Filtering**: 
   - When `clientEmail` is 'all' or not provided, data for all users is returned
   - Email filter matches the exact email address in the billing records
   - Date filters use MongoDB's date comparison operators
   - All filters can be combined

3. **Pagination**:
   - Default: 10 records per page
   - Returns total count and calculated total pages
   - Results sorted by `createdAt` descending (newest first)

4. **Stats Aggregation**:
   - Groups by `payment_status`
   - Calculates count and total amount for each status
   - Separately calculates total paid amount (completed payments only)

---

## Security Considerations

- All endpoints require valid Firebase authentication
- Admin role verification prevents unauthorized access
- User email is logged for audit purposes
- Deleted records return basic info for audit logs

---

## Testing

Use the following curl commands to test (replace `<token>` with actual Firebase token):

```bash
# Get all billing history
curl -X GET "http://localhost:5000/api/billing/admin/history" \
  -H "Authorization: Bearer <token>"

# Get stats
curl -X GET "http://localhost:5000/api/billing/admin/stats" \
  -H "Authorization: Bearer <token>"

# Delete a record
curl -X DELETE "http://localhost:5000/api/billing/admin/history/<billing_id>" \
  -H "Authorization: Bearer <token>"
```
