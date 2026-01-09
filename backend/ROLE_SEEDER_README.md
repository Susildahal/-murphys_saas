# Role Seeder

## Overview
This seeder creates predefined roles for the RBAC system with appropriate permissions for both client-side and internal (Murphys) operations.

## Predefined Roles

### Client-Side Roles

1. **Client Owner**
   - Full access to client account
   - Can manage other client users
   - Permissions: 11 permissions including user management, services, payments, invitations

2. **Billing Manager**
   - Manages invoices and payments only
   - Permissions: 4 permissions (read/update profile, view/manage payments)

3. **Viewer**
   - Read-only access to client account
   - Permissions: 2 permissions (read profile, view payments)

### Internal Roles (Murphys)

1. **Super Admin**
   - Full system access - everything
   - Permissions: All 15 available permissions

2. **Accounts**
   - Manages invoices, payments, and reminder rules
   - Permissions: 5 permissions (profile read, payments, invitations)

3. **Support/PM**
   - View client data, services, and tickets
   - Permissions: 6 permissions (profile read, payments, services, invitations)

4. **Sales**
   - Create service orders and quotes
   - Permissions: 5 permissions (profile read, services, payments, invitations)

## Usage

### Run the Seeder

```bash
npm run seed:roles
```

### What It Does

1. Connects to MongoDB database
2. Checks for existing roles with the same names
3. Creates new roles or updates existing ones
4. Displays a summary of created/updated roles
5. Lists all roles in the database grouped by category

### Output Example

```
🌱 Starting role seeder...
✅ Database connected
📊 Found 0 existing roles
⚠️  This will create predefined roles. Existing roles will be preserved.

✨ Created role: Client Owner
✨ Created role: Billing Manager
✨ Created role: Viewer
✨ Created role: Super Admin
✨ Created role: Accounts
✨ Created role: Support/PM
✨ Created role: Sales

✅ Role seeding completed!
📈 Summary:
   - Created: 7 roles
   - Updated: 0 roles
   - Total predefined roles: 7

📋 All Roles in Database:
================================================================================

🏷️  CLIENT ROLES:
   Client Owner - 11 permissions
   └─ Full access to client account, can manage other client users
   Billing Manager - 4 permissions
   └─ Manages invoices and payments only
   Viewer - 2 permissions
   └─ Read-only access to client account

🏷️  INTERNAL ROLES:
   Super Admin - 15 permissions
   └─ Full system access - everything
   Accounts - 5 permissions
   └─ Manages invoices, payments, and reminder rules
   Support/PM - 6 permissions
   └─ View client data, services, and tickets (Phase 2)
   Sales - 5 permissions
   └─ Create service orders and quotes (Phase 2)
```

## Safety Features

- **Non-destructive**: Preserves existing roles and only creates/updates predefined ones
- **Idempotent**: Can be run multiple times safely
- **Updates**: If a predefined role exists, it updates its permissions to match the seeder definition

## Role Categories

Roles are categorized as:
- `client`: Client-side roles
- `internal`: Internal Murphys staff roles
- `custom`: Admin-created custom roles

This helps with filtering and organization in the UI.

## Modifying Roles

To modify predefined roles:

1. Edit `src/seeders/roleSeeder.ts`
2. Update the `predefinedRoles` array
3. Run `npm run seed:roles` again

The seeder will update existing roles with new permissions.

## Database Schema

Each role contains:
```typescript
{
  name: string,           // Unique role name
  description: string,    // Role description
  permissions: string[],  // Array of permission keys
  isActive: boolean,      // Whether role is active
  category: string,       // 'client', 'internal', or 'custom'
  createdBy: string,      // Email or 'system-seeder'
  createdAt: Date,
  updatedAt: Date
}
```

## Integration with API

After seeding, roles can be assigned to users via:

```javascript
POST /api/roles/assign
{
  "userId": "user_id",
  "roleId": "role_id"  // Use the _id from seeded roles
}
```

Or retrieved via:

```javascript
GET /api/roles?category=client    // Get all client roles
GET /api/roles?category=internal  // Get all internal roles
```
