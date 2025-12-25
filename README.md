# Image Gallery Application

A full-stack image gallery application with authentication, image management, and drag & drop functionality.

## Features
### Authentication

- User registration & login
- Password reset via email
- JWT token authentication

### Image Management

- Single & bulk image upload
- Drag & drop reordering
- Edit image title & file
- Delete single/multiple images
- Selection mode for batch operations

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, JWT, Multer
- **Frontend:** React, Vite, Tailwind CSS, @dnd-kit, Axios

## Quick Start
1. Prerequisites

- Node.js (v16+)
- MongoDB (local or cloud)
- npm / yarn

2. Backend Setup
```bash
cd backend
npm install
cp .env
# Edit .env with your MongoDB URI
npm run dev
```

3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

4. Environment Variables
**Backend (.env)**
```bash
MONGODB_URI=mongodb://localhost:27017/image_gallery
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:5000/api
VITE_BASE_URL=http://localhost:5000
```

5. Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## API Endpoints

### Auth Routes

- POST /auth/register – Register user
- POST /auth/login – Login user
- POST /auth/forgot-password – Reset password request
- POST /auth/reset-password – Reset password

### Image Routes (Protected)

- GET /images – Get all images
- POST /images/upload – Upload single image
- POST /images/bulk-upload – Upload multiple images
- PUT /images/:id – Update image
- DELETE /images/:id – Delete image
- PUT /images/rearrange/order – Rearrange images


**Built with MERN stack** • [Live Demo](https://image-hub-iota.vercel.app/)
