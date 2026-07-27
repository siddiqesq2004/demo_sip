# CREDORA FinTech - Local Setup & Testing Guide

This guide provides complete, step-by-step instructions for downloading, installing, and testing the **CREDORA** FinTech application on any local computer.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended) - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)

---

## 🚀 Step 1: Clone the Repository

Open your terminal (PowerShell, Command Prompt, or Terminal) and run:

```bash
git clone https://github.com/siddiqesq2004/demo_sip.git
cd demo_sip
```

---

## ⚙️ Step 2: Install Backend & Frontend Dependencies

The project consists of a **Node.js Express Backend** and a **Vite React Frontend**.

### Terminal 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install node dependencies
npm install
```

### Terminal 2: Frontend Setup
Open a **second terminal window**, navigate to the project directory, and run:
```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install
```

---

## 🟢 Step 3: Run the Local Application

### Terminal 1: Start Backend Server
```bash
cd backend
npm run dev
# Or run: node server.js
```
> **Backend Port**: `http://localhost:5000`  
> *(The backend uses a non-destructive persistent JSON database stored at `backend/database/credora_store.json`. All added data and sub-admins persist across server restarts).*

### Terminal 2: Start Frontend Development Server
```bash
cd frontend
npm run dev
```
> **Frontend URL**: `http://localhost:3000` (or `http://localhost:5173`)

---

## 🔑 Step 4: Login Credentials & Demo Accounts

### 1. Investor User Account (Mobile App)
- **URL**: `http://localhost:3000/login`
- **Email**: `anishp@email.com`
- **Password**: `password123`

### 2. Admin & Sub-Admin Console
- **URL**: `http://localhost:3000/admin/login`

| Name | Email | Password | Role / Access Scope |
| :--- | :--- | :--- | :--- |
| **System Super Admin** | `admin@credora.com` | `admin123` | Full Super Admin Control & Audit Logs |
| **Vijay** | `mdabsdq2004@gmail.com` | `subadmin123` | Support Desk Only (`SUPPORT_AGENT`) |
| **Neha Gupta** | `neha.subadmin@credora.com` | `subadmin123` | Support Desk Only (`SUPPORT_AGENT`) |
| **Siddiqe** | `siddiqesq2004@gmail.com` | `subadmin123` | Payout Approvals Only (`WITHDRAWAL_APPROVER`) |
| **Karan Singh** | `karan.subadmin@credora.com` | `subadmin123` | Payout Approvals Only (`WITHDRAWAL_APPROVER`) |
| **Amit Kumar** | `amit.subadmin@credora.com` | `subadmin123` | Full Access Sub-Admin (`FULL_SUBADMIN`) |

---

## 🧪 Step 5: Recommended Testing Scenarios

### Scenario A: Testing Live Support Desk Auto-Scanning & Smart Re-assignment
1. Open Browser Window 1: Login as **Vijay** (`mdabsdq2004@gmail.com` / `subadmin123`) at `/admin/login`.
2. Toggle Vijay's status to **`Free`**.
3. Open Browser Window 2 (Incognito): Login as **Anish P** (`anishp@email.com` / `password123`) at `/login`.
4. Go to **Profile** -> **Help & Support** -> **24/7 Live Support Chat**.
5. Observe the user chat header:
   - System auto-scans and connects to Vijay: `🟢 Connected to Free Sub-Admin: Vijay`.
6. Type a message `"Hi, when will my returns arrive?"` and send.
   - Vijay's workspace at `/admin/support` receives the message in **real time**.
7. Now switch Vijay's status toggle to **`Busy`** or **`In Work`**.
8. Open Browser Window 3: Login as **Neha Gupta** (`neha.subadmin@credora.com` / `subadmin123`) and set her status to **`Free`**.
9. In Anish's user chat, type a new query: `"I have another question!"`.
   - System auto-scans and re-assigns to Neha: `🟢 Connected to Free Sub-Admin: Neha Gupta`.
   - Neha's console receives the ticket at the **very top** of her `USER HELP REQUESTS` list.
10. Check Vijay's console: Vijay **STILL SEES** his previous chats with Anish P in his column box (0% data loss).

### Scenario B: Mark Support Ticket as Resolved
1. In Neha's or Vijay's chat console, click the green **`Mark as Resolved`** button at the top right of the chat workspace.
2. Observe ticket status updates to `Resolved`.
3. Anish's user modal receives a system resolution message:
   `✅ Support Ticket has been marked as RESOLVED by Official.`

### Scenario C: Payout Approvals Workflow
1. Login as investor **Anish P** at `/login`.
2. Go to **Dashboard** -> **Withdraw** (or **Profile** -> **Bank Details**).
3. Login as sub-admin **Siddiqe** (`siddiqesq2004@gmail.com` / `subadmin123`) at `/admin/login`.
4. Go to **Payout Approvals** tab at `/admin/withdrawals`.
5. Click **Approve Payout**. Notice the audit log records Siddiqe's approval timestamp matching local system time.

### Scenario D: Sub-Admin Creation & Deletion
1. Login as Super Admin (`admin@credora.com` / `admin123`) at `/admin/login`.
2. Go to **Sub-Admins** tab at `/admin/subadmins`.
3. Click **Add New Sub-Admin** to create a custom sub-admin.
4. Click the red **Delete** button next to any sub-admin to remove them.
5. Restart the backend server (`Ctrl+C` then `npm run dev`).
6. Refresh the page: All newly created sub-admins and changes remain **100% saved in the backend JSON database**.

---

## 🛠️ Troubleshooting

- **CORS / Port Conflict**: Ensure backend is running on `http://localhost:5000` and frontend on `http://localhost:3000`.
- **Data Reset**: If you ever want to reset the database to factory seed defaults, delete `backend/database/credora_store.json` and restart the backend server.
