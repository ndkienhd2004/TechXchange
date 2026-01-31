#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"

echo -e "${BLUE}===== TechXchange Authentication Test =====${NC}\n"

# Test 1: Register
echo -e "${YELLOW}1. Testing Register...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }')

echo $REGISTER_RESPONSE | jq .

if echo $REGISTER_RESPONSE | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✓ Register successful${NC}\n"
  ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.accessToken')
  REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.refreshToken')
else
  echo -e "${RED}✗ Register failed${NC}\n"
  exit 1
fi

# Test 2: Get Profile
echo -e "${YELLOW}2. Testing Get Profile...${NC}"
curl -s -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
echo -e "${GREEN}✓ Get Profile successful${NC}\n"

# Test 3: Refresh Token
echo -e "${YELLOW}3. Testing Refresh Token...${NC}"
REFRESH_RESPONSE=$(curl -s -X POST $BASE_URL/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo $REFRESH_RESPONSE | jq .

if echo $REFRESH_RESPONSE | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✓ Refresh token successful${NC}\n"
  NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.data.accessToken')
  NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.data.refreshToken')
else
  echo -e "${RED}✗ Refresh token failed${NC}\n"
fi

# Test 4: Verify Token
echo -e "${YELLOW}4. Testing Verify Token...${NC}"
curl -s -X GET $BASE_URL/auth/verify \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" | jq .
echo -e "${GREEN}✓ Verify token successful${NC}\n"

# Test 5: Update Profile
echo -e "${YELLOW}5. Testing Update Profile...${NC}"
curl -s -X PUT $BASE_URL/auth/profile \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newtestuser",
    "phone": "0123456789"
  }' | jq .
echo -e "${GREEN}✓ Update profile successful${NC}\n"

# Test 6: Change Password
echo -e "${YELLOW}6. Testing Change Password...${NC}"
curl -s -X POST $BASE_URL/auth/change-password \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }' | jq .
echo -e "${GREEN}✓ Change password successful${NC}\n"

# Test 7: Logout
echo -e "${YELLOW}7. Testing Logout...${NC}"
curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$NEW_REFRESH_TOKEN\"
  }" | jq .
echo -e "${GREEN}✓ Logout successful${NC}\n"

# Test 8: Try to use revoked token (should fail)
echo -e "${YELLOW}8. Testing Revoked Token (should fail)...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$NEW_REFRESH_TOKEN\"
  }")

echo $RESPONSE | jq .

if echo $RESPONSE | jq -e '.success' > /dev/null; then
  echo -e "${RED}✗ Revoked token test failed (token should be revoked)${NC}\n"
else
  echo -e "${GREEN}✓ Revoked token correctly rejected${NC}\n"
fi

echo -e "${BLUE}===== Test Complete =====${NC}"

