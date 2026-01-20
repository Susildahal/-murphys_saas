# Firebase Realtime Database Connection Test

## Quick Test Steps:

1. **Open Browser Console** (F12 → Console tab)

2. **Go to your user dashboard** at http://localhost:3000/admin/contract_messages

3. **Look for errors** in the console. Common errors:
   - `PERMISSION_DENIED` - Security rules need to be updated
   - `Cannot read property 'ref' of undefined` - Database not initialized
   - Network errors - Database URL wrong

## Fix Security Rules:

Go to Firebase Console:
1. https://console.firebase.google.com/project/murphys-client/database/murphys-client-default-rtdb/rules
2. Replace the rules with:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

3. Click "Publish"

## Verify Environment Variables Loaded:

In browser console, type:
```javascript
console.log(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL)
```

It should show: `https://murphys-client-default-rtdb.firebaseio.com`

If it shows `undefined`, restart the development server.

## Test Database Connection:

In browser console, paste:
```javascript
import { ref, set } from 'firebase/database';
import { realtimeDb } from './app/config/firebase';

// Test write
const testRef = ref(realtimeDb, 'test');
set(testRef, { timestamp: Date.now(), message: 'test' })
  .then(() => console.log('✅ Write successful'))
  .catch(err => console.error('❌ Write failed:', err));
```

## Common Issues:

### Issue 1: PERMISSION_DENIED
**Solution**: Update Firebase security rules (see above)

### Issue 2: Database URL undefined
**Solution**: 
- Check .env.local has `NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://murphys-client-default-rtdb.firebaseio.com`
- Restart dev servers: `Ctrl+C` then `npm run dev`

### Issue 3: realtimeDb is undefined
**Solution**: Check firebase.ts has:
```typescript
import { getDatabase } from "firebase/database";
export const realtimeDb = getDatabase(app);
```

### Issue 4: User not authenticated
**Solution**: Make sure you're logged in. Check console for:
```javascript
import { getAuth } from 'firebase/auth';
console.log(getAuth().currentUser); // Should show user object
```

## Manual Database Test:

1. Go to: https://console.firebase.google.com/project/murphys-client/database/murphys-client-default-rtdb/data
2. Click "+" to add data manually
3. Add:
   - Name: `test`
   - Value: `{ "message": "hello" }`
4. If this works, database is active

## Check Network Tab:

1. Open Developer Tools → Network tab
2. Filter by "firebaseio.com"
3. Try to create a conversation
4. Look for:
   - RED requests = permission denied
   - GREEN requests = working correctly
