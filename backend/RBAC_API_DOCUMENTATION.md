# Role-Based Access Control (RBAC) API Documentation

## Overview

This API implements a comprehensive Role-Based Access Control (RBAC) system with Firebase authentication. The system supports two role **types** (`admin user` and `client user`) and allows admins to create custom **roles** with specific permission sets.

## Table of Contents

- [Authentication](#authentication)
- [Role Types vs Custom Roles](#role-types-vs-custom-roles)
- [Permissions](#permissions)
- [API Endpoints](#api-endpoints)
  - [Profile Management](#profile-management)
  - [Permission Management](#permission-management)
  - [Role Management](#role-management)
- [Frontend Integration Guide](#frontend-integration-guide)
- [Error Handling](#error-handling)

---

## Authentication

All protected endpoints require a Firebase authentication token in the `Authorization` header.

### Headers Required

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

### Getting Firebase Token (Frontend)

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
  // Use this token in API requests
}
```

---

## Role Types vs Custom Roles

### Role Types (Built-in)
These are the two main user types sent via invite emails:

**Admin User (`admin user`)**
- Full system access by default
- Can manage roles and permissions
- Can create/assign custom roles

**Client User (`client user`)**
- Limited access by default
- Can be assigned custom roles for additional permissions

### Predefined Roles

The system comes with predefined roles for both client-side and internal (Murphys) operations:

#### Client-Side Roles

**Client Owner**
- Full access to client account
- Can manage other client users
- Permissions: All client-related operations including user management, services, payments, invitations

**Billing Manager**
- Manages invoices and payments only
- Permissions: View/manage payments, read/update profile

**Viewer**
- Read-only access to client account
- Permissions: Read profile, view payments

#### Internal Roles (Murphys)

**Super Admin**
- Full system access - everything
- Permissions: All available permissions in the system

**Accounts**
- Manages invoices, payments, and reminder rules
- Permissions: Read profiles, view/manage payments, send invitations

**Support/PM**
- View client data, services, and tickets (Phase 2)
- Permissions: Read profiles, view payments, create/update/assign services, send invitations

**Sales**
- Create service orders and quotes (Phase 2)
- Permissions: Read profiles, create/update services, view payments, send invitations

### Custom Roles (Created by Admins)
Admins can also create additional custom roles beyond the predefined ones with any combination of permissions.

**Permission Hierarchy:**
1. **Role Type Permissions** (baseline from admin/client user type)
2. **Assigned Role Permissions** (from predefined or custom role)
3. **Individual Permissions** (additional granular permissions)

*All three are combined to determine final user permissions.*

---

## Permissions

### Available Permissions

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `create_profile` | Create new profiles | Admin |
| `read_profile` | Read profile data | Admin, Client |
| `update_profile` | Update profile information | Admin, Client |
| `delete_profile` | Delete profiles | Admin |
| `manage_users` | Manage user accounts | Admin |
| `manage_roles` | Assign/modify user roles | Admin |
| `manage_permissions` | Grant/revoke permissions | Admin |
| `create_service` | Create new services | Admin |
| `update_service` | Update services | Admin |
| `delete_service` | Delete services | Admin |
| `assign_service` | Assign services to users | Admin |
| `view_payments` | View payment information | Admin, Client |
| `manage_payments` | Manage payments | Admin |
| `send_invitation` | Send invitations | Admin |
| `manage_invitations` | Manage invitations | Admin |

---

## API Endpoints

### Base URL
```
https://your-api-domain.com/api
```

---

## Profile Management

### 1. Create Profile

**Endpoint:** `POST /profiles`

**Authentication:** Not required (public registration)

**Description:** Create a new user profile

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Smith",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "bio": "Software developer",
  "city": "New York",
  "country": "USA",
  "state": "NY",
  "dob": "1990-01-15",
  "doj": "2024-01-01",
  "gender": "male",
  "position": "Developer",
  "website": "https://johndoe.com"
}
```

**With Image Upload:**
```javascript
const formData = new FormData();
formData.append('firstName', 'John');
formData.append('lastName', 'Doe');
formData.append('email', 'john.doe@example.com');
formData.append('profile_image', imageFile); // File object

fetch('https://your-api-domain.com/api/profiles', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "data": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "profile_image": "https://cloudinary.com/...",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profile created successfully"
}
```

---

### 2. Get All Profiles

**Endpoint:** `GET /profiles`

**Authentication:** Required (Admin or user with `read_profile` permission)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term (searches firstName, lastName, email)
- `inviteStatus` (optional): Filter by invite status
- `email` (optional): Get specific user by email

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/profiles?page=1&limit=10&search=john', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

**Response:**
```json
{
  "data": [
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role_type": "client user",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

### 3. Get Profiles by Role Type

**Endpoint:** `GET /profiles/types`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role_type` (optional): Filter by role type (`admin user` or `client user`)
- `search` (optional): Search term

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/profiles/types?role_type=admin user&page=1', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response:**
```json
{
  "data": [
    {
      "_id": "user_id",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "role_type": "admin user",
      "status": "active",
      "permissions": []
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Admin profiles retrieved successfully"
}
```

---

### 4. Get Profile by ID

**Endpoint:** `GET /profiles/:id`

**Authentication:** Required (Owner or Admin)

**Request Example:**
```javascript
const token = await user.getIdToken();
const userId = '507f1f77bcf86cd799439011';

const response = await fetch(`https://your-api-domain.com/api/profiles/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response:**
```json
{
  "_id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "role_type": "client user",
  "status": "active",
  "permissions": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Get Profile by Email

**Endpoint:** `GET /profiles/email/:email`

**Authentication:** Required (Owner or Admin)

**Request Example:**
```javascript
const token = await user.getIdToken();
const email = 'john.doe@example.com';

const response = await fetch(`https://your-api-domain.com/api/profiles/email/${email}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response:**
```json
{
  "data": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role_type": "client user"
  },
  "message": "Profile retrieved successfully"
}
```

---

### 6. Update Profile

**Endpoint:** `PUT /profiles/:id`

**Authentication:** Required (Owner or Admin)

**Request Body:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe",
  "phone": "+9876543210",
  "bio": "Updated bio",
  "city": "Los Angeles",
  "role": "Senior Developer",
  "status": "active"
}
```

**With Image Upload:**
```javascript
const formData = new FormData();
formData.append('firstName', 'John Updated');
formData.append('profile_image', newImageFile);

const token = await user.getIdToken();

const response = await fetch(`https://your-api-domain.com/api/profiles/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:**
```json
{
  "data": {
    "_id": "user_id",
    "firstName": "John Updated",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+9876543210",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

---

### 7. Delete Profile

**Endpoint:** `DELETE /profiles/:id`

**Authentication:** Required (Admin with `delete_profile` permission)

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch(`https://your-api-domain.com/api/profiles/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response:**
```json
{
  "data": {
    "_id": "user_id",
    "email": "john.doe@example.com"
  },
  "message": "Profile deleted successfully"
}
```

---

### 8. Send Email

**Endpoint:** `POST /send-email`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Welcome to Our Platform",
  "body": "Hello! Welcome to our platform. We're excited to have you on board."
}
```

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/send-email', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Account Activated',
    body: 'Your account has been successfully activated!'
  })
});
```

**Response:**
```json
{
  "message": "Email sent successfully"
}
```

---

## Permission Management

### 9. Toggle User Permission (Switch)

**Endpoint:** `POST /permissions/toggle`

**Authentication:** Required (Admin only)

**Description:** Add or remove a specific permission from a user. If the user has the permission, it will be removed. If they don't have it, it will be added.

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "permission": "manage_payments"
}
```

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/permissions/toggle', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: '507f1f77bcf86cd799439011',
    permission: 'manage_payments'
  })
});

const data = await response.json();
```

**Response (Permission Added):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role_type": "client user",
    "permissions": ["manage_payments"]
  },
  "message": "Permission added successfully",
  "permissions": ["manage_payments"]
}
```

**Response (Permission Removed):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role_type": "client user",
    "permissions": []
  },
  "message": "Permission removed successfully",
  "permissions": []
}
```

---

### 10. Update User Role

**Endpoint:** `POST /permissions/role`

**Authentication:** Required (Admin only)

**Description:** Change a user's role type between `admin user` and `client user`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "role_type": "admin user"
}
```

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/permissions/role', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: '507f1f77bcf86cd799439011',
    role_type: 'admin user'
  })
});
```

**Valid Role Types:**
- `admin user`
- `client user`

**Response:**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role_type": "admin user",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "User role updated successfully"
}
```

---

### 11. Update User Status

**Endpoint:** `POST /permissions/status`

**Authentication:** Required (Admin only)

**Description:** Change a user's account status (activate, deactivate, or suspend)

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "status": "active"
}
```

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/permissions/status', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: '507f1f77bcf86cd799439011',
    status: 'suspended'
  })
});
```

**Valid Status Values:**
- `active` - User can access the system
- `inactive` - User account is disabled
- `suspended` - User account is temporarily suspended

**Response:**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "status": "active",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "User status updated successfully"
}
```

