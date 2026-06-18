# 🎓 Tiptop Virtual Academy — Client Testing Guide
### For: Barbara Olajide | Role: Administrator
### Prepared by: JBK Technologies

---

> [!IMPORTANT]
> **Your Login Details**
> - **Email:** olabarbery1@gmail.com
> - **Temporary Password:** *(sent separately via secure message)*
> - **Website:** [http://localhost:3000](http://localhost:3000) *(or your live URL when deployed)*
>
> Please change your password after first login via your account settings.

---

## 🗺️ How To Navigate

Once you log in, you will be taken to the **Admin Dashboard** automatically. Think of it like a control room — everything you need to run the school is right there.

You will see a **left sidebar** with links to all the different sections:

| Section | What It Does |
|---|---|
| **Dashboard** | Overview of all live sessions and courses |
| **Users** | Create teacher accounts |
| **Courses** | Add and manage school curricula |
| **Sessions** | Schedule live classroom meetings |
| **Finance** | View teacher earnings and credit ledgers |
| **Community** | Post announcements in school forums |
| **Certificates** | Design award certificates per course |

---

## ✅ Your Testing Checklist

Work through these tasks in order. Each one tests a different part of the platform. **Tick them off as you go!**

---

### 🏫 SECTION 1 — Setting Up the School (Admin Panel)

- [ ] **1.1** Log in at the website using your email and password.
- [ ] **1.2** On the **Dashboard**, confirm you can see a list of upcoming sessions and courses.
- [ ] **1.3** Go to **Courses** → Click **"Create New Course"**.
  - Fill in a course title (e.g. *"Introduction to Planets"*)
  - Set the age range (e.g. Min Age: 7, Max Age: 12)
  - Click **Save**. ✅ Confirm the course appears in the list.
- [ ] **1.4** Go to **Sessions** → Click **"Schedule New Session"**.
  - Select your newly created course.
  - Set a date and time for the class (any time in the future).
  - Set the session type to **Flexible**.
  - Click **Save**. ✅ Confirm the session appears in the schedule.
- [ ] **1.5** Go to **Users** → Click **"Create Teacher Account"**.
  - Enter a teacher's name and email (you can use a test email).
  - Click **Create**. ✅ Confirm the teacher account is created.
- [ ] **1.6** Go to **Certificates** → Pick a course and fill in the certificate details:
  - Title, body text, and signatory name (e.g. *"Ms. Barbara Olajide, Principal"*).
  - Click **Save Template**. ✅ Confirm the certificate design is saved.

---

### 👨‍👩‍👧 SECTION 2 — The Parent Experience

*For this section, open a different browser (e.g. Edge or Firefox) and register a new parent account.*

- [ ] **2.1** Open a **new/private browser window**. Go to the website and click **Sign Up**.
  - Register as a **Parent** (choose Parent role during signup).
- [ ] **2.2** Once logged in, go to the **Parent Dashboard**.
  - ✅ Confirm you can see a credit balance and a children section.
- [ ] **2.3** Click **"Add Child"** and fill in your child's name and date of birth.
  - Use a birthdate that makes the child **8 years old** (to test the Senior dashboard).
  - ✅ Confirm the child profile appears.
- [ ] **2.4** Click **"Go to Class Catalog"** or **Catalog** in the menu.
  - ✅ Confirm you can see the available courses.
- [ ] **2.5** Click **"Billing"** in the menu.
  - ✅ Confirm you can see credit package options to purchase.
- [ ] **2.6** Click **"Reports"** in the menu.
  - ✅ Confirm you can see the child progress/analytics section.

---

### 🧒 SECTION 3 — The Student Experience

- [ ] **3.1** From the Parent Dashboard, click **"Enter Student View"** for your child.
  - ✅ Confirm the **colourful, age-adapted student dashboard** loads.
  - The dashboard should look fun and playful (not the dark admin look).
- [ ] **3.2** Look for an upcoming class near the top of the page.
  - ✅ Confirm it shows the class name, teacher, and a countdown timer.
- [ ] **3.3** Click **"Check-In to Playground"** (the orange button).
  - ✅ Confirm you can see a list of classmates' check-in statuses.
  - ✅ Confirm a countdown timer appears before the session opens.
- [ ] **3.4** Click **"Play Test Bell"** to test the school bell notification sound.
  - ✅ Confirm you hear a short chime sound.
- [ ] **3.5** Scroll down and look for the **XP Bar** and **Challenges** section.
  - ✅ Confirm you can see your XP score and any active challenges.
- [ ] **3.6** Go to **Assessments** (if visible in the student menu).
  - ✅ Confirm you can see a quiz to start.
  - Try answering some questions and clicking **Submit**.
  - ✅ Confirm you see a score results page with your percentage.
- [ ] **3.7** Go to **Certificates** in the student menu.
  - ✅ Confirm you can see any earned certificates for completed courses.

---

### 👩‍🏫 SECTION 4 — The Teacher Experience

*For this section, log in using the teacher account you created in Step 1.5.*

- [ ] **4.1** Open a **new/private browser window**. Log in with the teacher email and temporary password.
- [ ] **4.2** ✅ Confirm you are taken to the **Teacher Dashboard** (not the Admin or Parent dashboard).
- [ ] **4.3** Click **"My Classes"** or **Classes** in the menu.
  - ✅ Confirm you can see scheduled sessions assigned to you.
- [ ] **4.4** Click **"Availability"** in the teacher menu.
  - Add an availability block (e.g. Monday, 9:00 AM – 11:00 AM).
  - ✅ Confirm the slot is saved.
  - Try adding an overlapping time slot and confirm the system **rejects** it with an error.
- [ ] **4.5** Click **"My Earnings"** in the teacher menu.
  - ✅ Confirm you can see an earnings ledger (may be empty for a new account — that is fine).
- [ ] **4.6** Click **"Lesson Plans"** or **Lessons** in the teacher menu.
  - Try creating a new lesson plan for a course.
  - ✅ Confirm the lesson plan is saved.

---

### 🌐 SECTION 5 — Community & Forums

*You can do this from any account — admin, parent, or teacher.*

- [ ] **5.1** Click **"Community"** in the navigation menu.
  - ✅ Confirm you can see forum channels (e.g. General, Announcements).
- [ ] **5.2** Click into a channel and write a post.
  - ✅ Confirm the post appears in the forum thread.
- [ ] **5.3** Reply to an existing post.
  - ✅ Confirm the reply is visible under the original post.

---

## 🐞 How to Report Issues

If something does not look right or does not work, please note down:

1. **What page** you were on (e.g. *"Parent Dashboard → Add Child"*)
2. **What you clicked or typed**
3. **What happened** (e.g. *"Error message appeared"* or *"Nothing happened"*)
4. **A screenshot** if possible — on Windows, press **Windows Key + Shift + S** to take a screenshot

Send your notes to the JBK Technologies team and we will fix it right away.

---

## 📞 Need Help?

If you get stuck at any point, don't worry — just reach out and we will walk you through it live.

---

> [!NOTE]
> **Admin Account Setup Steps** (for the JBK team to complete before handing to Barbara)
>
> 1. Go to the Supabase Dashboard → Authentication → Users → **Invite User** with email `olabarbery1@gmail.com`
> 2. Once she accepts the invitation email and sets her password, run the file `supabase/migrations/seed_admin_barbara.sql` in the Supabase SQL Editor to upgrade her role to **admin**.
> 3. Share login credentials securely (do **not** send the password in plain email).

---

*Document prepared by JBK Technologies — Tiptop Virtual Academy Client Testing Programme*
*Date: 2026-06-18*
