# 🐾 VetCare - Veterinary Clinic Management Platform

A full-stack veterinary clinic management system built with the MERN stack (MongoDB, Express.js, React, Node.js). VetCare helps veterinary clinics digitize pet health records, manage appointments, handle billing, and streamline staff operations.

## 🚀 Live Demo

**Frontend:** https://vetcare-mern-website-2.onrender.com

**Backend API:** https://vetcare-mern-website-1.onrender.com

---

## 📋 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Vet, Nurse, Receptionist)
- Secure login and registration

### 🐶 Pet Management
- Add, view, update, and delete pet records
- Store medical history and treatment details
- Advanced pet search functionality

### 📅 Appointment Scheduling
- Create and manage appointments
- Real-time appointment status updates
- View appointments by date, doctor, or status

### 👨‍⚕️ Staff Management
- Manage staff profiles (Doctors, Nurses, Receptionists)
- Role-based permissions
- Staff availability tracking

### 💰 Billing & Invoices
- Generate invoices for services
- Track payment status
- Billing history

### 📊 Reports & Analytics
- Dashboard with key metrics
- Appointment statistics
- Revenue reports

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Context API (State Management)
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- JWT Authentication

---

## 📁 Project Structure
VETCARE-MERN-WEBSITE/
│
├── backend/
│ ├── models/
│ │ ├── User.js # User schema (Doctor, Nurse, Receptionist)
│ │ ├── PetRecord.js # Pet medical records
│ │ ├── Appointment.js # Appointment scheduling
│ │ └── Billing.js # Billing and invoices
│ │
│ ├── routes/
│ │ ├── auth.js # Authentication routes
│ │ ├── petrecords.js # Pet CRUD operations
│ │ ├── appointments.js # Appointment management
│ │ ├── staff.js # Staff management
│ │ ├── billing.js # Billing operations
│ │ └── reports.js # Analytics and reports
│ │
│ ├── middleware/
│ │ ├── auth.js # JWT verification
│ │ └── roleCheck.js # Role-based authorization
│ │
│ ├── server.js # Entry point
│ ├── .env # Environment variables
│ ├── package.json
│ └── seed.js # Demo data seeder
│
├── frontend/
│ ├── public/
│ │ └── index.html
│ │
│ ├── src/
│ │ ├── components/
│ │ │ ├── Layout.js # Main layout with sidebar
│ │ │ ├── Login.js # Authentication
│ │ │ ├── Register.js # User registration
│ │ │ ├── Dashboard.js # Home page with stats
│ │ │ ├── PetRecords.js # Pet management
│ │ │ ├── Appointments.js # Appointment scheduling
│ │ │ ├── Staff.js # Staff management
│ │ │ ├── Billing.js # Billing system
│ │ │ ├── Reports.js # Analytics dashboard
│ │ │ └── PrivateRoute.js # Protected routes
│ │ │
│ │ ├── context/
│ │ │ └── AuthContext.js # Authentication context
│ │ │
│ │ ├── App.js # Main component
│ │ ├── index.js # Entry point
│ │ └── index.css # Tailwind styles
│ │
│ ├── package.json
│ ├── tailwind.config.js
│ └── postcss.config.js
│
├── .gitignore
└── README.md
