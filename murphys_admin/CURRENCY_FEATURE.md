# Currency Management System

## Overview
The service form now includes a dynamic currency management system that allows you to:
- Select from default currencies (USD, EUR, GBP, INR, AUD, etc.)
- Add custom currencies via a modal dialog
- Store custom currencies in Firestore for persistence
- Display currency icons/symbols with each option

## Features

### 1. Default Currencies
Located in `lib/currencies.ts`, includes 17 common currencies with their:
- **Code**: ISO currency code (e.g., USD, EUR, INR)
- **Name**: Full currency name (e.g., "US Dollar", "Indian Rupee")
- **Icon**: Currency symbol (e.g., $, €, ₹)

### 2. Currency Modal (`components/currency-modal.tsx`)
A dialog component that allows adding new currencies with:
- **Currency Code Input**: 2-5 letter code (auto-uppercase)
- **Currency Name Input**: Full name of the currency
- **Currency Symbol Input**: Icon/symbol to display (e.g., $, €, ₹, A$)
- Validation using Zod schema
- Saves to Firestore `currencies` collection

### 3. Service Form Integration
The service form (`app/page/service-form.tsx`):
- Loads default currencies on mount
- Fetches custom currencies from Firestore
- Merges both lists (avoiding duplicates)
- Shows "Add Currency" button next to currency field label
- Auto-selects newly added currency
- Displays icon + code + name for each option

### 4. Firestore Storage
Custom currencies are stored in Firestore with:
```typescript
{
  code: string,       // e.g., "AUS"
  name: string,       // e.g., "Australian Dollar"
  icon: string,       // e.g., "A$"
  createdAt: Timestamp
}
```

## Usage

### Adding a New Currency
1. Open the service form
2. Click the "Add Currency" button next to the Currency field
3. Fill in:
   - **Currency Code**: e.g., "AED" (2-5 uppercase letters)
   - **Currency Name**: e.g., "UAE Dirham"
   - **Currency Symbol**: e.g., "د.إ"
4. Click "Add Currency"
5. The new currency will be added to the list and auto-selected

### Service Form
- Select currency from dropdown
- Price input with number validation (using `z.coerce.number()`)
- Currency is stored with the service in Firestore

### Service Table Display
- Prices are formatted using `Intl.NumberFormat` with the service's currency
- Shows currency symbol and billing suffix (e.g., "$100/mo", "€50/yr")

## Technical Details

### Type Safety
```typescript
export type CurrencyItem = {
  code: string;
  name: string;
  icon?: string;
};
```

### Form Validation
- Price: Positive number with decimal support
- Currency: Required, minimum 1 character
- Code validation: Letters only, 2-5 characters

### Firestore Integration
- Collection: `currencies`
- Auto-merges with defaults
- Deduplication by currency code
- Real-time updates after adding new currency

## Files Modified
- `lib/currencies.ts` - Default currency list
- `components/currency-modal.tsx` - Currency addition modal
- `app/page/service-form.tsx` - Service form with currency integration
- `types/service.ts` - Added `pay_as_you_go` billing type
- `lib/redux/slices/serviceSlice.ts` - Currency handling in Redux

## Next Steps
- Add currency editing/deletion functionality
- Implement currency conversion rates (optional)
- Add currency search/filter in dropdown
- Server-side pagination for large currency lists
