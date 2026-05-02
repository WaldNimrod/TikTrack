---
artifact: VERDICT_PRIVACY_POLICY_EXTERNAL
version: v1.2.0
date: 2026-05-02
validator: GPT-5.5 Thinking
wp: S006-P006-WP001
verdict: PASS_WITH_FINDINGS
---

# VERDICT — Privacy Policy + Terms of Service External Validation v1.2.0

## Scope

Independent legal/technical validation of the Hebrew Privacy Policy and Terms of Service for TikTrack, an Israeli trading analytics and self-improvement web platform in closed beta pilot (~50 Israeli users, no monetary exchange, community initiative, no registered operating entity yet).

Input reviewed: full Hebrew policy and terms supplied for v1.2.0 review, including the stated context about IBKR sync, Telegram opt-in/opt-out, processors, contact details, address, and beta-pilot status.

External reference points checked:

- Israeli Privacy Protection Authority — database notification after Amendment 13: https://www.gov.il/he/service/notice-obligation
- Israeli Privacy Protection Authority — database registration after Amendment 13: https://www.gov.il/he/service/registration_in_the_database
- Israeli Privacy Protection Authority — serious data breach reporting: https://www.gov.il/he/service/report-of-data-breach
- GDPR Article 13 / Article 14 reference: https://gdpr-info.eu/art-13-gdpr/ ; https://gdprinfo.eu/en-article-14
- Sentry / Functional Software DPF participant record: https://www.dataprivacyframework.gov/participant/5869
- Anthropic DPA article: https://privacy.anthropic.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa
- uPress Customer DPA: https://www.upress.co.il/customer-dpa/
- Telegram Privacy Policy and Standard Bot Privacy Policy: https://telegram.org/privacy ; https://telegram.org/privacy-tpa

## 1. Item-by-item validation

### A. Israeli Privacy Protection Law — PPL Amendment 13 / 2024

1. **PARTIAL** — The policy discloses service name, address, contact email, pilot status, and future commercial entity, but it does not identify a natural person or current legal controller behind the unregistered community initiative; this is acceptable for pilot transparency but requires attorney review.
2. **PASS** — The policy enumerates username, email, optional phone, IBKR positions/trades/P&L, Telegram `chat_id`, usage logs, errors, browser data, and IP hash.
3. **PASS** — Trading data is expressly flagged as `מידע רגיש במיוחד` / especially sensitive, covering positions, P&L, and trades.
4. **PASS** — Processing purposes are stated clearly: service operation, portfolio display, trading-performance analysis, dashboards, alerts, AI educational analysis, error detection, and security.
5. **PASS** — Sentry, Anthropic, uPress, and Telegram are disclosed with country/region, purpose, and a privacy/DPA URL.
6. **PASS** — The policy states access, correction, deletion, portability, restriction, objection, and withdrawal of Telegram consent.
7. **PASS_WITH_FINDINGS** — The policy includes a 72-hour notification commitment for especially sensitive data, but should be refined to say serious security incidents will be reported to the PPA immediately/as soon as possible, because Israeli PPA guidance describes immediate reporting of serious incidents.
8. **PASS** — The email-only account deletion process is disclosed honestly with a 30-day target and self-service deletion marked as future; this is adequate for a small closed Israeli pilot, subject to backup/log retention exceptions being added.

### B. GDPR Article 13/14 forward-compatibility

9. **PASS** — The policy includes a data-category legal-basis table using contract, legitimate interest, and consent.
10. **PARTIAL** — IBKR is identified as a user-approved sync source and not a processor, but the policy should explicitly label this as indirect collection / Article 14-style collection and state the timing and scope of notice.
11. **PASS** — The policy names and links the Israeli Privacy Protection Authority as the supervisory authority.
12. **PARTIAL** — The policy covers many Article 13 elements, but is missing or under-specifies retention periods by category, consequences of refusing optional/required data, no-DPO/no-representative statement if applicable, and clearer AI/automated-analysis transparency.

### C. Processor & transfer disclosure

13. **PASS** — All four required processors are listed: Sentry, Anthropic, uPress, and Telegram.
14. **PASS_WITH_FINDINGS** — Each processor has a privacy/DPA URL, but Anthropic should link directly to the commercial DPA/SCC reference rather than only a general privacy URL, and the exact uPress contracting entity should be confirmed.
15. **PARTIAL** — Sentry’s US transfer is adequately disclosed as DPF-certified; Anthropic’s no-DPF position plus DPA/SCC reference is acceptable for a closed pilot only if commercial/API terms and DPA are actually accepted and data minimization is enforced.

### D. Terms of Service — liability / financial-tool risk

16. **PASS** — The Terms explicitly state that TikTrack does not trade, buy, sell, approve, recommend, or assist in execution on behalf of the user.
17. **PASS** — The Terms expressly state that the information is not financial or investment advice.
18. **PASS** — The Terms frame the service as educational/self-improvement and focused on learning from historical user data.
19. **PASS** — The Terms warn that code/LLM analyses may contain inaccuracies, mistakes, or omissions and require independent verification before trading.
20. **PASS** — The Terms state that TikTrack is not an investment adviser and is not registered as one, and that it is not a regulated financial body.

### E. Pilot participation

21. **PASS** — The pilot clause includes cooperation, feedback, bug reporting, no monetary compensation, and experimental-service / changing-functionality disclaimers.

### F. Consent & withdrawal

