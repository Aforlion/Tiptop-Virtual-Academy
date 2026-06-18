# 👨‍👩‍👧 Parent Journey — Testing Guide
### Tiptop Virtual Academy | Prepared by JBK Technologies

---

> [!IMPORTANT]
> **Getting Started**
> - **Role:** Parent
> - You will need to **create your own account** by clicking **Sign Up** on the website.
> - Choose **"Parent"** as your role during sign-up.
> - **Website:** [http://localhost:3000](http://localhost:3000) *(or the live link from your admin)*

---

## 🗺️ Your Navigation Menu

Once you log in as a Parent, you will see these sections:

| Menu Item | What It Does |
|---|---|
| **Dashboard** | Your home screen — add children, book classes, view bookings |
| **Catalog** | Browse all available courses and sessions |
| **Billing** | Buy credits and view your transaction history |
| **Reports** | See your child's learning progress and assessment results |

---

## ✅ Parent Testing Checklist

Go through each task in order. Tick them off as you complete them!

---

### 📝 Step 1 — Create Your Account

- [ ] **1.1** Go to the website and click **"Sign Up"**.
- [ ] **1.2** Fill in your name, email address, and a password.
- [ ] **1.3** Select **"Parent"** as your account type.
- [ ] **1.4** Click **"Create Account"**.
- [ ] **1.5** ✅ Confirm you are redirected to the **Parent Dashboard**.
- [ ] **1.6** ✅ Confirm your name appears in the welcome heading (e.g. *"Welcome, Sarah!"*).
- [ ] **1.7** ✅ Confirm you can see your **credit balance** in the top right corner of the dashboard.
  - *(New parents receive 10 free starter credits automatically!)*

---

### 🧒 Step 2 — Adding a Child Profile

*You need to add your child's profile before you can book any classes for them.*

- [ ] **2.1** On the Dashboard, find the **"Add a New Child"** form on the left side.
- [ ] **2.2** Fill in your child's **first name** and **date of birth**.
  - *(Tip: Use a birthdate that makes the child 5 years old to test the Junior dashboard)*
  - *(e.g. If today is 2026, use birthday: 2021-03-10)*
- [ ] **2.3** Click **"Add Child"**.
  - ✅ Confirm your child's profile card appears on the dashboard.
- [ ] **2.4** Add a **second child**, this time using a birthdate that makes them **9 years old**.
  - ✅ Confirm both children now appear on your dashboard with their names.

---

### 📖 Step 3 — Exploring the Course Catalog

- [ ] **3.1** Click **"Catalog"** in the left menu.
- [ ] **3.2** ✅ Confirm you can see a list of available courses with age ranges shown.
- [ ] **3.3** Use the **age filter** buttons (Junior / Senior) to filter courses.
  - ✅ Confirm the course list changes based on which filter you select.

---

### 📅 Step 4 — Booking a Class for Your Child

*Flexible sessions use credits. Each booking costs 1 credit.*

- [ ] **4.1** Go back to the **Dashboard**.
- [ ] **4.2** Find the **"Book a Session"** form on the right side of the dashboard.
- [ ] **4.3** Select a **child** from the dropdown list.
- [ ] **4.4** Select an **available session** from the sessions dropdown.
- [ ] **4.5** Click **"Book Session"**.
  - ✅ Confirm a success message appears.
  - ✅ Confirm the booking appears in the **"Active Bookings"** table below.
  - ✅ Confirm your **credit balance** has gone down by 1.

---

### 🧒 Step 5 — Entering the Student View

*This is how your child will experience the platform.*

- [ ] **5.1** On the Dashboard, find your child's profile card.
- [ ] **5.2** Click the **"Enter Student Dashboard"** button on the child's card.
  - ✅ Confirm you are taken to a colourful, child-friendly screen.
  - For a **5-year-old**: the screen should be bright and playful with rounded bubbles.
  - For a **9-year-old**: the screen should have a darker, space/sci-fi look.
- [ ] **5.3** ✅ Confirm the upcoming class is shown with a countdown timer and teacher name.
- [ ] **5.4** Click **"Return to Parent Room"** to come back to the parent dashboard.

---

### 💳 Step 6 — Buying More Credits

*Credits are used to book flexible sessions. You can top up anytime.*

- [ ] **6.1** Click **"Billing"** in the left menu.
- [ ] **6.2** ✅ Confirm you can see **credit packages** with different amounts and prices.
- [ ] **6.3** Click on a package (e.g. *"5 Credits — ₦5,000"*).
  - ✅ Confirm a payment flow begins *(in testing, you do not need to complete a real payment — just confirm the button works and the page loads)*.

---

### ❌ Step 7 — Cancelling a Booking

*If your child can no longer attend, you can cancel and get your credit refunded.*

- [ ] **7.1** Go back to the **Dashboard**.
- [ ] **7.2** In the **Active Bookings** table, find the booking you made in Step 4.
- [ ] **7.3** Click the **"Cancel"** button next to the booking.
  - ✅ Confirm a confirmation prompt appears.
  - ✅ Confirm after cancelling, your **credit balance goes back up by 1**.
  - ✅ Confirm the booking disappears from the table.

---

### 📊 Step 8 — Viewing Progress Reports

- [ ] **8.1** Click **"Reports"** in the left menu.
- [ ] **8.2** ✅ Confirm you can see a progress summary for your children.
- [ ] **8.3** ✅ Confirm you can see any quiz results or assessment scores (may be empty if no assessments have been taken — that is fine).

---

## 🐞 Reporting Issues

If anything doesn't work as expected, please note:
1. Which **page** you were on (e.g. *"Dashboard → Book a Session"*)
2. What **button you clicked**
3. What **happened** (error message or unexpected result)
4. A **screenshot** if possible *(press Windows Key + Shift + S)*

Send your report to your administrator at JBK Technologies.

---

*Guide prepared by JBK Technologies | Tiptop Virtual Academy*
