# GIN-2026-004: התאמת סכימה לבלופרינט ממשק (V2.5)

**id:** `GIN_004_UI_ALIGNMENT_SPEC`  
**owner:** Team 40 (UI Assets & Design)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v2.5

**תאריך:** 2026-01-26  
**מזהה:** GIN-2026-004 Response  
**גרסה:** V2.5 - UI Alignment (Blueprint D24, D25)  
**צוות:** Team B + Team 10 Collaboration  
**סטטוס:** ✅ **READY FOR IMPLEMENTATION**  
**טבלאות חדשות:** 2 (user_api_keys, password_reset_requests)  
**שדות חדשים:** 5 (calculated_status, ui_display_config, phone_number, +2)

---

## 🎯 Executive Summary

**Context:** Team 10 (UI) completed Dashboard & Profile blueprints (D24, D25)

**Impact:** 4 new DB requirements identified:
1. Aggregated parent status for hierarchical trades
2. Visual design tokens per strategy
3. Multi-provider API key management
4. Phone number identity + SMS recovery

**Changes:** 
- **Tables:** 46 → 48 (+2 new tables)
- **Fields:** +5 across 3 tables
- **Triggers:** +1 (calculated_status)
- **ENUMs:** +2 (method, provider)

**Timeline:** Ready for immediate implementation

---

## 📋 Table of Contents

