# 🔴 הודעה: צוות 10 → צוות 20 (Password Change - P0 Implementation)

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend Implementation)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.3  
**Subject:** PASSWORD_CHANGE_P0_IMPLEMENTATION | Status: ⏸️ **ACTION REQUIRED**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 🔴 הודעה חשובה

**Password Change Flow - Implementation Required**

Team 20 is required to implement the Password Change endpoint (`PUT /users/me/password`) as approved by the Chief Architect.

**Priority:** 🔴 **P0 - CRITICAL**

---

## 📋 Coordination Document

**📄 Full coordination document:** `_COMMUNICATION/team_10/TEAM_10_PASSWORD_CHANGE_COORDINATION.md`

**This document contains:**
- Complete context & background
- Detailed task breakdown for Team 20
- Security requirements
- Testing requirements
- Success criteria
- Reporting requirements

**Please read the full coordination document before starting implementation.**

---

## 🎯 Quick Summary - Team 20 Tasks

### **Task: Implement `PUT /users/me/password` Endpoint**

**Key Requirements:**
- [ ] Endpoint: `PUT /api/v1/users/me/password`
- [ ] Payload: `{ "old_password": "...", "new_password": "..." }` (snake_case)
- [ ] Old password verification (bcrypt)
- [ ] Rate limiting: 5 attempts / 15 minutes
- [ ] Generic error messages (401 Unauthorized)
- [ ] OpenAPI Spec update
- [ ] Manual testing

**Dependencies:**
- ✅ Architectural Decision: APPROVED
- ✅ Database: Ready (users table exists)
- ✅ Authentication: Working (JWT tokens)

**Blocking:**
- ⏸️ Team 30 cannot start until this is complete

---

## 📋 Next Steps

1. **Read:** Full coordination document (`TEAM_10_PASSWORD_CHANGE_COORDINATION.md`)
2. **Implement:** Endpoint according to specifications
3. **Test:** Manual testing with test users
4. **Report:** Create completion report when done

---

## 🔗 Related Documents

1. **Coordination Document:** `_COMMUNICATION/team_10/TEAM_10_PASSWORD_CHANGE_COORDINATION.md` ⭐ **READ THIS FIRST**
2. **Architectural Decision:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PASSWORD_CHANGE_APPROVED.md`
3. **Blueprint:** `_COMMUNICATION/team_31/team_31_staging/D15_PROF_VIEW.html`

---

**Team 10 (The Gateway)**  
**Date:** 2026-01-31  
**log_entry | Team 10 | PASSWORD_CHANGE_P0 | TEAM_20 | ACTION_REQUIRED | 2026-01-31**

---

**Status:** ⏸️ **ACTION REQUIRED - P0 CRITICAL**  
**Next Step:** Read coordination document and start implementation
