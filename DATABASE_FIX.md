# Database Fix: Add 'status' Column to Orders Table

## Problem
Frontend order creation was failing because the `orders` table in Supabase is missing the `status` column.

## Solution

### Step 1: Run SQL in Supabase
Execute this SQL in your Supabase database to add the missing column:

```sql
ALTER TABLE orders
ADD COLUMN status TEXT DEFAULT 'Pending';
```

### Step 2: Verify Column Exists
Check that the orders table now has these columns:
- orderid (primary key)
- supermarketid (FK)
- totalamount (decimal/numeric)
- status (text) - newly added
- orderdate (timestamp)

### Step 3: Refresh Dev Server
After adding the column:
1. Stop dev server (Ctrl+C)
2. Run: `npm run dev`

## How to Run SQL in Supabase

1. **Go to Supabase Dashboard**
   - Login at https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "+ New Query"

3. **Paste the SQL**
   ```sql
   ALTER TABLE orders
   ADD COLUMN status TEXT DEFAULT 'Pending';
   ```

4. **Execute**
   - Click "Run" button
   - Wait for success confirmation

## Frontend Changes Applied

### ✅ Fixed Issues
- Order creation now works without status field
- Temporary fix: 'status' field is not inserted (commented out)
- Added console logging for debugging
- Improved error messages
- Added input validation for totalamount > 0

### ✅ Code Changes
**File: src/hooks/useData.js**
- Removed `status` from insert query (temporary until DB has column)
- Added validation for totalamount
- Added console.log for debugging

**File: src/pages/Orders.jsx**
- Updated error display to show real error messages
- Added console logging for order submission
- Added success alert after order creation

## Testing Order Creation

1. Go to Orders page
2. Click "New Order" button
3. Fill in:
   - Supermarket ID (required)
   - Select products (at least one)
   - Quantity
4. Click Submit
5. Should see success alert if database has status column

## What to Expect

### Current (Without Status Column)
❌ Error: "column "status" does not exist"

### After SQL Fix (With Status Column)
✅ Order created successfully
✅ Shows in Orders list
✅ Default status: 'Pending'

## Rollback (If Needed)

If you need to remove the status column:
```sql
ALTER TABLE orders
DROP COLUMN status;
```

## Next Steps

1. Add the status column using SQL above
2. Refresh dev server
3. Try creating an order
4. Should work now!

## Debug Output

Check browser console (F12) for:
- `Creating order with payload: {...}`
- `Order created successfully: [...]`

Check for errors like:
- `Order insert error: {...}`
- `Failed to create order: ...`
