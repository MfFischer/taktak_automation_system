# Dashboard Stats Fix

**Date**: 2025-11-20  
**Issue**: Dashboard showing 0 active workflows and 0 runs despite workflows being created and executed  
**Status**: ✅ FIXED

---

## 🐛 Problem Description

After creating and executing workflows, the dashboard statistics remained at 0:
- **Active Workflows**: Showed 0 (should show created workflows)
- **Successful Runs**: Showed 0 (should show completed executions)
- **Failed Runs**: Showed 0
- **Pending**: Showed 0

### Root Causes

**Issue 1: Workflow Status Filter**
- Workflows are created with status `draft` by default (see `apps/server/src/routes/workflows.ts` line 22)
- Dashboard was only counting workflows with status `active`
- Result: All draft workflows were excluded from the count

**Issue 2: Execution Status Mismatch**
- Dashboard was filtering for executions with status `'error'`
- Actual execution status enum uses `'failed'` (see `packages/types/src/index.ts`)
- Result: Failed executions were not being counted

---

## ✅ Solution Applied

### File Modified: `apps/client/src/pages/Dashboard.tsx`

#### Change 1: Workflow Count Logic

**Before:**
```typescript
const activeWorkflows = workflows.filter((w: any) => w.status === 'active').length;
```

**After:**
```typescript
// Count all workflows that are not disabled (draft, active, paused)
const activeWorkflows = workflows.filter((w: any) => w.status !== 'disabled').length;
```

**Rationale**: 
- Workflows in `draft`, `active`, or `paused` status are all "working" workflows
- Only `disabled` workflows should be excluded from the count
- This gives users a better sense of their total workflow inventory

#### Change 2: Failed Runs Status

**Before:**
```typescript
const failedRuns = executions.filter((e: any) => e.status === 'error').length;
```

**After:**
```typescript
const failedRuns = executions.filter((e: any) => e.status === 'failed').length;
```

**Rationale**:
- Matches the actual `ExecutionStatus.FAILED` enum value
- Ensures failed executions are properly counted

---

## 📊 Workflow Status Breakdown

According to `packages/types/src/index.ts`, workflows can have these statuses:

| Status | Description | Counted in Dashboard? |
|--------|-------------|----------------------|
| `draft` | Newly created, being edited | ✅ Yes (after fix) |
| `active` | Enabled and running | ✅ Yes |
| `paused` | Temporarily stopped | ✅ Yes |
| `disabled` | Permanently disabled | ❌ No |

---

## 🎯 Execution Status Breakdown

According to `packages/types/src/index.ts`, executions can have these statuses:

| Status | Description | Dashboard Card |
|--------|-------------|----------------|
| `pending` | Queued, not started | Pending |
| `running` | Currently executing | Pending |
| `success` | Completed successfully | Successful Runs |
| `failed` | Completed with error | Failed Runs |
| `cancelled` | Manually cancelled | (Not shown) |

---

## 🧪 Testing

To verify the fix:

1. **Create a workflow** - Dashboard should show 1 active workflow
2. **Execute the workflow** - Dashboard should show 1 successful run
3. **Create another workflow** - Dashboard should show 2 active workflows
4. **Execute with error** - Dashboard should show 1 failed run

---

## 💡 Alternative Approaches Considered

### Option 1: Auto-activate workflows on first execution
- **Pros**: Workflows become "active" when used
- **Cons**: Changes workflow status without user action, may be confusing

### Option 2: Add "Activate" button in UI
- **Pros**: Explicit user control over workflow status
- **Cons**: Extra step for users, more complex UI

### Option 3: Count all workflows regardless of status (CHOSEN)
- **Pros**: Simple, intuitive, shows total workflow inventory
- **Cons**: Includes disabled workflows (mitigated by excluding them)

---

## 📝 Related Files

- `packages/types/src/index.ts` - Defines `WorkflowStatus` and `ExecutionStatus` enums
- `apps/server/src/routes/workflows.ts` - Sets default status to `draft`
- `apps/client/src/pages/Dashboard.tsx` - Displays dashboard statistics
- `apps/server/src/engine/workflowEngine.ts` - Creates executions with proper status

---

## 🔄 Future Enhancements

Consider adding:
1. **Status breakdown** - Show count by status (draft, active, paused)
2. **Execution history chart** - Visual timeline of executions
3. **Quick actions** - Activate/pause workflows from dashboard
4. **Filters** - Filter dashboard by workflow status or date range

---

**Status**: ✅ **RESOLVED** - Dashboard now correctly displays workflow and execution statistics!