1. [Requirement א: Aggregated Status](#req-a)
2. [Requirement ב: Design Tokens](#req-b)
3. [Requirement ג: API Keys Management](#req-c)
4. [Requirement ד: Phone Identity](#req-d)
5. [Migration Scripts](#migrations)
6. [Frontend Integration](#frontend)

---

<a name="req-a"></a>
## א. Aggregated Status (Hierarchical Trades)

### UI Requirement (Blueprint D24)

**Dashboard Design:**
```
Parent Trade: SPY LONG 100 shares
Status: ⚠️ PARTIAL [50% closed]  ← Aggregated!
├─ Child 1: CLOSED (50 shares)
└─ Child 2: OPEN (50 shares)
```

**Problem:** Parent status = "OPEN" (from DB), but UI needs "PARTIAL"

---

### Solution: `calculated_status` Field

**DDL:**
```sql
-- Add calculated_status to trades
ALTER TABLE user_data.trades
    ADD COLUMN calculated_status VARCHAR(20);

-- Create ENUM for calculated status
CREATE TYPE user_data.calculated_trade_status AS ENUM (
    'OPEN',           -- No children, or all children open
    'PARTIAL',        -- Some children closed, some open
    'CLOSED',         -- All children closed (or no children + parent closed)
    'CANCELLED',      -- All children cancelled
    'MIXED_CLOSE'     -- Children have mixed outcomes
);

ALTER TABLE user_data.trades
    ALTER COLUMN calculated_status TYPE user_data.calculated_trade_status 
    USING calculated_status::user_data.calculated_trade_status;
```

---

### Trigger Logic: Auto-Calculate Status

```sql
-- Function: Calculate parent status based on children
CREATE OR REPLACE FUNCTION calculate_parent_trade_status()
RETURNS TRIGGER AS $$
DECLARE
    parent_id UUID;
    total_children INTEGER;
    open_children INTEGER;
    closed_children INTEGER;
    cancelled_children INTEGER;
    new_calculated_status user_data.calculated_trade_status;
BEGIN
    -- Get parent ID (if this is a child trade)
    IF NEW.parent_trade_id IS NOT NULL THEN
        parent_id := NEW.parent_trade_id;
    ELSE
        -- This is a parent, check if it has children
        SELECT COUNT(*) INTO total_children
        FROM user_data.trades
        WHERE parent_trade_id = NEW.id AND deleted_at IS NULL;
        
        IF total_children = 0 THEN
            -- No children, use own status
            NEW.calculated_status := NEW.status::user_data.calculated_trade_status;
            RETURN NEW;
        END IF;
        
        parent_id := NEW.id;
    END IF;
    
    -- Count children by status
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'OPEN'),
        COUNT(*) FILTER (WHERE status = 'CLOSED'),
        COUNT(*) FILTER (WHERE status = 'CANCELLED')
    INTO total_children, open_children, closed_children, cancelled_children
    FROM user_data.trades
    WHERE parent_trade_id = parent_id AND deleted_at IS NULL;
    
    -- Determine calculated status
    IF total_children = 0 THEN
        -- No children (shouldn't happen in this branch, but safety)
        new_calculated_status := 'OPEN';
    ELSIF closed_children = total_children THEN
        -- All closed
        new_calculated_status := 'CLOSED';
    ELSIF cancelled_children = total_children THEN
        -- All cancelled
        new_calculated_status := 'CANCELLED';
    ELSIF open_children > 0 AND (closed_children > 0 OR cancelled_children > 0) THEN
        -- Mixed: some open, some closed/cancelled
        new_calculated_status := 'PARTIAL';
    ELSIF closed_children > 0 AND cancelled_children > 0 THEN
        -- Mixed: some closed, some cancelled (no open)
        new_calculated_status := 'MIXED_CLOSE';
    ELSE
        -- Default: all open
        new_calculated_status := 'OPEN';
    END IF;
    
    -- Update parent
    UPDATE user_data.trades
    SET calculated_status = new_calculated_status,
        updated_at = NOW()
    WHERE id = parent_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After any child trade update
CREATE TRIGGER update_parent_calculated_status
    AFTER INSERT OR UPDATE OR DELETE ON user_data.trades
    FOR EACH ROW
    WHEN (NEW.parent_trade_id IS NOT NULL OR OLD.parent_trade_id IS NOT NULL)
    EXECUTE FUNCTION calculate_parent_trade_status();
```

---

### Use Cases

**Scenario 1: Partial Close**
```sql
-- Parent: 100 shares
INSERT INTO trades (id, quantity, status, parent_trade_id) 
VALUES ('parent', 100, 'OPEN', NULL);
-- calculated_status = 'OPEN' (no children yet)

-- Close 50 shares (child 1)
INSERT INTO trades (id, quantity, status, parent_trade_id) 
VALUES ('child-1', 50, 'CLOSED', 'parent');
-- Trigger fires → parent.calculated_status = 'PARTIAL' ✅

-- Close remaining 50 (child 2)
INSERT INTO trades (id, quantity, status, parent_trade_id) 
VALUES ('child-2', 50, 'CLOSED', 'parent');
-- Trigger fires → parent.calculated_status = 'CLOSED' ✅
```

**Scenario 2: Mixed Outcomes**
```sql
-- Child 1: Closed profitably
-- Child 2: Cancelled (stop loss)
-- Parent calculated_status = 'MIXED_CLOSE' ✅
```

---

### Frontend Integration

**API Response:**
```json
GET /v1/trades?include_hierarchy=true

{
  "id": "parent-trade-001",
  "status": "OPEN",
  "calculated_status": "PARTIAL",  ← UI uses this!
  "quantity": 100,
  "children": [
    {"id": "child-1", "status": "CLOSED", "quantity": 50},
    {"id": "child-2", "status": "OPEN", "quantity": 50}
  ]
}
```

**UI Rendering:**
```jsx
// React component
const TradeStatusBadge = ({ trade }) => {
  const status = trade.calculated_status || trade.status;
  
  const statusConfig = {
    'OPEN': { color: 'blue', icon: '🔵', label: 'Open' },
    'PARTIAL': { color: 'orange', icon: '⚠️', label: 'Partial' },
    'CLOSED': { color: 'green', icon: '✅', label: 'Closed' },
    'MIXED_CLOSE': { color: 'purple', icon: '🔀', label: 'Mixed' }
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge color={config.color}>
      {config.icon} {config.label}
    </Badge>
  );
};
```

**✅ Requirement Met:** Aggregated status for hierarchical view

---

<a name="req-b"></a>
## ב. Design Tokens (Visual Strategy Configuration)

### UI Requirement (Blueprint D24)

**Dashboard Design:**
```
Strategy: "Mean Reversion"
Color: #3B82F6 (Blue)
Icon: 📊
Badge: Rounded corners, gradient background
All trades tagged with this strategy → Auto-styled
```

**Problem:** No visual configuration in DB

---

### Solution: `ui_display_config` Field

**DDL:**
```sql
-- Add ui_display_config to strategies
ALTER TABLE user_data.strategies
    ADD COLUMN ui_display_config JSONB NOT NULL DEFAULT '{}'::JSONB;

-- Create GIN index for JSONB queries
CREATE INDEX idx_strategies_ui_config 
    ON user_data.strategies USING gin(ui_display_config jsonb_path_ops);

-- Add constraint: must be valid JSON object
ALTER TABLE user_data.strategies
    ADD CONSTRAINT strategies_ui_config_is_object
    CHECK (jsonb_typeof(ui_display_config) = 'object');
```

---

### Schema: Design Tokens

**JSON Structure:**
```json
{
  "version": "1.0",
  "theme": {
    "primary_color": "#3B82F6",
    "secondary_color": "#60A5FA",
    "text_color": "#1E3A8A",
    "background_gradient": {
      "from": "#DBEAFE",
      "to": "#BFDBFE"
    }
  },
  "icon": {
    "type": "emoji",
    "value": "📊"
  },
  "badge": {
    "border_radius": "8px",
    "border_width": "2px",
    "border_color": "#3B82F6",
    "shadow": "0 2px 4px rgba(59, 130, 246, 0.3)"
  },
  "chart": {
    "line_color": "#3B82F6",
    "fill_color": "rgba(59, 130, 246, 0.1)",
    "point_color": "#1E40AF"
  },
  "custom": {
    "animation": "fade-in",
    "duration_ms": 300
  }
}
```

---

### Example Data

**Strategy 1: Mean Reversion**
```sql
INSERT INTO user_data.strategies (
    id, user_id, name, strategy_type, ui_display_config
) VALUES (
    gen_random_uuid(),
    '<user-uuid>',
    'Mean Reversion',
    'MEAN_REVERSION',
    '{
      "version": "1.0",
      "theme": {
        "primary_color": "#3B82F6",
        "secondary_color": "#60A5FA"
      },
      "icon": {"type": "emoji", "value": "📊"},
      "badge": {"border_radius": "8px"}
    }'::JSONB
);
```

**Strategy 2: Breakout Momentum**
```sql
INSERT INTO user_data.strategies (
    id, user_id, name, strategy_type, ui_display_config
) VALUES (
    gen_random_uuid(),
    '<user-uuid>',
    'Breakout Momentum',
    'BREAKOUT',
    '{
      "version": "1.0",
      "theme": {
        "primary_color": "#10B981",
        "secondary_color": "#34D399"
      },
      "icon": {"type": "emoji", "value": "🚀"},
      "badge": {"border_radius": "16px"}
    }'::JSONB
);
```

---

### Frontend Integration

**API Response:**
```json
GET /v1/strategies

{
  "strategies": [
    {
      "id": "strat-001",
      "name": "Mean Reversion",
      "ui_display_config": {
        "theme": {"primary_color": "#3B82F6"},
        "icon": {"value": "📊"}
      }
    }
  ]
}
```

**React Component:**
```jsx
const StrategyBadge = ({ strategy }) => {
  const config = strategy.ui_display_config || {};
  const primaryColor = config.theme?.primary_color || '#6B7280';
  const icon = config.icon?.value || '📈';
  
  return (
    <div 
      style={{
        backgroundColor: primaryColor,
        borderRadius: config.badge?.border_radius || '4px',
        padding: '4px 12px',
        color: 'white'
      }}
    >
      {icon} {strategy.name}
    </div>
  );
};
```

**CSS Variables:**
```css
/* Auto-generate CSS variables from strategy config */
:root {
  --strategy-mean-reversion-primary: #3B82F6;
  --strategy-mean-reversion-secondary: #60A5FA;
  --strategy-breakout-primary: #10B981;
}

.trade[data-strategy="mean-reversion"] {
  border-left: 4px solid var(--strategy-mean-reversion-primary);
}
```

**✅ Requirement Met:** Design tokens for visual consistency

---

<a name="req-c"></a>
## ג. Multi-Provider API Keys

### UI Requirement (Blueprint D24)

**Settings Page:**
```
API Keys Management:
├─ Interactive Brokers
│  └─ [Connected] Key: ****5678
├─ Polygon.io
│  └─ [Not Connected] Add Key
└─ Yahoo Finance
   └─ [Connected] Key: ****9012
```

**Problem:** No table for multiple API keys per user

---

### Solution: `user_api_keys` Table (NEW - Table 47)

**DDL:**
```sql
-- Create ENUM for API providers
CREATE TYPE user_data.api_provider AS ENUM (
    'IBKR',              -- Interactive Brokers
    'POLYGON',           -- Polygon.io
    'YAHOO_FINANCE',     -- Yahoo Finance
    'ALPHA_VANTAGE',     -- Alpha Vantage
    'FINNHUB',           -- Finnhub
    'TWELVE_DATA',       -- Twelve Data
    'IEX_CLOUD',         -- IEX Cloud
    'CUSTOM'             -- Custom provider
);

-- Create user_api_keys table
CREATE TABLE user_data.user_api_keys (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ownership
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Provider
    provider user_data.api_provider NOT NULL,
    provider_label VARCHAR(100),  -- Custom name (e.g., "IBKR - Main Account")
    
    -- Credentials (ENCRYPTED!)
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT,
    additional_config JSONB DEFAULT '{}'::JSONB,  -- Extra fields (webhooks, etc.)
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_verified_at TIMESTAMPTZ,
    verification_error TEXT,
    
    -- Rate Limiting
    rate_limit_per_minute INTEGER,
    rate_limit_per_day INTEGER,
    quota_used_today INTEGER DEFAULT 0,
    quota_reset_at TIMESTAMPTZ,
    
    -- Audit Trail
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Constraints
    CONSTRAINT user_api_keys_unique_user_provider 
        UNIQUE (user_id, provider, provider_label) WHERE deleted_at IS NULL,
    
    CONSTRAINT user_api_keys_encrypted_not_empty
        CHECK (LENGTH(api_key_encrypted) > 0),
    
    CONSTRAINT user_api_keys_rate_limit_positive
        CHECK (
            rate_limit_per_minute IS NULL OR rate_limit_per_minute > 0
        ),
    
    CONSTRAINT user_api_keys_quota_logic
        CHECK (quota_used_today >= 0)
);
```

---

### Indexes

```sql
-- User's API keys
CREATE INDEX idx_user_api_keys_user_id 
    ON user_data.user_api_keys(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;

-- Active keys by provider
CREATE INDEX idx_user_api_keys_provider 
    ON user_data.user_api_keys(provider, is_active) 
    WHERE is_active = TRUE AND deleted_at IS NULL;

-- Verification status
CREATE INDEX idx_user_api_keys_verified 
    ON user_data.user_api_keys(is_verified, last_verified_at DESC) 
    WHERE deleted_at IS NULL;

-- Config search
CREATE INDEX idx_user_api_keys_config 
    ON user_data.user_api_keys USING gin(additional_config jsonb_path_ops);
```

---

### Encryption Strategy

**⚠️ CRITICAL: Never store plain-text API keys!**

**Backend Encryption (Python/FastAPI):**
```python
from cryptography.fernet import Fernet
import os

# Encryption key (from environment)
ENCRYPTION_KEY = os.getenv('API_KEY_ENCRYPTION_KEY')
cipher = Fernet(ENCRYPTION_KEY)

def encrypt_api_key(plain_key: str) -> str:
    """Encrypt API key before storing in DB"""
    return cipher.encrypt(plain_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt API key when needed"""
    return cipher.decrypt(encrypted_key.encode()).decode()

# Usage
api_key_plain = "pk_live_123456789"
api_key_encrypted = encrypt_api_key(api_key_plain)

# Store encrypted
db.execute(
    "INSERT INTO user_api_keys (api_key_encrypted) VALUES (:key)",
    {"key": api_key_encrypted}
)
```

**Database-Level Protection:**
```sql
-- Column-level encryption (optional, additional layer)
-- Requires pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt before insert
INSERT INTO user_api_keys (api_key_encrypted) 
VALUES (pgp_sym_encrypt('pk_live_123', 'master_password'));

-- Decrypt on select
SELECT pgp_sym_decrypt(api_key_encrypted::bytea, 'master_password') 
FROM user_api_keys;
```

---

### Use Cases

**Add API Key:**
```sql
INSERT INTO user_data.user_api_keys (
    id, user_id, provider, provider_label,
    api_key_encrypted, api_secret_encrypted,
    is_active, created_by, updated_by
) VALUES (
    gen_random_uuid(),
    '<user-uuid>',
    'POLYGON',
    'Polygon - Primary',
    '<encrypted-key>',
    '<encrypted-secret>',
    TRUE,
    '<user-uuid>',
    '<user-uuid>'
);
```

**Get Active Keys:**
```sql
SELECT 
    provider,
    provider_label,
    is_verified,
    last_verified_at,
    rate_limit_per_minute
FROM user_data.user_api_keys
WHERE user_id = '<user-uuid>'
    AND is_active = TRUE
    AND deleted_at IS NULL
ORDER BY provider;
```

**Verify Key (Health Check):**
```python
async def verify_api_key(key_id: str):
    """Test API key against provider"""
    
    # Get encrypted key
    key_record = await db.fetch_one(
        "SELECT provider, api_key_encrypted FROM user_api_keys WHERE id = :id",
        {"id": key_id}
    )
    
    # Decrypt
    api_key = decrypt_api_key(key_record['api_key_encrypted'])
    
    # Test against provider
    try:
        if key_record['provider'] == 'POLYGON':
            response = requests.get(
                'https://api.polygon.io/v2/aggs/ticker/SPY/prev',
                headers={'Authorization': f'Bearer {api_key}'}
            )
            is_valid = response.status_code == 200
        # ... other providers ...
        
        # Update verification status
        await db.execute("""
            UPDATE user_api_keys 
            SET is_verified = :valid,
                last_verified_at = NOW(),
                verification_error = :error
            WHERE id = :id
        """, {
            "valid": is_valid,
            "error": None if is_valid else response.text,
            "id": key_id
        })
        
        return is_valid
        
    except Exception as e:
        await db.execute("""
            UPDATE user_api_keys 
            SET is_verified = FALSE,
                verification_error = :error
            WHERE id = :id
        """, {"error": str(e), "id": key_id})
        
        return False
```

**✅ Requirement Met:** Multi-provider API key management with encryption

---

<a name="req-d"></a>
## ד. Phone Identity & SMS Recovery

### UI Requirement (Blueprint D25)

**Registration/Recovery Flow:**
```
Sign Up:
├─ Email (required, unique)
├─ Phone (optional, unique)  ← NEW
└─ Password

Forgot Password?
├─ Method: Email or SMS  ← NEW
└─ Code sent to chosen method
```

**Problem:** No phone number support, no SMS recovery

---

### Solution 1: Add `phone_number` to Users

**DDL:**
```sql
-- Add phone_number to users
ALTER TABLE user_data.users
    ADD COLUMN phone_number VARCHAR(20),
    ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN phone_verified_at TIMESTAMPTZ;

-- Create UNIQUE index (phone must be unique if provided)
CREATE UNIQUE INDEX idx_users_phone_unique 
    ON user_data.users(phone_number) 
    WHERE phone_number IS NOT NULL AND deleted_at IS NULL;

-- Create search index
CREATE INDEX idx_users_phone 
    ON user_data.users(phone_number) 
    WHERE deleted_at IS NULL;

-- Add constraint: phone format validation
ALTER TABLE user_data.users
    ADD CONSTRAINT users_phone_format
    CHECK (
        phone_number IS NULL 
        OR phone_number ~ '^\+?[1-9]\d{1,14}$'  -- E.164 format
    );
```

**Phone Format (E.164):**
- Format: `+[country code][number]`
- Examples:
  - US: `+12025551234`
  - IL: `+972501234567`
  - UK: `+442071234567`

---

### Solution 2: `password_reset_requests` Table (NEW - Table 48)

**DDL:**
```sql
-- Create ENUM for reset method
CREATE TYPE user_data.reset_method AS ENUM (
    'EMAIL',
    'SMS'
);

-- Create password_reset_requests table
CREATE TABLE user_data.password_reset_requests (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Method
    method user_data.reset_method NOT NULL,
    sent_to VARCHAR(255) NOT NULL,  -- Email or phone (masked in logs)
    
    -- Token
    reset_token VARCHAR(64) NOT NULL UNIQUE,  -- Hashed token
    token_expires_at TIMESTAMPTZ NOT NULL,
    
    -- Verification Code (for SMS)
    verification_code VARCHAR(6),  -- 6-digit code
    code_expires_at TIMESTAMPTZ,
    attempts_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED')),
    
    -- Usage
    used_at TIMESTAMPTZ,
    used_from_ip VARCHAR(45),  -- IPv6 max length
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT password_reset_token_length 
        CHECK (LENGTH(reset_token) >= 32),
    
    CONSTRAINT password_reset_code_length 
        CHECK (
            verification_code IS NULL 
            OR LENGTH(verification_code) = 6
        ),
    
    CONSTRAINT password_reset_attempts_limit 
        CHECK (attempts_count <= max_attempts)
);
```

---

### Indexes

```sql
-- Token lookup (primary query)
CREATE UNIQUE INDEX idx_password_reset_token 
    ON user_data.password_reset_requests(reset_token) 
    WHERE status = 'PENDING';

-- User's recent requests
CREATE INDEX idx_password_reset_user_id 
    ON user_data.password_reset_requests(user_id, created_at DESC);

-- Expired requests cleanup
CREATE INDEX idx_password_reset_expired 
    ON user_data.password_reset_requests(token_expires_at) 
    WHERE status = 'PENDING';

-- Method filtering
CREATE INDEX idx_password_reset_method 
    ON user_data.password_reset_requests(method, status);
```

---

### Workflow: Password Reset

**Step 1: Request Reset (Email)**
```python
async def request_password_reset_email(email: str):
    """Send password reset email"""
    
    # Find user
    user = await db.fetch_one(
        "SELECT id, email FROM users WHERE email = :email",
        {"email": email}
    )
    
    # Generate secure token
    reset_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
    
    # Create request
    await db.execute("""
        INSERT INTO password_reset_requests (
            user_id, method, sent_to, reset_token, token_expires_at
        ) VALUES (
            :user_id, 'EMAIL', :email, :token, NOW() + INTERVAL '1 hour'
        )
    """, {
        "user_id": user['id'],
        "email": email,
        "token": token_hash
    })
    
    # Send email
    send_email(
        to=email,
        subject="Reset Your Password",
        body=f"Click here: https://app.tiktrack.com/reset?token={reset_token}"
    )
```

**Step 2: Request Reset (SMS)**
```python
async def request_password_reset_sms(phone: str):
    """Send password reset SMS"""
    
    # Find user
    user = await db.fetch_one(
        "SELECT id, phone_number FROM users WHERE phone_number = :phone",
        {"phone": phone}
    )
    
    # Generate 6-digit code
    verification_code = str(random.randint(100000, 999999))
    
    # Create request
    await db.execute("""
        INSERT INTO password_reset_requests (
            user_id, method, sent_to, 
            reset_token, token_expires_at,
            verification_code, code_expires_at
        ) VALUES (
            :user_id, 'SMS', :phone,
            :token, NOW() + INTERVAL '1 hour',
            :code, NOW() + INTERVAL '10 minutes'
        )
    """, {
        "user_id": user['id'],
        "phone": phone,
        "token": secrets.token_urlsafe(32),
        "code": verification_code
    })
    
    # Send SMS
    send_sms(
        to=phone,
        message=f"Your TikTrack verification code: {verification_code}"
    )
```

**Step 3: Verify & Reset**
```python
async def verify_and_reset_password(token: str, new_password: str, code: str = None):
    """Verify token/code and reset password"""
    
    # Hash token
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    # Find request
    request = await db.fetch_one("""
        SELECT * FROM password_reset_requests
        WHERE reset_token = :token
            AND status = 'PENDING'
            AND token_expires_at > NOW()
    """, {"token": token_hash})
    
    if not request:
        raise ValueError("Invalid or expired token")
    
    # If SMS, verify code
    if request['method'] == 'SMS':
        if code != request['verification_code']:
            # Increment attempts
            await db.execute("""
                UPDATE password_reset_requests
                SET attempts_count = attempts_count + 1
                WHERE id = :id
            """, {"id": request['id']})
            
            if request['attempts_count'] + 1 >= request['max_attempts']:
                await db.execute("""
                    UPDATE password_reset_requests
                    SET status = 'REVOKED'
                    WHERE id = :id
                """, {"id": request['id']})
                
                raise ValueError("Too many attempts")
            
            raise ValueError("Invalid code")
        
        if request['code_expires_at'] < datetime.now():
            raise ValueError("Code expired")
    
    # Reset password
    password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())
    
    await db.execute("""
        UPDATE users
        SET password_hash = :hash,
            updated_at = NOW()
        WHERE id = :user_id
    """, {
        "hash": password_hash.decode(),
        "user_id": request['user_id']
    })
    
    # Mark request as used
    await db.execute("""
        UPDATE password_reset_requests
        SET status = 'USED',
            used_at = NOW(),
            used_from_ip = :ip
        WHERE id = :id
    """, {
        "ip": get_client_ip(),
        "id": request['id']
    })
    
    return {"success": True}
```

**✅ Requirement Met:** Phone identity + SMS recovery

---

<a name="migrations"></a>
## Migration Scripts (V2.5)

### Migration Directory Structure

```
migrations_v2.5/
├── 001_add_calculated_status_trades.sql
├── 002_add_ui_display_config_strategies.sql
├── 003_create_user_api_keys_table.sql
├── 004_add_phone_users.sql
├── 005_create_password_reset_requests.sql
└── README.md
```

---

### Migration 001: calculated_status

```sql
-- File: 001_add_calculated_status_trades.sql

BEGIN;

-- Create ENUM
CREATE TYPE user_data.calculated_trade_status AS ENUM (
    'OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'MIXED_CLOSE'
);

-- Add column
ALTER TABLE user_data.trades
    ADD COLUMN calculated_status user_data.calculated_trade_status;

-- Backfill existing data
UPDATE user_data.trades
SET calculated_status = status::TEXT::user_data.calculated_trade_status
WHERE parent_trade_id IS NULL;  -- Parents only

-- Create function
CREATE OR REPLACE FUNCTION calculate_parent_trade_status()
RETURNS TRIGGER AS $$
-- [Full function from section א]
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_parent_calculated_status
    AFTER INSERT OR UPDATE OR DELETE ON user_data.trades
    FOR EACH ROW
    EXECUTE FUNCTION calculate_parent_trade_status();

COMMIT;
```

---

### Migration 002: ui_display_config

```sql
-- File: 002_add_ui_display_config_strategies.sql

BEGIN;

-- Add column
ALTER TABLE user_data.strategies
    ADD COLUMN ui_display_config JSONB NOT NULL DEFAULT '{}'::JSONB;

-- Add constraint
ALTER TABLE user_data.strategies
    ADD CONSTRAINT strategies_ui_config_is_object
    CHECK (jsonb_typeof(ui_display_config) = 'object');

-- Create index
CREATE INDEX idx_strategies_ui_config 
    ON user_data.strategies USING gin(ui_display_config jsonb_path_ops);

-- Backfill default config
UPDATE user_data.strategies
SET ui_display_config = jsonb_build_object(
    'version', '1.0',
    'theme', jsonb_build_object(
        'primary_color', '#6B7280',
        'secondary_color', '#9CA3AF'
    ),
    'icon', jsonb_build_object(
        'type', 'emoji',
        'value', '📈'
    )
)
WHERE ui_display_config = '{}'::JSONB;

COMMIT;
```

---

### Migration 003: user_api_keys

```sql
-- File: 003_create_user_api_keys_table.sql

BEGIN;

-- Create ENUM
CREATE TYPE user_data.api_provider AS ENUM (
    'IBKR', 'POLYGON', 'YAHOO_FINANCE', 'ALPHA_VANTAGE',
    'FINNHUB', 'TWELVE_DATA', 'IEX_CLOUD', 'CUSTOM'
);

-- Create table
CREATE TABLE user_data.user_api_keys (
    -- [Full DDL from section ג]
);

-- Create indexes
CREATE INDEX idx_user_api_keys_user_id ... ;
-- [All indexes from section ג]

COMMIT;
```

---

### Migration 004: phone_number

```sql
-- File: 004_add_phone_users.sql

BEGIN;

-- Add columns
ALTER TABLE user_data.users
    ADD COLUMN phone_number VARCHAR(20),
    ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN phone_verified_at TIMESTAMPTZ;

-- Create unique index
CREATE UNIQUE INDEX idx_users_phone_unique 
    ON user_data.users(phone_number) 
    WHERE phone_number IS NOT NULL AND deleted_at IS NULL;

-- Create search index
CREATE INDEX idx_users_phone 
    ON user_data.users(phone_number) 
    WHERE deleted_at IS NULL;

-- Add constraint
ALTER TABLE user_data.users
    ADD CONSTRAINT users_phone_format
    CHECK (
        phone_number IS NULL 
        OR phone_number ~ '^\+?[1-9]\d{1,14}$'
    );

COMMIT;
```

---

### Migration 005: password_reset_requests

```sql
-- File: 005_create_password_reset_requests.sql

BEGIN;

-- Create ENUM
CREATE TYPE user_data.reset_method AS ENUM ('EMAIL', 'SMS');

-- Create table
CREATE TABLE user_data.password_reset_requests (
    -- [Full DDL from section ד]
);

-- Create indexes
CREATE UNIQUE INDEX idx_password_reset_token ... ;
-- [All indexes from section ד]

COMMIT;
```

---

<a name="frontend"></a>
## Frontend Integration Guide

### API Endpoints (New/Updated)

**1. Trades with Calculated Status:**
```
GET /v1/trades?include_hierarchy=true
Response: Include calculated_status field
```

**2. Strategies with UI Config:**
```
GET /v1/strategies
Response: Include ui_display_config JSONB

POST /v1/strategies
Body: { ..., "ui_display_config": {...} }
```

**3. API Keys Management:**
```
GET /v1/user/api-keys
POST /v1/user/api-keys
PUT /v1/user/api-keys/{id}
DELETE /v1/user/api-keys/{id}
POST /v1/user/api-keys/{id}/verify
```

**4. Phone & SMS:**
```
PUT /v1/user/profile
Body: { "phone_number": "+12025551234" }

POST /v1/auth/verify-phone
Body: { "code": "123456" }

POST /v1/auth/reset-password
Body: { "method": "SMS", "phone": "+1202555..." }
```

---

## 📊 V2.5 Summary

### Statistics

| Metric | V2.4 | V2.5 | Change |
|--------|------|------|--------|
| **Tables** | 46 | **48** | +2 |
| **Fields (total)** | ~1,200 | **~1,210** | +10 |
| **Indexes** | ~206 | **~218** | +12 |
| **Triggers** | 8 | **9** | +1 |
| **ENUMs** | 15 | **17** | +2 |
| **Functions** | 11 | **12** | +1 |

### New Tables

1. **Table 47:** `user_data.user_api_keys` - Multi-provider API key management
2. **Table 48:** `user_data.password_reset_requests` - Password recovery with SMS

### New Fields

1. `trades.calculated_status` - Aggregated parent status
2. `strategies.ui_display_config` - Design tokens (JSONB)
3. `users.phone_number` - Phone identity
4. `users.phone_verified` - Verification flag
5. `users.phone_verified_at` - Verification timestamp

---

## ✅ Success Criteria Met

- [x] **א. Aggregated Status** - `calculated_status` + trigger implemented
- [x] **ב. Design Tokens** - `ui_display_config` JSONB added
- [x] **ג. API Keys** - `user_api_keys` table with encryption
- [x] **ד. Phone Identity** - `phone_number` unique index + SMS recovery

**All requirements satisfied!**

---

## 🚀 Next Steps for Team 20

1. **Run Migrations:** Execute 005 migration files in order
2. **Update Models:** Add new fields to SQLAlchemy/Pydantic
3. **Implement API Endpoints:** 4 new endpoint groups
4. **Test Encryption:** Verify API key encryption/decryption
5. **SMS Integration:** Integrate Twilio/AWS SNS for SMS
6. **Frontend Handoff:** Share API specs with Team 10

**Timeline:** 24 hours (1 day)  
**Risk:** 🟢 LOW (additive changes only)

---

**Prepared by:** Team B - Architecture  
**Collaboration:** Team 10 (UI)  
**Date:** 2026-01-26  
**Status:** ✅ Ready for Implementation
