# S002-P002 Signing Service (Team 60)

Ed25519 signing for MATERIALIZATION_EVIDENCE.json. Keys and signing capability are under Team 60 custody.

## Key custody

- **Location:** Private key PEM in `scripts/signing/keys/ed25519_team60.pem` (or path set by `ED25519_PRIVATE_KEY_PATH`). Directory `keys/` is gitignored.
- **Access:** Team 60 only. Document who has read access; usage is traceable via `signed_at_utc` and `key_id` in signature block.
- **Rotation:** Generate new key with `openssl genpkey -algorithm Ed25519 -out keys/ed25519_team60.pem`; update `ED25519_KEY_ID` and custody log; retire old key.

## Usage

```bash
cd scripts/signing

# Generate key (once)
mkdir -p keys
openssl genpkey -algorithm Ed25519 -out keys/ed25519_team60.pem

# Sign payload from stdin
cat evidence.json | python sign_evidence.py

# Sign from file
python sign_evidence.py --file ../../documentation/reports/05-REPORTS/artifacts_SESSION_01/my_evidence.json

# Override env
ED25519_KEY_ID=team60-s002-p002-002 python sign_evidence.py -f payload.json
```

Output: JSON with `signature_block` (Ed25519, key_id, signature_base64, signed_payload_sha256, signed_at_utc, signed_by_team). Team 61 or CI can call this script and attach the block to MATERIALIZATION_EVIDENCE.json.

## Evidence Contract

Every MATERIALIZATION_EVIDENCE.json must include:
- provenance tag (TARGET_RUNTIME | LOCAL_DEV_NON_AUTHORITATIVE | SIMULATION)
- this signature block
- gate context and traceable artifact path