---

### 12. Get User Permissions

**Endpoint:** `GET /permissions/:userId`

**Authentication:** Required (Admin only)

**Description:** Retrieve all permissions for a specific user, including both role-based and custom permissions

**Request Example:**
```javascript
const token = await user.getIdToken();
const userId = '507f1f77bcf86cd799439011';

const response = await fetch(`https://your-api-domain.com/api/permissions/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response:**
```json
{
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role_type": "client user",
    "status": "active",
    "rolePermissions": [
      "read_profile",
      "update_profile",
      "view_payments"
    ],
    "customPermissions": [
      "manage_payments"
    ],
    "allPermissions": [
      "read_profile",
      "update_profile",
      "view_payments",
      "manage_payments"
    ]
  },
  "message": "User permissions retrieved successfully"
}
```

---

## Role Management

### 13. Create Custom Role

**Endpoint:** `POST /roles`

**Authentication:** Required (Admin only)

**Description:** Create a new custom role with specific permissions

**Request Body:**
```json
{
  "name": "Project Manager",
  "description": "Manages projects and assigns services",
  "permissions": [
    "create_service",
    "update_service",
    "assign_service",
    "view_payments"
  ]
}
```

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/roles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Project Manager',
    description: 'Manages projects and assigns services',
    permissions: ['create_service', 'update_service', 'assign_service']
  })
});
```

**Response:**
```json
{
  "data": {
    "_id": "role_id",
    "name": "Project Manager",
    "description": "Manages projects and assigns services",
    "permissions": [
      "create_service",
      "update_service",
      "assign_service"
    ],
    "isActive": true,
    "createdBy": "admin@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Role created successfully"
}
```

---

### 14. Get All Roles

**Endpoint:** `GET /roles`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name or description
- `isActive` (optional): Filter by active status (true/false)

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/roles?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response:**
```json
{
  "data": [
    {
      "_id": "role_id",
      "name": "Project Manager",
      "description": "Manages projects",
      "permissions": ["create_service", "update_service"],
      "isActive": true,
      "createdBy": "admin@example.com"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Roles retrieved successfully"
}
```

---

### 15. Get Role by ID

**Endpoint:** `GET /roles/:id`

**Authentication:** Required (Admin only)

**Request Example:**
```javascript
const token = await user.getIdToken();
const roleId = '507f1f77bcf86cd799439011';

const response = await fetch(`https://your-api-domain.com/api/roles/${roleId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response:**
```json
{
  "data": {
    "_id": "role_id",
    "name": "Project Manager",
    "description": "Manages projects and assigns services",
    "permissions": ["create_service", "update_service", "assign_service"],
    "isActive": true,
    "createdBy": "admin@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Role retrieved successfully"
}
```

---

### 16. Update Role

**Endpoint:** `PUT /roles/:id`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Senior Project Manager",
  "description": "Updated description",
  "permissions": [
    "create_service",
    "update_service",
    "delete_service",
    "assign_service"
  ],
  "isActive": true
}
```

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch(`https://your-api-domain.com/api/roles/${roleId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    permissions: ['create_service', 'update_service', 'delete_service']
  })
});
```

**Response:**
```json
{
  "data": {
    "_id": "role_id",
    "name": "Senior Project Manager",
    "permissions": ["create_service", "update_service", "delete_service"],
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Role updated successfully"
}
```

---

### 17. Delete Role

**Endpoint:** `DELETE /roles/:id`

**Authentication:** Required (Admin only)

**Description:** Delete a role. Fails if any users are assigned to this role.

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch(`https://your-api-domain.com/api/roles/${roleId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response (Success):**
```json
{
  "data": {
    "_id": "role_id",
    "name": "Project Manager"
  },
  "message": "Role deleted successfully"
}
```

**Response (Error - Users Assigned):**
```json
{
  "message": "Cannot delete role. 5 user(s) are assigned to this role."
}
```

---

### 18. Toggle Role Permission

**Endpoint:** `POST /roles/permissions/toggle`

**Authentication:** Required (Admin only)

**Description:** Add or remove a permission from a role (switch functionality)

**Request Body:**
```json
{
  "roleId": "role_id",
  "permission": "delete_service"
}
```

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/roles/permissions/toggle', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    roleId: '507f1f77bcf86cd799439011',
    permission: 'delete_service'
  })
});
```

**Response (Permission Added):**
```json
{
  "data": {
    "_id": "role_id",
    "name": "Project Manager",
    "permissions": ["create_service", "update_service", "delete_service"]
  },
  "message": "Permission added to role successfully",
  "permissions": ["create_service", "update_service", "delete_service"]
}
```

---

### 19. Assign Role to User

**Endpoint:** `POST /roles/assign`

**Authentication:** Required (Admin only)

**Description:** Assign a custom role to a user

**Request Body:**
```json
{
  "userId": "user_id",
  "roleId": "role_id"
}
```

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/roles/assign', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: '507f1f77bcf86cd799439011',
    roleId: '507f191e810c19729de860ea'
  })
});
```

**Response:**
```json
{
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "role_id",
      "role_type": "client user"
    },
    "role": {
      "_id": "role_id",
      "name": "Project Manager",
      "permissions": ["create_service", "update_service"]
    }
  },
  "message": "Role assigned to user successfully"
}
```

---

### 20. Get Users by Role

**Endpoint:** `GET /roles/:roleId/users`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch(`https://your-api-domain.com/api/roles/${roleId}/users?page=1`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response:**
```json
{
  "data": {
    "role": {
      "_id": "role_id",
      "name": "Project Manager",
      "permissions": ["create_service", "update_service"]
    },
    "users": [
      {
        "_id": "user_id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    ]
  },
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "message": "Users retrieved successfully"
}
```

---

### 21. Get Available Permissions

**Endpoint:** `GET /permissions/available`

**Authentication:** Required (Admin only)

**Description:** Get list of all available permissions that can be assigned to roles

**Request Example:**
```javascript
const token = await user.getIdToken();

const response = await fetch('https://your-api-domain.com/api/permissions/available', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Response:**
```json
{
  "data": [
    {
      "key": "create_profile",
      "label": "Create Profile",
      "category": "Profile"
    },
    {
      "key": "manage_users",
      "label": "Manage Users",
      "category": "User Management"
    },
    {
      "key": "create_service",
      "label": "Create Service",
      "category": "Service"
    }
  ],
  "message": "Available permissions retrieved successfully"
}
```

---

## Frontend Integration Guide

### Complete React/Next.js Example

#### 1. Setup Firebase Auth

```javascript
// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

#### 2. API Service Layer

```javascript
// services/api.js
import { auth } from '../lib/firebase';

const API_BASE_URL = 'https://your-api-domain.com/api';

class ApiService {
  async getAuthToken() {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    return await user.getIdToken();
  }

  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  }

  // Role Management
  async createRole(roleData) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData)
    });
  }

  async getAllRoles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/roles?${queryString}`);
  }

  async getRoleById(roleId) {
    return this.request(`/roles/${roleId}`);
  }

  async updateRole(roleId, roleData) {
    return this.request(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData)
    });
  }

  async deleteRole(roleId) {
    return this.request(`/roles/${roleId}`, {
      method: 'DELETE'
    });
  }

  async toggleRolePermission(roleId, permission) {
    return this.request('/roles/permissions/toggle', {
      method: 'POST',
      body: JSON.stringify({ roleId, permission })
    });
  }

  async assignRoleToUser(userId, roleId) {
    return this.request('/roles/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId })
    });
  }

  async getUsersByRole(roleId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/roles/${roleId}/users?${queryString}`);
  }

  async getAvailablePermissions() {
    return this.request('/permissions/available');
  }

  // Profile Management
  async getProfiles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/profiles?${queryString}`);
  }

  async updateProfile(userId, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    return this.request(`/profiles/${userId}`, {
      method: 'PUT',
      body: formData
    });
  }

  // Permission Management
  async toggleUserPermission(userId, permission) {
    return this.request('/permissions/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId, permission })
    });
  }

  async updateUserRole(userId, role_type) {
    return this.request('/permissions/role', {
      method: 'POST',
      body: JSON.stringify({ userId, role_type })
    });
  }

  async updateUserStatus(userId, status) {
    return this.request('/permissions/status', {
      method: 'POST',
      body: JSON.stringify({ userId, status })
    });
  }
}

