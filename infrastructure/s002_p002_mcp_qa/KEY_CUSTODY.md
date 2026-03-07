# S002-P002 Ed25519 Key Custody (Team 60)

Team 60 controls Ed25519 keys used to sign MATERIALIZATION_EVIDENCE.json. Access and usage are documented and traceable.

## Key location and access

- **Path:** `scripts/signing/keys/ed25519_team60.pem` (PEM format). Directory `scripts/signing/keys/` is **gitignored**; keys are never committed.
- **Owner:** Team 60 (Runtime / Platform & Signing-Key Custody).
- **Access:** Only processes or users authorized by Team 60 may read the private key (e.g. CI service account, designated developer). Document access in your local runbook; this file is the SSOT for custody policy.

## Usage

- Signing is performed by `scripts/signing/sign_evidence.py`. It reads the key from path above (or `ED25519_PRIVATE_KEY_PATH`) and outputs the signature block (key_id, signature_base64, signed_payload_sha256, signed_at_utc, signed_by_team).
- Team 61 (or CI) **calls** the signing script; it does not hold the key. Keys remain in this repo under Team 60 control.

## Traceability

- Every signature includes `signed_at_utc` and `key_id`. Log who ran the signer and for which artifact if required by audit.
- Key identifier: `ED25519_KEY_ID` (default `team60-s002-p002-001`). Rotate key_id when rotating keys.

## Rotation

1. Generate new key: `openssl genpkey -algorithm Ed25519 -out scripts/signing/keys/ed25519_team60_new.pem`
2. Update config to use new key; update `ED25519_KEY_ID` if desired.
3. Retire old key: remove from disk, document retirement date. Old signatures remain valid for historical evidence.
