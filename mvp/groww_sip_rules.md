# Groww SIP rules used by the MVP

Checked on 3 Nov 2026 against Groww's public help pages. The assistant may only state rules from this file. Anything marked **Unverified** must be answered with a fallback ("I couldn't confirm this; check the SIP details screen or Groww support").

| # | Rule | Source | Confidence |
|---|---|---|---|
| R1 | You can skip only **one instalment at a time**. After that skipped date passes, you can request another skip. | [Max skip period](https://groww.in/help/mutual-funds/mf-sip/what-is-the-maximum-period-for-which-i-can-skip-my-sip-installments--63) | Verified |
| R2 | If the next instalment is **within 2 days**, a skip request won't apply to it; it applies from the following instalment. | [How to skip](https://groww.in/help/mutual-funds/mf-sip/how-to-skip-an-sip-instalment--79) | Verified |
| R3 | A SIP is **automatically cancelled after 3 skipped or missed instalments in a row**. | [How to skip](https://groww.in/help/mutual-funds/mf-sip/how-to-skip-an-sip-instalment--79) | Verified |
| R4 | Groww's "pause" is the **Skip instalment** option (one month at a time). There is no open-ended pause. | [Pause SIP](https://groww.in/help/mutual-funds/order/can-i-pause-sip-for-next-month) | Verified |
| R5 | You can **change the SIP amount or date** any time. If the next instalment is **within 2 working days**, the change applies only to later instalments. | [Change date or amount](https://groww.in/help/mutual-funds/mf-sip/how-to-change-sip-date-or-amount), [When can I edit](https://groww.in/help/mutual-funds/discoverable/when-can-i-edit-my-sip--29) | Verified |
| R6 | Edits to a SIP created **the same day** can take up to 2 days to process. | [When can I edit](https://groww.in/help/mutual-funds/discoverable/when-can-i-edit-my-sip--29) | Verified |
| R7 | **Cancelling stops future instalments; money already invested stays invested** until you redeem it separately. | [Cancel SIP](https://groww.in/help/mutual-funds/mf-sip/how-to-cancel-my-sip) | Verified |
| R8 | You **can't cancel if the next instalment is due within 7 days**. | [Cancel SIP](https://groww.in/help/mutual-funds/mf-sip/how-to-cancel-my-sip) | Verified |
| R9 | A cancellation request **can't be undone**; to invest again you start a new SIP. | [Cancel SIP](https://groww.in/help/mutual-funds/mf-sip/how-to-cancel-my-sip) | Verified |
| R10 | Groww asks for a **cancellation reason** and charges nothing to cancel (no fee mentioned). | [Cancel SIP](https://groww.in/help/mutual-funds/mf-sip/how-to-cancel-my-sip) | Verified (no fee stated) |
| R11 | **Groww charges nothing for a failed SIP order.** Your **bank may charge** an ECS/autopay rejection fee; the amount varies by bank. | [ECS charges](https://groww.in/help/mutual-funds/mf-autopay/what-are-ecs-charges--96) | Verified; amount unknown |
| R12 | After a failed autopay, you can pay the **pending SIP** from the dashboard: Pending SIP → Pay → choose a payment method. | [Pay after autopay failed](https://groww.in/help/mutual-funds/mf-sip/how-do-i-pay-for-my-sip-installment-if-the-autopay-debit-has-failed--40) | Verified |
| R13 | Paying **after the date shown** on a pending SIP means the instalment is **treated as failed**. You can still invest that month with a **one-time** investment in the same fund. | [Paying after the date shown](https://groww.in/help/mutual-funds/mf-dashboard/what-happens-if-i-pay-after-date-shown-on-pending-sip--42) | Verified |
| R14 | Failure reasons Groww lists: **insufficient balance; AutoPay not set up, expired or rejected; payment not completed; KYC/PAN/details mismatch; scheme closed or limit reached**; compliance stops. | [Why did my instalment fail](https://groww.in/help/mutual-funds/order/why-did-my-sip-installment-fail--36) | Verified |
| R15 | Debits happen on the SIP date and can take until end of day; units can take **5–6 business days** to show. | [Confirm deduction](https://groww.in/help/mutual-funds/order/how-can-i-confirm-if-my-sip-instalment-was-deducted-successfully--18) | Verified |
| U1 | Whether Groww or the bank **retries** a failed autopay debit. | Not stated in help pages | **Unverified** |
| U2 | Exact **bank bounce charge** amounts. | Bank-specific | **Unverified** |
| U3 | Some fund houses **don't allow skipping** (reported by users, e.g. a gold fund). | User report in discovery data (#80) | **Unverified** |
| U4 | Whether a failed instalment counts toward the 3-in-a-row rule exactly like a skip. Help page says "skip or miss", so yes, but timing details are not stated. | R3 wording | Partly verified |