export const apiService = new ApiService();
```

#### 3. Role Management Component

```javascript
// components/RoleManagement.jsx
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await apiService.getAvailablePermissions();
      setPermissions(response.data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleCreateRole = async (roleData) => {
    try {
      await apiService.createRole(roleData);
      alert('Role created successfully');
      loadRoles();
      setShowCreateModal(false);
    } catch (error) {
      alert('Failed to create role: ' + error.message);
    }
  };

  const handleTogglePermission = async (roleId, permission) => {
    try {
      await apiService.toggleRolePermission(roleId, permission);
      loadRoles();
    } catch (error) {
      alert('Failed to toggle permission: ' + error.message);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await apiService.deleteRole(roleId);
      alert('Role deleted successfully');
      loadRoles();
    } catch (error) {
      alert('Failed to delete role: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="role-management">
      <div className="header">
        <h2>Role Management</h2>
        <button onClick={() => setShowCreateModal(true)}>
          + Create New Role
        </button>
      </div>

      <div className="roles-grid">
        {roles.map(role => (
          <div key={role._id} className="role-card">
            <div className="role-header">
              <h3>{role.name}</h3>
              <span className={role.isActive ? 'active' : 'inactive'}>
                {role.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="description">{role.description}</p>
            
            <div className="permissions-section">
              <h4>Permissions ({role.permissions.length})</h4>
              <div className="permission-grid">
                {permissions.map(perm => {
                  const hasPermission = role.permissions.includes(perm.key);
                  return (
                    <label key={perm.key} className="permission-item">
                      <input
                        type="checkbox"
                        checked={hasPermission}
                        onChange={() => handleTogglePermission(role._id, perm.key)}
                      />
                      <span>{perm.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="role-actions">
              <button onClick={() => handleDeleteRole(role._id)}>
                Delete Role
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateRoleModal
          permissions={permissions}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRole}
        />
      )}
    </div>
  );
};

const CreateRoleModal = ({ permissions, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const handlePermissionToggle = (permissionKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...prev.permissions, permissionKey]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.permissions.length === 0) {
      alert('Please provide role name and at least one permission');
      return;
    }
    onCreate(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Create New Role</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Project Manager"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of this role"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Permissions *</label>
            <div className="permissions-checklist">
              {permissions.map(perm => (
                <label key={perm.key} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm.key)}
                    onChange={() => handlePermissionToggle(perm.key)}
                  />
                  <div>
                    <strong>{perm.label}</strong>
                    <small>{perm.category}</small>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Create Role</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleManagement;
```

#### 4. User Assignment Component

```javascript
// components/UserRoleAssignment.jsx
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const UserRoleAssignment = ({ userId }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadRoles();
    loadUserProfile();
  }, [userId]);

  const loadRoles = async () => {
    try {
      const response = await apiService.getAllRoles({ isActive: true });
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await apiService.getProfileById(userId);
      setCurrentUser(response.data || response);
      setSelectedRole(response.data?.role || response.role || '');
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    try {
      await apiService.assignRoleToUser(userId, selectedRole);
      alert('Role assigned successfully');
      loadUserProfile();
    } catch (error) {
      alert('Failed to assign role: ' + error.message);
    }
  };

  return (
    <div className="user-role-assignment">
      <h3>Assign Role to User</h3>
      
      {currentUser && (
        <div className="user-info">
          <p><strong>User:</strong> {currentUser.email}</p>
          <p><strong>Type:</strong> {currentUser.role_type}</p>
        </div>
      )}

      <div className="role-selector">
        <label>Select Custom Role:</label>
        <select 
          value={selectedRole} 
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">-- No Custom Role --</option>
          {roles.map(role => (
            <option key={role._id} value={role._id}>
              {role.name} ({role.permissions.length} permissions)
            </option>
          ))}
        </select>
        
        <button onClick={handleAssignRole}>
          Assign Role
        </button>
      </div>
    </div>
  );
};

export default UserRoleAssignment;
```

---

## Getting Started

### 1. Seed Predefined Roles

Before using the system, seed the predefined roles into the database:

```bash
npm run seed:roles
```

This will create the following roles:
- **Client-Side**: Client Owner, Billing Manager, Viewer
- **Internal**: Super Admin, Accounts, Support/PM, Sales

### 2. Assign Roles to Users

Once roles are seeded, admins can assign them to users:

```javascript
// Assign a predefined role to a user
POST /api/roles/assign
{
  "userId": "user_id",
  "roleId": "role_id"  // ID of Client Owner, Billing Manager, etc.
}
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource",
  "required": ["manage_users"],
  "userPermissions": ["read_profile", "update_profile"]
}
```

#### 404 Not Found
```json
{
  "message": "Profile not found"
}
```

#### 400 Bad Request
```json
{
  "message": "Invalid role type. Must be 'admin user' or 'client user'"
}
```

### Frontend Error Handling

```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        alert('You do not have permission to perform this action');
        break;
      case 404:
        alert('Resource not found');
        break;
      default:
        alert('An error occurred: ' + error.message);
    }
  } else {
    alert('Network error. Please check your connection.');
  }
};
```

---

## Complete Frontend Example Flow

### Admin Dashboard - Complete Implementation

```javascript
// pages/admin/users.jsx
import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import PermissionSwitch from '../../components/PermissionSwitch';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    role_type: ''
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getProfiles(filters);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleRoleFilter = (e) => {
    setFilters({ ...filters, role_type: e.target.value, page: 1 });
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    
    try {
      await apiService.updateUserRole(userId, newRole);
      alert('Role updated successfully');
      loadUsers();
    } catch (error) {
      alert('Failed to update role: ' + error.message);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`Change user status to ${newStatus}?`)) return;
    
    try {
      await apiService.updateUserStatus(userId, newStatus);
      alert('Status updated successfully');
      loadUsers();
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    }
  };

  const availablePermissions = [
    { key: 'manage_payments', label: 'Manage Payments' },
    { key: 'create_service', label: 'Create Service' },
    { key: 'delete_service', label: 'Delete Service' },
    { key: 'manage_users', label: 'Manage Users' }
  ];

  return (
    <div className="admin-user-management">
      <h1>User Management</h1>
      
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search users..."
          value={filters.search}
          onChange={handleSearch}
        />
        
        <select value={filters.role_type} onChange={handleRoleFilter}>
          <option value="">All Roles</option>
          <option value="admin user">Admin Users</option>
          <option value="client user">Client Users</option>
        </select>
      </div>

      {/* User Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Custom Permissions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role_type || 'client user'}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="role-select"
                  >
                    <option value="client user">Client User</option>
                    <option value="admin user">Admin User</option>
                  </select>
                </td>
                <td>
                  <select
                    value={user.status || 'active'}
                    onChange={(e) => handleStatusChange(user._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </td>
                <td>
                  <div className="permission-switches">
                    {availablePermissions.map(perm => (
                      <PermissionSwitch
                        key={perm.key}
                        userId={user._id}
                        permission={perm.key}
                        initialState={user.permissions?.includes(perm.key)}
                        label={perm.label}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserManagement;
```

---

## Testing the API

### Using cURL

```bash
# Get Firebase token (you'll need to get this from your frontend)
TOKEN="your-firebase-token-here"

# Get all profiles
curl -X GET "https://your-api-domain.com/api/profiles" \
  -H "Authorization: Bearer $TOKEN"

# Toggle permission
curl -X POST "https://your-api-domain.com/api/permissions/toggle" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "permission": "manage_payments"
  }'

# Update role
curl -X POST "https://your-api-domain.com/api/permissions/role" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "role_type": "admin user"
  }'
```

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Validate Firebase tokens** on every protected endpoint
3. **Check permissions** before allowing actions
4. **Log all permission changes** for audit trails
5. **Rate limit** API endpoints to prevent abuse
6. **Sanitize user input** to prevent injection attacks
7. **Keep Firebase credentials secure** - never commit to version control

---

## Support

For issues or questions, contact your development team or refer to the main project documentation.

---

**Last Updated:** January 2026
**API Version:** 1.0.0
