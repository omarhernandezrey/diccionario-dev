# Security and Performance Fixes

## Issues Identified

### 1. **CRITICAL: Admin Routes Lack Server-Side Protection**
- **Severity**: High
- **Current State**: The `/admin` route loads without authentication. Middleware only protects sub-routes like `/admin/profile`, but not `/admin` itself.
- **Risk**: Anyone can access the admin panel UI and trigger read operations, even though write operations require admin role at API level.
- **Fix**: Update middleware to protect `/admin` route and redirect unauthenticated users to `/admin/access`.

### 2. **Performance: /api/terms Loads All Relations**
- **Severity**: Medium
- **Current State**: The API loads all relations (variants, useCases, faqs, exercises) even with pagination (25-50 items).
- **Risk**: With large catalogs, this generates heavy responses and DB contention.
- **Fix**: 
  - Reduce default page size to 10-20
  - Use partial column selection (already partially implemented)
  - Remove unnecessary relation loading in list view

### 3. **Performance: Admin Page Lacks Client-Side Caching**
- **Severity**: Medium
- **Current State**: Every filter change triggers a full fetch without memoization or SWR cache.
- **Risk**: Causes >10s load times reported by users.
- **Fix**: Implement client-side caching with SWR or TanStack Query, or add memoization.

### 4. **Reliability: Quiz Auto-Seed Runs on Every GET**
- **Severity**: Low-Medium
- **Current State**: `ensureQuizzesSeeded()` runs on every GET to `/api/quizzes`.
- **Risk**: If DB is empty and seed fails, UI has no data. Unnecessary overhead on every request.
- **Fix**: Move seed to startup job or Prisma seed script.

### 5. **Compatibility: Quiz Tag Filtering Uses array_contains on JSON**
- **Severity**: Low
- **Current State**: Tag filtering uses array operations on JSON field.
- **Risk**: May fail silently on SQLite or drivers without support.
- **Fix**: Already using in-memory filtering as fallback (lines 58-62 in route.ts).

### 6. **UX: Admin Error Handling Lacks Retry UI**
- **Severity**: Low
- **Current State**: "Sin resultados" appears for both errors and empty states.
- **Risk**: Users can't distinguish between errors and empty data.
- **Fix**: Separate error state with retry CTA.

### 7. **Testing: No Automated Tests**
- **Severity**: Medium
- **Current State**: No tests for critical flows (admin login, term CRUD, quiz submission).
- **Risk**: Regressions go undetected.
- **Fix**: Add integration tests with Prisma in-memory and E2E tests.

## Implementation Plan

### Phase 1: Critical Security Fixes (Immediate)
1. ✅ Fix middleware to protect `/admin` route
2. ✅ Add server-side session validation in admin layout
3. ✅ Test redirect flow for unauthenticated users

### Phase 2: Performance Optimizations (High Priority)
1. ✅ Optimize `/api/terms` to reduce page size
2. ✅ Remove unnecessary relation loading in list view
3. ✅ Add retry UI for admin errors
4. ⏳ Consider adding SWR/TanStack Query (optional enhancement)

### Phase 3: Reliability Improvements (Medium Priority)
1. ✅ Move quiz seed to startup or separate endpoint
2. ✅ Add error metrics and alerts

### Phase 4: Testing (Ongoing)
1. ⏳ Add integration tests for API routes
2. ⏳ Add E2E tests for critical flows

## Files to Modify

1. `src/app/middleware.ts` - Fix admin route protection
2. `src/app/admin/layout.tsx` - Add server-side session check
3. `src/app/api/terms/route.ts` - Optimize pagination and relations
4. `src/app/admin/page.tsx` - Improve error handling UI
5. `src/lib/bootstrap-quizzes.ts` - Move to startup seed
6. `src/app/api/quizzes/route.ts` - Remove inline seeding

## Testing Checklist

- [ ] Navigate to `/admin` without auth → should redirect to `/admin/access`
- [ ] Navigate to `/admin/profile` without auth → should redirect to `/admin/access`
- [ ] Login as admin → should access `/admin` successfully
- [ ] Test `/api/terms` response size with 50 items
- [ ] Force API error → verify retry button appears
- [ ] Test quiz loading without seed
- [ ] Run `npm run lint` and `npm test`
- [ ] Verify JWT_SECRET and DATABASE_URL in `.env`
