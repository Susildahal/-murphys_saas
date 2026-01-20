# Contract Management System

A full-featured contract messaging system integrated with Firebase Firestore, enabling seamless communication between users and administrators.

## Features

### User Features
- ✉️ Create new contract messages/requests
- 💬 Reply to admin responses
- 📊 View all contracts with pagination
- 🔍 Real-time status updates (Pending, In Progress, Resolved, Closed)
- 📱 Responsive design for mobile and desktop
- 🔄 Automatic conversation threading

### Admin Features
- 📋 View all user contracts with filtering
- 🔍 Search contracts by user email
- 📝 Respond to user contracts
- ⚙️ Update contract status
- 🎯 Filter by status (Pending, In Progress, Resolved, Closed)
- 📄 Pagination for better performance
- 👤 Track conversation history

## File Structure

```
├── admin_dashbord/
│   ├── app/admin/contract_management/page.tsx    # Admin contract page
│   ├── lib/contractService.ts                    # Firebase service functions
│   └── components/app-sidebar.tsx                # Updated navigation
│
├── user_dashbord/
│   ├── app/admin/contract_messages/page.tsx      # User contract page
│   ├── lib/contractService.ts                    # Firebase service functions
│   └── components/app-sidebar.tsx                # Updated navigation
```

## Firebase Collection Structure

### Collection: `contracts`

```typescript
{
  id: string,                    // Auto-generated document ID
  userId: string,                // Firebase Auth UID
  userEmail: string,             // User's email (for filtering)
  subject: string,               // Contract subject/title
  message: string,               // Initial message content
  status: "pending" | "in-progress" | "resolved" | "closed",
  createdAt: Timestamp,          // Creation timestamp
  updatedAt: Timestamp,          // Last update timestamp
  responses: [                   // Array of responses
    {
      message: string,           // Response content
      respondedBy: string,       // Name of responder
      respondedByEmail: string,  // Email of responder
      isAdmin: boolean,          // Is this an admin response?
      createdAt: Timestamp       // Response timestamp
    }
  ]
}
```

## API Functions

### `createContract(data)`
Create a new contract message.

**Parameters:**
- `userId` - Firebase Auth user ID
- `userEmail` - User's email address
- `subject` - Contract subject
- `message` - Initial message content

**Returns:** `Promise<string>` - Document ID

---

### `addContractResponse(contractId, response)`
Add a response to an existing contract.

**Parameters:**
- `contractId` - Contract document ID
- `response` - Object containing:
  - `message` - Response content
  - `respondedBy` - Responder's name
  - `respondedByEmail` - Responder's email
  - `isAdmin` - Boolean indicating if admin response

**Returns:** `Promise<void>`

---

### `updateContractStatus(contractId, status)`
Update the status of a contract.

**Parameters:**
- `contractId` - Contract document ID
- `status` - New status value

**Returns:** `Promise<void>`

---

### `getUserContracts(userEmail, pageSize, lastDoc)`
Get paginated contracts for a specific user.

**Parameters:**
- `userEmail` - User's email address
- `pageSize` - Number of contracts per page (default: 10)
- `lastDoc` - Last document from previous page (optional)

**Returns:** `Promise<{contracts, lastDoc, hasMore}>`

---

### `getAllContracts(pageSize, lastDoc, statusFilter)`
Get all contracts with optional filtering (Admin only).

**Parameters:**
- `pageSize` - Number of contracts per page (default: 10)
- `lastDoc` - Last document from previous page (optional)
- `statusFilter` - Optional status filter

**Returns:** `Promise<{contracts, lastDoc, hasMore}>`

---

### `searchContractsByEmail(email, pageSize)`
Search contracts by user email (Admin only).

**Parameters:**
- `email` - User's email to search
- `pageSize` - Number of results (default: 10)

**Returns:** `Promise<ContractMessage[]>`

---

### `getContractById(contractId)`
Get a single contract by ID.

**Parameters:**
- `contractId` - Contract document ID

**Returns:** `Promise<ContractMessage | null>`

## Usage

### User Dashboard

1. Navigate to "Contracts" in the sidebar
2. Click "New Contract" to create a message
3. Select a contract to view details and conversation
4. Reply to admin responses
5. Load more contracts using pagination

### Admin Dashboard

1. Navigate to "Contract Management" in the sidebar
2. View all contracts or filter by status
3. Search for specific user contracts by email
4. Select a contract to view full conversation
5. Send admin responses
6. Update contract status
7. Load more contracts using pagination

## Navigation Links

### Admin Dashboard
- **Path:** `/admin/contract_management`
- **Icon:** BookOpen
- **Label:** Contract Management

### User Dashboard
- **Path:** `/admin/contract_messages`
- **Icon:** BookOpen
- **Label:** Contracts

## Status Values

| Status | Description | Badge Color |
|--------|-------------|-------------|
| `pending` | Newly created, awaiting admin response | Secondary (Gray) |
| `in-progress` | Admin has responded, conversation ongoing | Default (Blue) |
| `resolved` | Issue resolved but not closed | Outline |
| `closed` | Contract closed, no further replies allowed | Destructive (Red) |

## Performance Optimizations

1. **Pagination:** Loads 10 contracts at a time with "Load More" functionality
2. **Firestore Queries:** Efficient queries with proper indexing
3. **Real-time Updates:** Contracts refresh after sending messages
4. **Lazy Loading:** Only loads contract details when selected
5. **Search Optimization:** Indexed by email for fast searches

## Firebase Indexes Required

Create these composite indexes in Firebase Console:

1. **Contracts by User Email:**
   - Collection: `contracts`
   - Fields: `userEmail` (Ascending), `createdAt` (Descending)

2. **Contracts by Status:**
   - Collection: `contracts`
   - Fields: `status` (Ascending), `createdAt` (Descending)

## Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contracts/{contractId} {
      // Users can read their own contracts
      allow read: if request.auth != null && 
                     resource.data.userEmail == request.auth.token.email;
      
      // Users can create contracts
      allow create: if request.auth != null && 
                       request.resource.data.userEmail == request.auth.token.email;
      
      // Users can update their own contracts (for responses)
      allow update: if request.auth != null && 
                       resource.data.userEmail == request.auth.token.email;
      
      // Admins can read and update all contracts
      allow read, update: if request.auth != null && 
                            request.auth.token.admin == true;
    }
  }
}
```

## UI Components Used

- Card
- Button
- Input
- Textarea
- Badge
- Dialog
- Select
- Separator
- Label
- Icons (Lucide React)

## Dependencies

- Firebase/Firestore
- Next.js 16.1.1
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- Lucide React icons

## Error Handling

- Toast notifications for success/error messages
- Loading states for async operations
- Proper error logging to console
- Graceful fallbacks for missing data

## Future Enhancements

- [ ] File attachments support
- [ ] Email notifications
- [ ] Contract templates
- [ ] Bulk operations for admin
- [ ] Export contract history
- [ ] Priority levels
- [ ] Assignment to specific admins
- [ ] SLA tracking
- [ ] Analytics dashboard

## Support

For issues or questions, please contact the development team or refer to the Firebase documentation.
