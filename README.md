# 🤖 BotlerChat

> **An AI-First Real-Time Messaging Platform with Integrated Chat Intelligence & Group Utilities.**

BotlerChat is a feature-rich, modern chat application built for seamless communication. It combines real-time multi-user messaging, media sharing, and presence tracking with an integrated AI agent (**Botler AI**) to assist users directly inside one-on-one and group conversations.

---

## 🗝️ Key Features

- 🔐 **Authentication with Secure Cookies** – HTTP-only, secure cookie-based auth flow for safe user sessions.
- 🔌 **Real-Time Messaging via WebSocket** – Instant message delivery powered by Socket.io.
- 💬 **One-on-One & Group Chats** – Create private direct messages or dynamic group rooms effortlessly.
- 👥 **Join & Leave Rooms in Real-Time** – Dynamic group management with instant socket synchronization.
- 🟢 **Online / Offline User Presence** – Real-time status indicators for connected users.
- 💬 **Reply to Specific Messages** – Contextual message threading and reply targeting.
- ⚡ **Real-Time Last Message Updates** – Live preview of the latest activity across all chat rooms.
- 🤖 **Botler AI (Built-in Chat Intelligence)** – AI agent integrated into conversations to answer questions, synthesize context, and assist users.
- 📁 **File Uploads (Cloudinary Integration)** – Media and file sharing with automated cloud storage.
- 🌗 **Light & Dark Mode** – Custom theme switching for optimal user experience.
- 📱 **Fully Responsive UI** – Pixel-perfect layouts adapted for mobile, tablet, and desktop viewports.
- 🎨 **Styled with Tailwind v4 + Shadcn/UI** – Fast, modular, and accessible design components.
- 🧩 **Built with Node.js, MongoDB, React, & TypeScript** – Full-stack type safety and scalable architecture.
- 🚀 **Deployment Ready** – Production-ready build scripts and environment configuration setup.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React with TypeScript
- **Styling:** Tailwind CSS v4, Shadcn/UI, Lucide React
- **Real-Time Client:** Socket.io-client
- **State & Data Fetching:** Axios, React Context API / Zustand

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-Time Server:** Socket.io
- **AI Integration:** Botler AI SDK / API
- **File Storage:** Cloudinary
- **Authentication:** JSON Web Tokens (JWT) via HTTP-Only Cookies

---

## 🚀 Getting Started

Follow these steps to set up BotlerChat locally on your machine.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

---

### Installation

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/your-username/botlerchat.git](https://github.com/your-username/botlerchat.git)
   cd botlerchat


2. **Backend Setup**
```bash
cd server
npm install

```


Create a `.env` file in the `server` directory and configure the environment variables:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/botlerchat
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Botler AI Configuration
BOTLER_AI_API_KEY=your_botler_ai_key

```


3. **Frontend Setup**
```bash
cd ../client
npm install

```


Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

```



---

### Running the Application

1. **Start the Backend Server:**
```bash
cd server
npm run dev

```


2. **Start the Frontend Client:**
```bash
cd client
npm run dev

```


3. Open your browser and navigate to `http://localhost:3000`.

---

## 🗄️ Architecture Overview

```text
  ┌────────────────────────────────────────────────────────┐
  │                   React Client                         │
  │     (Tailwind v4 + Shadcn/UI + Socket.io Client)       │
  └───────────────────────────┬────────────────────────────┘
                              │
             HTTP Requests    │    WebSocket Events
            (REST / Cookies)  │    (Real-Time Messaging)
                              │
  ┌───────────────────────────▼────────────────────────────┐
  │                    Node.js Server                      │
  │              (Express + Socket.io Engine)              │
  └───┬───────────────────────┬────────────────────────┬───┘
      │                       │                        │
      ▼                       ▼                        ▼
┌───────────┐         ┌───────────────┐       ┌─────────────────┐
│  MongoDB  │         │ Botler AI Engine│       │   Cloudinary    │
│ (Database)│         │ (Chat Agent)  │       │ (File Storage)  │
└───────────┘         └───────────────┘       └─────────────────┘

```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to enhance the application.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch```markdown

# BotlerChat 🤖💬

BotlerChat is a feature-rich, real-time messaging platform integrated with intelligent AI capabilities and seamless expense management. Built with a modern full-stack architecture, it delivers a smooth, responsive, and secure experience across desktop and mobile devices.

---

## 🗝️ Key Features

* **Authentication with Secure Cookies:** Secure user authentication powered by HTTP-only cookies and JWTs.
* **Real-Time Messaging via WebSocket:** Instant message delivery and state updates using Socket.io.
* **One-on-One & Group Chats:** Create private direct chats or flexible group conversations.
* **Dynamic Room Management:** Join, leave, and manage group channels seamlessly in real time.
* **Online/Offline User Presence:** Track user availability with active presence indicators.
* **Threaded Replies:** Reply directly to specific messages to keep conversations organized.
* **Real-Time Last Message Updates:** Live updates on conversation previews and unread indicators.
* **Built-in AI Intelligence:** Integrated AI assistant capabilities (Botler AI) to answer queries, summarize discussions, and assist inside chats.
* **Media & File Sharing:** Cloudinary integration for uploading images, documents, and media.
* **Theme Customization:** Seamless toggling between Light and Dark mode.
* **Fully Responsive UI:** Optimized layout for mobile, tablet, and desktop viewports using Tailwind CSS v4 and Shadcn/UI.
* **Deployment Ready:** Clean architecture configured for containerization and cloud deployment.

---

## 🧩 Tech Stack

### Frontend

* **Framework:** React, TypeScript
* **Styling:** Tailwind CSS v4, Shadcn/UI
* **State & Real-Time:** Socket.io Client, React Hooks

### Backend

* **Runtime:** Node.js, Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Real-Time:** Socket.io
* **Storage:** Cloudinary API

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

* [Node.js](https://nodejs.org/) (v18+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)
* Cloudinary Account (for media uploads)

---

### Environment Variables

Create a `.env` file in the root of both your client and server directories:

#### Backend (`/server/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

AI_MODEL_API_KEY=your_ai_api_key

```

#### Frontend (`/client/.env`)

```env
VITE_SERVER_URL=http://localhost:5000

```

---

### Installation & Local Setup

1. **Clone the Repository:**
```bash
git clone https://github.com/your-username/BotlerChat.git
cd BotlerChat

```


2. **Setup Backend:**
```bash
cd server
npm install
npm run dev

```


3. **Setup Frontend:**
```bash
cd ../client
npm install
npm run dev

```


4. Open your browser and navigate to `http://localhost:3000`.

---

## 📱 Application Preview

| Light Mode | Dark Mode |
| --- | --- |
| *Chat interface with active room* | *Dark themed UI with AI agent response* |

---

## 📄 License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).

```

```