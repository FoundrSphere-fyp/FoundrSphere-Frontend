# FoundrSphere - Frontend

<div align="center">
  
**AI-Powered Entrepreneurial Hub**

*Empowering early-stage founders to build, validate, and scale their ventures*

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## 🎯 Overview

FoundrSphere's frontend provides a seamless, cross-platform experience for entrepreneurs, enabling them to:
- Find compatible co-founders through AI-driven matchmaking
- Connect with relevant investors based on stage, industry, and funding needs
- Validate startup ideas using AI-powered evaluation
- Collaborate through discussion forums, private messaging, and interest-based groups
- Access virtual events and workshops with industry experts

---

## ✨ Features

### Core Features
- **User Authentication & Profile Management**: Secure registration, login, and customizable user profiles
- **Co-Founder Matchmaking**: AI-powered recommendations based on skills, vision, and complementary expertise
- **Investor Discovery**: Connect with investors aligned to your startup stage, industry, and funding requirements
- **Startup Idea Evaluation**: Submit ideas and receive AI-driven feedback on market opportunity, competition, and feasibility
- **Community Engagement**: 
  - Discussion forums for knowledge exchange
  - Private messaging for direct communication
  - Interest-based groups for niche collaboration
- **Events & Workshops**: Virtual events with industry mentors and expert-led sessions
- **Real-time Notifications**: Stay updated with Socket.io-powered live updates

### UI/UX Features
- Responsive design optimized for desktop, tablet, and mobile
- Dark mode support
- Accessibility-compliant interface
- Smooth animations and transitions
- Progressive Web App (PWA) capabilities

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js | Server-side rendering, routing, and optimized web performance |
| **Styling** | Tailwind CSS | Utility-first CSS for responsive and modern designs |
| **State Management** | React Context API / Redux Toolkit | Global state management |
| **API Client** | Axios | HTTP client for API communication |
| **Real-time** | Socket.io Client | Bidirectional communication for chat and notifications |
| **Forms** | React Hook Form | Performant form validation and management |
---

---

## 📦 Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm** or **yarn**: Latest stable version
- **Git**: For version control

For mobile development:
- **React Native CLI**: Install globally
- **Xcode**: (macOS only) for iOS development
- **Android Studio**: For Android development

---

## 🚀 Installation

### Web Application

```bash
# Navigate to web directory
cd frontend

# Install dependencies
npm install
# or
yarn install
```


---

## 🏃 Running the Application

### Web Application

**Development Mode:**
```bash
npm run dev
# or
yarn dev
```
The application will be available at `http://localhost:3000`

**Production Build:**
```bash
npm run build
npm run start
# or
yarn build
yarn start
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the web directory and `.env` file in the mobile directory:

### Web (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# Authentication
NEXT_PUBLIC_JWT_SECRET=your_jwt_secret_key

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# External Services (if any)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

---