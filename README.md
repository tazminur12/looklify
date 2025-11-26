# 🌟 Looklify - Premium Beauty & Skincare E-commerce Platform

<div align="center">

![Looklify Logo](https://img.shields.io/badge/Looklify-Premium%20Beauty-purple?style=for-the-badge&logo=sparkles)

**Your premium destination for beauty and skincare products**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-looklify.vercel.app-blue?style=for-the-badge&logo=vercel)](https://looklify.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.14-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

## ✨ Overview

Looklify is a modern, responsive e-commerce platform designed specifically for beauty and skincare products. Built with Next.js 15 and React 19, it offers a seamless shopping experience with advanced features like user authentication, product management, and a comprehensive admin dashboard.

### 🎯 Key Features

- **🛍️ E-commerce Store**: Complete shopping experience with product categories and search
- **👤 User Authentication**: Secure login/signup with Firebase integration
- **📊 Admin Dashboard**: Comprehensive analytics and store management
- **🎨 Modern UI/UX**: Beautiful design with dark/light theme support
- **📱 Responsive Design**: Optimized for all devices
- **⚡ Performance**: Built with Next.js 15 and Turbopack for blazing fast performance
- **🔒 Security**: Secure authentication and data handling

## 🚀 Live Demo

**Experience Looklify live**: [looklify.vercel.app](https://looklify.vercel.app)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **DaisyUI 5.2.3** - Component library for Tailwind CSS

### Backend & Database
- **Firebase 12.4.0** - Authentication and real-time database
- **MongoDB with Mongoose 8.19.1** - Database management
- **NextAuth.js 4.24.11** - Authentication library

### Development Tools
- **Turbopack** - Ultra-fast bundler
- **ESLint 9** - Code linting
- **PostCSS** - CSS processing
- **React Hook Form 7.65.0** - Form management
- **Axios 1.12.2** - HTTP client

## 📦 Product Categories

- 🧴 **Skin Care** - Premium facial treatments and moisturizers
- 💇‍♀️ **Hair Care** - Professional hair products and treatments
- 💄 **Lip Care** - Nourishing lip balms and treatments
- 👁️ **Eye Care** - Specialized eye creams and serums
- 🧽 **Body Care** - Body lotions, scrubs, and treatments
- ✨ **Facial Care** - Advanced facial treatments and masks
- 🦷 **Teeth Care** - Oral hygiene and whitening products
- 🌿 **Health & Beauty** - Natural and organic beauty solutions

## 🏗️ Project Structure

```
looklify/
├── src/
│   └── app/
│       ├── components/          # Reusable UI components
│       │   ├── AuthForm.js      # Authentication forms
│       │   ├── Header.js        # Navigation header
│       │   ├── Footer.js        # Site footer
│       │   └── ThemeToggle.js   # Dark/light theme toggle
│       ├── contexts/            # React contexts
│       │   └── ThemeContext.js  # Theme management
│       ├── dashboard/           # Admin dashboard
│       │   ├── layout.js        # Dashboard layout
│       │   └── page.js          # Dashboard main page
│       ├── login/               # User login page
│       ├── signup/              # User registration page
│       ├── shop/                # Product catalog
│       ├── forgot-password/     # Password reset
│       ├── globals.css          # Global styles
│       └── layout.js            # Root layout
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
└── README.md                    # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/looklify.git
   cd looklify
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   FIREBASE_API_KEY=your-firebase-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   MONGODB_URI=your-mongodb-connection-string
   
   # Email Configuration (for password reset)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   # OR use these alternative variable names:
   # GMAIL_USER=your-email@gmail.com
   # GMAIL_APP_PASSWORD=your-gmail-app-password
   ```
   
   **📧 Setting up Gmail for Password Reset Emails:**
   
   1. Go to your [Google Account](https://myaccount.google.com/)
   2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
   3. Scroll down to **App passwords**
   4. Click **Select app** → Choose "Mail"
   5. Click **Select device** → Choose "Other (Custom name)" → Enter "Looklify"
   6. Click **Generate** to get your 16-character App Password
   7. Copy the App Password and use it as `EMAIL_PASS` or `GMAIL_APP_PASSWORD` in your `.env.local`
   
   ⚠️ **Important**: Use the App Password (not your regular Gmail password) for security.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🎨 Features Showcase

### 🏠 Homepage
- Hero section with compelling call-to-action
- Featured product categories with interactive cards
- Statistics showcase (10K+ customers, 500+ products)
- Responsive grid layout with hover effects

### 🛍️ Shopping Experience
- Advanced product search with category filtering
- Product categorization and filtering
- Shopping cart functionality
- Secure checkout process

### 👤 User Management
- User registration and login
- Password reset functionality
- User profile management
- Secure authentication with Firebase

### 📊 Admin Dashboard
- Real-time sales analytics
- Order management system
- Product inventory tracking
- Customer insights and statistics
- Quick action buttons for common tasks

### 🎨 Design System
- Consistent purple and pink gradient theme
- Dark/light mode support
- Responsive design for all screen sizes
- Modern glassmorphism effects
- Smooth animations and transitions

## 🌐 Deployment

The application is deployed on Vercel and can be accessed at [looklify.vercel.app](https://looklify.vercel.app).

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push

## 🤝 Contributing

We welcome contributions to Looklify! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Sohan** - Lead Developer & Designer

## 📞 Support

For support, email support@looklify.com or create an issue in the GitHub repository.

## 🔗 Links

- **Live Demo**: [looklify.vercel.app](https://looklify.vercel.app)
- **GitHub Repository**: [github.com/your-username/looklify](https://github.com/your-username/looklify)
- **Documentation**: [docs.looklify.com](https://docs.looklify.com)

---

<div align="center">

**Made with ❤️ for beauty enthusiasts worldwide**

![GitHub stars](https://img.shields.io/github/stars/your-username/looklify?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/looklify?style=social)

</div>