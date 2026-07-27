# CREDORA FinTech Platform - Full Architecture & Feature Report

## 1. Executive Summary
**CREDORA** is an enterprise-grade FinTech investment and daily returns management ecosystem. It provides investors with a high-yield 22-day compounding growth cycle engine, seamless payout withdrawals, real-time local timestamps, and an intelligent Live Support Desk equipped with dynamic sub-admin status auto-scanning and load balancing.

---

## 2. Core Platform Capabilities & Architecture

### 🛡️ A. Role-Based Access Control (RBAC) & Scope Scoping
The platform distinguishes between **Investor Users**, **Dedicated Sub-Admins**, and **Super Admins**:
1. **Investor Users**: Access high-yield growth plans, track 22-day compounding cycles, request bank payouts, and chat live with assigned support specialists.
2. **Support Agents (`SUPPORT_AGENT`)**:
   - **Vijay** (`mdabsdq2004@gmail.com`)
   - **Neha Gupta** (`neha.subadmin@credora.com`)
   - Restricted to the **Live Support Desk Console** (`/admin/support`).
3. **Withdrawal Approvers (`WITHDRAWAL_APPROVER`)**:
   - **Siddiqe** (`siddiqesq2004@gmail.com`)
   - **Karan Singh** (`karan.subadmin@credora.com`)
   - Restricted to the **Payout Approval Workflow** (`/admin/withdrawals`).
4. **Full Access Sub-Admin (`FULL_SUBADMIN`)**:
   - **Amit Kumar** (`amit.subadmin@credora.com`)
5. **System Super Admin**:
   - `admin@credora.com` (Full system audit logs, user management, and sub-admin creation/deletion).

---

### 💬 B. Live Support Desk Auto-Scanning & Smart Re-Assignment
- **Dynamic Auto-Scanning**: When an investor opens support chat or sends a query, the backend automatically scans all active support specialists (**Vijay** & **Neha**). If an official has set their status toggle to **`Free`**, the system instantly connects the user to them and displays:
  `🟢 Connected to Free Sub-Admin: Vijay` (or `Neha Gupta`).
- **Busy / In Work Rule**: If the assigned sub-admin switches status to **`Busy`** or **`In Work`**, new incoming queries automatically re-scan and route to an available `Free` specialist.
- **Previous Works Preservation**: Even when Vijay or Neha sets their status to `Busy`, **all previous chats they handled or resolved remain 100% visible in their column box** (zero data loss).
- **Mark as Resolved Workflow**: Sub-admins can click **Mark as Resolved** to close a ticket, log the resolution in audit records, and notify the user.

---

### 💰 C. Compounding Growth Cycles & Payouts
- **22-Day Compounding Engine**: Daily returns (1.00% to 1.22% daily) credited automatically every working day (Mon-Fri).
- **Withdrawals & Bank Accounts**: Direct payout requests to verified primary bank accounts (HDFC, ICICI, etc.) with real-time local timestamps (`YYYY-MM-DD HH:mm:ss`).

---

### 💾 D. Non-Destructive Persistent Backend Store
- The backend relies on a persistent JSON file database located at `backend/database/credora_store.json`.
- All newly added sub-admins (Vijay, Siddiqe, etc.), updated statuses, user portfolios, and chat logs are **preserved across terminal restarts**. Seeding routines verify existing data non-destructively before inserting defaults.

---

## 3. Registered Test Accounts & Credentials

| Role | Name | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Investor** | Anish P | `anishp@email.com` | `password123` | Investor App (`/`) |
| **Super Admin** | System Super Admin | `admin@credora.com` | `admin123` | Full Super Console (`/admin`) |
| **Sub-Admin** | Vijay | `mdabsdq2004@gmail.com` | `subadmin123` | Live Support Desk Only |
| **Sub-Admin** | Neha Gupta | `neha.subadmin@credora.com` | `subadmin123` | Live Support Desk Only |
| **Sub-Admin** | Siddiqe | `siddiqesq2004@gmail.com` | `subadmin123` | Payout Approvals Only |
| **Sub-Admin** | Karan Singh | `karan.subadmin@credora.com` | `subadmin123` | Payout Approvals Only |
| **Sub-Admin** | Amit Kumar | `amit.subadmin@credora.com` | `subadmin123` | Full Access Sub-Admin |

---

## 4. End-to-End Workflow Examples

### Example 1: Support Desk Assignment & Resolution
1. Vijay logs in at `/admin/login` and sets status to **`Free`**.
2. User Anish opens support chat: `Connected to Free Sub-Admin: Vijay`.
3. Anish sends message `"Need help with payout"`. Vijay receives it live.
4. Vijay clicks **Mark as Resolved**. Ticket status becomes `Resolved`.
5. Vijay sets status to **`Busy`**. Neha sets status to **`Free`**.
6. Anish sends new query: System auto-scans and connects Anish to **Neha Gupta**.
7. Vijay checks his dashboard while `Busy`: Vijay **still sees his previous chat** with Anish.

### Example 2: Payout Request & Approval
1. Anish requests withdrawal of ₹18,920.00 to HDFC Bank.
2. Siddiqe logs in at `/admin/login` (`WITHDRAWAL_APPROVER`).
3. Siddiqe views pending payouts at `/admin/withdrawals` and clicks **Approve**.
4. Real-time audit log records: `Siddiqe approved ₹18,920.00 payout to Anish P`.
