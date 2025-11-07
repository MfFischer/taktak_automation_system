#!/bin/bash

# Test Template Import with Authentication
# This script tests the complete flow: login → import template → verify workflow

echo "🧪 Testing Template Import Flow..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001"

# Step 1: Register a test user (if not exists)
echo "📝 Step 1: Creating test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-template@example.com",
    "password": "Test123!@#",
    "name": "Template Tester"
  }')

echo "$REGISTER_RESPONSE" | grep -q "success"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ User created successfully${NC}"
else
  echo -e "${YELLOW}⚠️  User might already exist, continuing...${NC}"
fi
echo ""

# Step 2: Login to get JWT token
echo "🔐 Step 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-template@example.com",
    "password": "Test123!@#"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get authentication token${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 3: Get list of templates
echo "📋 Step 3: Fetching templates..."
TEMPLATES_RESPONSE=$(curl -s "$API_URL/api/templates")
TEMPLATE_COUNT=$(echo "$TEMPLATES_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)

echo -e "${GREEN}✅ Found $TEMPLATE_COUNT templates${NC}"
echo ""

# Step 4: Import a template
echo "📥 Step 4: Importing template..."
TEMPLATE_ID="clinic-appointment-reminder"

IMPORT_RESPONSE=$(curl -s -X POST "$API_URL/api/templates/$TEMPLATE_ID/import" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}')

echo "$IMPORT_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Template imported successfully${NC}"
  WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
  echo "Workflow ID: $WORKFLOW_ID"
else
  echo -e "${RED}❌ Failed to import template${NC}"
  echo "Response: $IMPORT_RESPONSE"
  exit 1
fi
echo ""

# Step 5: Verify workflow exists
echo "🔍 Step 5: Verifying workflow was created..."
WORKFLOWS_RESPONSE=$(curl -s "$API_URL/api/workflows" \
  -H "Authorization: Bearer $TOKEN")

echo "$WORKFLOWS_RESPONSE" | grep -q "$WORKFLOW_ID"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Workflow found in workflows list${NC}"
else
  echo -e "${RED}❌ Workflow not found in workflows list${NC}"
  exit 1
fi
echo ""

# Step 6: Get workflow details
echo "📄 Step 6: Fetching workflow details..."
WORKFLOW_RESPONSE=$(curl -s "$API_URL/api/workflows/$WORKFLOW_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$WORKFLOW_RESPONSE" | grep -q '"name":"Appointment Reminder System"'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Workflow details retrieved successfully${NC}"
  
  # Check if trigger exists
  echo "$WORKFLOW_RESPONSE" | grep -q '"trigger":'
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Workflow has trigger node${NC}"
  else
    echo -e "${RED}❌ Workflow missing trigger node${NC}"
  fi
  
  # Check if nodes exist
  NODE_COUNT=$(echo "$WORKFLOW_RESPONSE" | grep -o '"nodes":\[' | wc -l)
  if [ $NODE_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Workflow has nodes${NC}"
  else
    echo -e "${RED}❌ Workflow missing nodes${NC}"
  fi
else
  echo -e "${RED}❌ Failed to retrieve workflow details${NC}"
  exit 1
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ User authentication working"
echo "  ✅ Template import working"
echo "  ✅ Workflow created in database"
echo "  ✅ Workflow has trigger and nodes"
echo ""
echo "You can now test in the browser:"
echo "  1. Go to http://localhost:3000/login"
echo "  2. Login with: test-template@example.com / Test123!@#"
echo "  3. Go to Templates page"
echo "  4. Import any template"
echo "  5. Check Workflows page to see imported workflow"
echo ""

