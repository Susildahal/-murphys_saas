# RBAC Implementation Update Summary

## Changes Made

### 1. Updated RBAC Middleware (src/middleware/rbac.ts)

#### Key Changes:
- **Fixed Permission Check**: Now uses the `role` field (references Role model) instead of `role_type`
- **Removed Hard-coded Role Types**: Permissions are now pulled from the database Role model
- **Enhanced Permission Enum**: Added missing permissions for all modules

#### New Permissions Added:
```typescript
// Service permissions
READ_SERVICE = 'read_service'
VIEW_ASSIGNED_SERVICES = 'view_assigned_services'
ACCEPT_ASSIGNED_SERVICE = 'accept_assigned_service'

// Category permissions
CREATE_CATEGORY = 'create_category'
VIEW_CATEGORY = 'view_category'
UPDATE_CATEGORY = 'update_category'
DELETE_CATEGORY = 'delete_category'

// Payment permissions
CREATE_PAYMENT = 'create_payment'
UPDATE_PAYMENT = 'update_payment'
DELETE_PAYMENT = 'delete_payment'

// Invitation permissions
VIEW_INVITATIONS = 'view_invitations'
UPDATE_INVITATION = 'update_invitation'
DELETE_INVITATION = 'delete_invitation'
```

#### Updated Middleware Functions:

**checkPermission()** - Now works as follows:
1. Fetches user's role from database using `profile.role`
2. Gets permissions from the role's `permissions` array
3. Merges with any custom permissions assigned directly to the user
4. Checks if user has required permissions

**isAdmin()** - Enhanced to:
1. Check if user's role has admin permissions (MANAGE_ROLES, MANAGE_USERS, MANAGE_PERMISSIONS)
2. Fallback to `role_type` if no role is assigned (backward compatibility)

**isOwnerOrAdmin()** - Similar enhancement for resource ownership checks

---

### 2. Updated All Routes with RBAC Protection

#### Category Routes (src/routes/category.route.ts)
- ✅ Added authentication: `verifyFirebaseToken`
- ✅ Fixed permission names: `CREATE_CATEGORY`, `VIEW_CATEGORY`, `UPDATE_CATEGORY`, `DELETE_CATEGORY`

#### Service Routes (src/routes/service.route.ts)
- ✅ Added authentication: `verifyFirebaseToken`
- ✅ Added permissions: `CREATE_SERVICE`, `READ_SERVICE`, `UPDATE_SERVICE`, `DELETE_SERVICE`

#### Payment Routes (src/routes/payment.route.ts)
- ✅ Added authentication: `verifyFirebaseToken`
- ✅ Added permissions: `CREATE_PAYMENT`, `VIEW_PAYMENTS`, `UPDATE_PAYMENT`, `DELETE_PAYMENT`, `MANAGE_PAYMENTS`

#### Invite Routes (src/routes/invite.route.ts)
- ✅ Added authentication: `verifyFirebaseToken`
- ✅ Added permissions: `SEND_INVITATION`, `VIEW_INVITATIONS`, `UPDATE_INVITATION`, `DELETE_INVITATION`, `MANAGE_INVITATIONS`
- ✅ Kept `/invite/verify-token` as public route (no authentication required)

#### Assign Client Routes (src/routes/assignClient.routes.ts)
- ✅ Added authentication: `verifyFirebaseToken`
- ✅ Added permissions: `ASSIGN_SERVICE`, `VIEW_ASSIGNED_SERVICES`, `ACCEPT_ASSIGNED_SERVICE`
- ✅ Kept `/verify_token` as public route (no authentication required)

---

## How It Works Now

### 1. Role-Based Permissions
Users must have a `role` assigned in their profile. The role should reference a document in the Role collection with the following structure:
```javascript
{
  name: "Service Manager",
  description: "Can manage services and categories",
  permissions: [
    "create_service",
    "read_service",
    "update_service",
    "delete_service",
    "create_category",
    "view_category"
  ],
  isActive: true,
  category: "internal"
}
```

### 2. Custom Permissions
Users can also have custom permissions assigned directly in their profile:
```javascript
{
  email: "user@example.com",
  role: ObjectId("role_id"),
  permissions: ["view_payments", "create_payment"]
}
```

### 3. Permission Checking Flow
1. User makes authenticated request (Firebase token in Authorization header)
2. `verifyFirebaseToken` middleware validates the token
3. `checkPermission` middleware:
   - Fetches user profile by email
   - Loads role permissions from Role collection
   - Merges with custom user permissions
   - Checks if user has all required permissions
   - Returns 403 Forbidden if missing permissions

---

## Migration Notes

### For Existing Users:
1. **Create roles in the database** using the role seeder or admin API
2. **Assign roles to users** by updating their `profile.role` field
3. **Remove old `role_type` logic** (kept as fallback for now)

### Available Role Seeder:
Run the role seeder to create default admin and client roles:
```bash
npm run seed:roles
```

This creates:
- **Admin User Role**: Full permissions
- **Client User Role**: Limited permissions (read_profile, update_profile, view_payments)

---

## Testing

### Test with Admin User:
1. Create admin role with all permissions
2. Assign role to user profile
3. Test API endpoints - should have access to all routes

### Test with Client User:
1. Create client role with limited permissions
2. Assign role to user profile
3. Test API endpoints - should get 403 Forbidden for admin routes

### Test Custom Permissions:
1. Assign role to user
2. Add custom permissions to user's `permissions` array
3. Verify merged permissions work correctly

---

## Security Improvements

✅ **Consistent Authentication**: All routes now require authentication (except public routes)
✅ **Fine-grained Permissions**: Each action protected by specific permission
✅ **Database-driven Roles**: No hard-coded permissions in code
✅ **Flexible Permission Model**: Supports both role-based and custom permissions
✅ **Proper Error Messages**: Clear feedback when permissions are missing

---

## Next Steps

1. **Test all endpoints** with different roles
2. **Update role seeder** if needed with new permissions
3. **Document permissions** required for each API endpoint
4. **Consider removing `role_type`** once fully migrated to role-based system