22. **PASS** — Telegram processing is presented as explicit opt-in only.
23. **PASS** — Telegram withdrawal is accurately described via Settings → התראות → `נתק Telegram`, with immediate effect.
24. **PASS** — Account deletion is accurately described for the current state: email-only request, 30-day handling target, self-service deletion planned.

### G. Hebrew language quality

25. **PASS_WITH_FINDINGS** — The Hebrew is mostly clear, natural, and suitable for Israeli users, with a good balance between legal clarity and product readability.
26. **PARTIAL** — Some terminology should be tightened: prefer `בעל שליטה במאגר מידע` over `בעל מאגר המידע`, prefer `מידע בעל רגישות מיוחדת` over the non-statutory `מידע רגיש במיוחד`, and replace `תקנת GDPR` with `ה-GDPR` / `תקנות הגנת המידע האירופיות`.
27. **PASS** — The overall register is appropriate for Israeli beta users and is more understandable than generic legal boilerplate.

### H. Gaps & recommendations

28. **PARTIAL** — Mandatory/high-value disclosures still missing or weak: retention schedule by data category, backup/log deletion cadence, exact current controller identity, consequences of not providing optional/required data, no-DPO statement if applicable, direct Anthropic DPA/SCC link, confirmation that Sentry scrubbing prevents financial data leakage, exact uPress contracting entity and sensitive-data suitability, and more explicit AI/automated-analysis notice.
29. **PASS_WITH_FINDINGS** — Yes, the documents are adequate for a closed beta pilot of ~50 Israeli users because core privacy, processor, sensitive trading-data, deletion, Telegram consent, and financial-liability disclosures are present; however, this should not be treated as production-ready without attorney review and remediation of the findings above.
30. **PARTIAL** — Before public/commercial launch, TikTrack should establish the legal operator/controller, execute/confirm processor DPAs, add a full retention schedule, implement self-service deletion/export, harden Sentry/AI data minimization controls, revise terminology to match Amendment 13, and obtain Israeli counsel review for privacy and regulated-investment disclaimers.

## 2. Overall verdict

**PASS_WITH_FINDINGS**

The Privacy Policy and Terms of Service are substantially adequate for the stated closed beta pilot, especially compared with the prior source-missing state. They correctly disclose sensitive trading data, processors, Telegram opt-in/withdrawal, deletion process, AI error risk, and the non-advisory/non-trading nature of the service.

The verdict is not a clean PASS because several production-grade legal controls remain incomplete: precise current controller identity, retention periods, DPA/transfer proofing, statutory terminology, and attorney review around unregistered-entity operation and regulated-financial-advice risk.

## 3. Top 3 recommendations

1. **Fix controller/legal-entity identity before broader launch.** Name the current natural person or legal controller responsible during the pilot, and define exactly how/when control will transfer to `מיזו בע"מ` if the service becomes commercial.
2. **Add a retention and deletion schedule.** Add a table by category: account identity data, IBKR trading data, Telegram `chat_id`, Sentry logs/errors, IP hashes, backups, and email logs, including deletion/backup purge timing.
3. **Harden processor and transfer language.** Link Anthropic’s DPA/SCC reference directly, verify Sentry DPF and scrubbing configuration, confirm uPress’s sensitive-data suitability, and state that only minimized trading context is sent to AI processors.

## 4. Legal flags requiring attorney review

- **Unregistered controller risk:** The policy says the service is a private/community initiative and not a registered entity. Counsel should confirm whether a natural person must be named as `בעל שליטה במאגר מידע` for pilot operation.
- **Future entity transition:** The planned move to `מיזו בע"מ` may require notice, assignment, updated controller identity, updated DPAs, and possibly fresh consent depending on the final structure.
- **Investment advice / regulated financial services:** The disclaimers are strong, but Israeli counsel should review them against Israeli investment advice / investment marketing / portfolio-management law, especially because the platform analyzes trades and uses AI.
- **Sensitive financial data to AI processors:** Anthropic processing of trading/P&L data must be contractually and technically limited; confirm commercial/API DPA, retention, model-training exclusion, SCCs, and minimization.
- **Sentry data minimization:** Engineering must prove that Sentry events do not include IBKR account identifiers, trade details, P&L, tokens, Telegram `chat_id`, email, or phone unless strictly necessary and scrubbed.
- **uPress DPA/sensitive-data limitation:** uPress DPA language indicates generic hosting and may discourage storage of sensitive data in customer websites; counsel/architecture should confirm whether SMTP-only use is acceptable and document scope.
- **Breach notification wording:** Israeli PPA guidance refers to immediate reporting of serious incidents. The current 72-hour wording should be tightened.
- **Retention and backups:** The deletion clause lacks backup-retention and legal-hold exceptions; add realistic operational language before inviting more users.
- **AI transparency:** Add a clearer statement that AI outputs are generated by a third-party LLM and are not automated decisions producing legal/financial effects.

## 5. Specific answer to item 29 — adequate for pilot?

**Yes, with findings.**

For a closed Israeli beta pilot of about 50 users, no payment, and explicit user-approved IBKR sync, the documents provide a reasonable protective baseline: they disclose the sensitive nature of trading data, list the processors, explain Telegram opt-in and withdrawal, provide rights/deletion routes, and strongly disclaim trading execution and financial advice.

This adequacy is conditional. The pilot should not expand into public/commercial launch until the legal controller identity, retention schedule, processor DPAs/transfers, Sentry/AI minimization, and statutory Hebrew terminology are corrected and reviewed by Israeli counsel.
