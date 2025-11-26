# Phase 1 Features - Developer Guide

## 🚀 Quick Start

This guide shows you how to use the new Phase 1 features in your workflows.

---

## 1. Workflow Versioning

### Automatic Versioning
Workflows are automatically versioned when created or updated:

```typescript
// Create workflow - automatically creates version 1
const workflow = await workflowService.createWorkflow({
  name: 'My Workflow',
  nodes: [...],
  connections: [...]
});
// workflow.version === 1

// Update workflow - automatically increments version on significant changes
const updated = await workflowService.updateWorkflow(workflow._id, {
  nodes: [...newNodes]
});
// updated.version === 2
```

### List Versions
```typescript
const versions = await workflowService.listWorkflowVersions(workflowId);
// Returns array of WorkflowVersion objects
```

### Rollback to Previous Version
```typescript
const restored = await workflowService.rollbackToVersion(
  workflowId,
  versionId
);
// Automatically creates backup before rollback
```

### Prune Old Versions
```typescript
await workflowService.pruneWorkflowVersions(workflowId, 10);
// Keeps only the 10 most recent versions
```

---

## 2. Loop Node

### Basic Usage
```json
{
  "id": "loop1",
  "type": "loop",
  "name": "Process Items",
  "config": {
    "items": ["item1", "item2", "item3"]
  }
}
```

### Using Expressions
```json
{
  "id": "loop1",
  "type": "loop",
  "name": "Process Users",
  "config": {
    "items": "{{$json.users}}"
  }
}
```

### Advanced Configuration
```json
{
  "id": "loop1",
  "type": "loop",
  "name": "Batch Process",
  "config": {
    "items": "{{$json.records}}",
    "batchSize": 50,
    "maxIterations": 1000,
    "continueOnItemError": true
  }
}
```

### Loop Variables
Inside a loop, you have access to special variables:

- `$item` - Current item being processed
- `$index` - Current index (0-based)
- `$iteration` - Current iteration (1-based)
- `$length` - Total number of items
- `$isFirst` - Boolean, true if first item
- `$isLast` - Boolean, true if last item

**Example:**
```json
{
  "id": "email-node",
  "type": "send_email",
  "name": "Send Email",
  "config": {
    "to": "{{$item.email}}",
    "subject": "Item {{$iteration}} of {{$length}}",
    "body": "Processing {{$item.name}}"
  }
}
```

---

## 3. Error Handling & Retry

### Per-Node Retry Configuration
```json
{
  "id": "api-call",
  "type": "http_request",
  "name": "Call API",
  "config": {
    "url": "https://api.example.com/data",
    "method": "GET"
  },
  "executionConfig": {
    "retries": 3,
    "retryDelay": 2000,
    "timeout": 10000,
    "continueOnError": false
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `retries` | number | 0 | Number of retry attempts |
| `retryDelay` | number | 1000 | Delay between retries (ms) |
| `timeout` | number | 30000 | Execution timeout (ms) |
| `continueOnError` | boolean | false | Continue workflow on failure |
| `parallel` | boolean | false | Can execute in parallel |

### Continue on Error
```json
{
  "id": "optional-step",
  "type": "http_request",
  "name": "Optional API Call",
  "config": {
    "url": "https://optional-api.com/data"
  },
  "executionConfig": {
    "continueOnError": true
  }
}
```

---

## 4. Error Trigger Nodes

### Basic Error Handler
```json
{
  "id": "error-handler",
  "type": "error_trigger",
  "name": "Handle Errors",
  "config": {
    "notifyEmail": "admin@example.com"
  }
}
```

### Selective Error Handling
```json
{
  "id": "payment-error-handler",
  "type": "error_trigger",
  "name": "Payment Error Handler",
  "config": {
    "triggerOnNodes": ["payment-node", "refund-node"],
    "errorTypes": ["ValidationError", "PaymentError"],
    "notifyEmail": "finance@example.com",
    "notifySMS": "+1234567890"
  }
}
```

### Error Context Variables
When an error trigger executes, it has access to:

- `$error` - The error object
- `$failedNode` - The node that failed
- `$workflowId` - The workflow ID
- `$executionId` - The execution ID

---

## 5. Complete Example Workflow

```json
{
  "name": "Process Orders with Error Handling",
  "nodes": [
    {
      "id": "trigger",
      "type": "webhook",
      "name": "Order Webhook",
      "config": {
        "path": "/orders",
        "method": "POST"
      }
    },
    {
      "id": "loop",
      "type": "loop",
      "name": "Process Each Order",
      "config": {
        "items": "{{$json.orders}}",
        "batchSize": 10,
        "continueOnItemError": true
      }
    },
    {
      "id": "payment",
      "type": "http_request",
      "name": "Process Payment",
      "config": {
        "url": "https://payment-api.com/charge",
        "method": "POST",
        "body": {
          "orderId": "{{$item.id}}",
          "amount": "{{$item.total}}"
        }
      },
      "executionConfig": {
        "retries": 3,
        "retryDelay": 2000,
        "timeout": 15000,
        "continueOnError": false
      }
    },
    {
      "id": "error-handler",
      "type": "error_trigger",
      "name": "Payment Error Handler",
      "config": {
        "triggerOnNodes": ["payment"],
        "notifyEmail": "finance@company.com"
      }
    }
  ],
  "connections": [
    { "from": "trigger", "to": "loop" },
    { "from": "loop", "to": "payment" }
  ]
}
```

---

## 🧪 Testing

Run tests for new features:

```bash
# Test loop node
npm test -- loopNode.test.ts

# Test versioning
npm test -- workflowService.versioning.test.ts

# Test error handling
npm test -- workflowEngine.errorHandling.test.ts
```

---

## 📚 API Reference

### WorkflowService Methods

```typescript
// Versioning
createWorkflowVersion(workflowId: string, changeDescription?: string): Promise<WorkflowVersion>
listWorkflowVersions(workflowId: string): Promise<WorkflowVersion[]>
getWorkflowVersion(versionId: string): Promise<WorkflowVersion>
rollbackToVersion(workflowId: string, versionId: string): Promise<Workflow>
pruneWorkflowVersions(workflowId: string, keepCount: number): Promise<void>
```

---

## 🎯 Best Practices

1. **Always use retry for external API calls**
   ```json
   "executionConfig": { "retries": 3, "retryDelay": 2000 }
   ```

2. **Set appropriate timeouts**
   ```json
   "executionConfig": { "timeout": 30000 }
   ```

3. **Use continueOnError for optional steps**
   ```json
   "executionConfig": { "continueOnError": true }
   ```

4. **Add error handlers for critical workflows**
   ```json
   { "type": "error_trigger", "config": { "notifyEmail": "..." } }
   ```

5. **Limit loop iterations**
   ```json
   "config": { "maxIterations": 1000 }
   ```

6. **Use batch processing for large datasets**
   ```json
   "config": { "batchSize": 50 }
   ```

---

## 🐛 Troubleshooting

### Loop not iterating?
- Check that `items` is an array
- Verify expression syntax: `{{$json.items}}`
- Check maxIterations limit

### Retries not working?
- Verify `executionConfig.retries` is set
- Check logs for retry attempts
- Ensure retryDelay is reasonable

### Error trigger not firing?
- Check `triggerOnNodes` matches failing node ID
- Verify `errorTypes` includes the error type
- Ensure error trigger node is in workflow

---

**Need Help?** Check `PHASE1_IMPLEMENTATION_SUMMARY.md` for more details.

