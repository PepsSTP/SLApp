# Full-Stack TypeScript Application

A modern full-stack web application built with TypeScript, featuring a React frontend and Node.js/Express backend.

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Morgan** - HTTP request logger

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Git**

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd fullstack-ts-project
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
```

Edit `.env` and configure your settings:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend
```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3001
```

## 🏃 Running the Application

### Development Mode

You'll need two terminal windows/tabs:

#### Terminal 1: Start the Backend
```bash
cd backend
npm run dev
```

The backend will start at `http://localhost:3001`

#### Terminal 2: Start the Frontend
```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:5173`

Visit `http://localhost:5173` in your browser to see the app!

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
fullstack-ts-project/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express server setup
│   │   └── routes/
│   │       └── api.ts          # API routes
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── nodemon.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main React component
│   │   ├── App.css             # Component styles
│   │   ├── main.tsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Items API

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Health Check

- `GET /health` - Server health check

## 🎨 Features

- ✅ Full TypeScript support across the stack
- ✅ Hot module replacement for fast development
- ✅ RESTful API architecture
- ✅ CORS enabled
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan
- ✅ Environment variable configuration
- ✅ ESLint for code quality
- ✅ Production-ready build scripts
- ✅ Responsive design

## 🔧 Available Scripts

### Backend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm test` | Run tests |

### Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm test` | Run tests |

## 🚀 Deployment

### Backend Deployment

1. Build the application: `npm run build`
2. Set environment variables on your hosting platform
3. Start the server: `npm start`

**Recommended Platforms:**
- Heroku
- Railway
- Render
- AWS Elastic Beanstalk
- DigitalOcean App Platform

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder

**Recommended Platforms:**
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables for Production

Make sure to set these on your hosting platform:

**Backend:**
- `PORT`
- `NODE_ENV=production`
- `FRONTEND_URL` (your frontend URL)

**Frontend:**
- `VITE_API_URL` (your backend API URL)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Next Steps

Here are some ideas to extend this application:

- [ ] Add authentication (JWT, OAuth)
- [ ] Integrate a database (PostgreSQL, MongoDB)
- [ ] Add state management (Redux, Zustand)
- [ ] Implement WebSocket for real-time features
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add Docker configuration
- [ ] Implement API documentation (Swagger)
- [ ] Add rate limiting
- [ ] Implement caching (Redis)

## 📄 License

MIT License - feel free to use this project for learning or as a starter template!

## 🐛 Troubleshooting

### Port already in use

If you get a port conflict:

**Backend:** Change `PORT` in `.env`
**Frontend:** Change `server.port` in `vite.config.ts`

### CORS errors

Make sure:
1. Backend is running on the correct port
2. Frontend proxy is configured correctly in `vite.config.ts`
3. CORS is enabled in backend `src/index.ts`

### Module not found

Try removing `node_modules` and reinstalling:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 💡 Tips

- Use the browser DevTools Network tab to debug API calls
- Check backend terminal for API request logs
- Use TypeScript's type checking to catch errors early
- Keep dependencies updated with `npm outdated`

## 📞 Support

If you have questions or run into issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with details about your problem
3. Include error messages and your environment details

---

**Happy coding! 🎉**
