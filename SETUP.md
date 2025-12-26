# Craftopia - Setup Guide

## 🚨 IMPORTANT: Node.js Installation Required

Before you can run this project, you need to install Node.js on your computer.

### Step 1: Install Node.js

1. **Download Node.js**:
   - Visit: https://nodejs.org/
   - Download the LTS (Long Term Support) version
   - Choose the Windows Installer (.msi)

2. **Run the Installer**:
   - Double-click the downloaded file
   - Follow the installation wizard
   - **Important**: Check the box that says "Automatically install the necessary tools"
   - Complete the installation

3. **Verify Installation**:
   - Open PowerShell (or Command Prompt)
   - Run these commands:
     ```bash
     node --version
     npm --version
     ```
   - You should see version numbers (e.g., v20.x.x and 10.x.x)

### Step 2: Install Project Dependencies

Once Node.js is installed:

1. **Open PowerShell** in the project directory:
   - Right-click on the `frontend` folder
   - Select "Open in Terminal" or "Open PowerShell window here"

2. **Install dependencies**:
   ```bash
   npm install
   ```
   
   This will install all required packages listed in `package.json`:
   - React
   - React DOM
   - React Router DOM
   - Vite
   - ESLint and plugins

   **Note**: This may take a few minutes depending on your internet connection.

### Step 3: Start the Development Server

After dependencies are installed:

```bash
npm run dev
```

The application will start and automatically open in your browser at:
```
http://localhost:3000
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

### Troubleshooting

**Problem**: `npm: command not found` or `node: command not found`
- **Solution**: Node.js is not installed or not in PATH. Reinstall Node.js and restart your terminal.

**Problem**: Port 3000 is already in use
- **Solution**: Either stop the other application using port 3000, or Vite will automatically use a different port (check the terminal output).

**Problem**: `npm install` fails with errors
- **Solution**: 
  1. Delete `node_modules` folder and `package-lock.json` file
  2. Run `npm install` again
  3. If issues persist, try `npm cache clean --force` then `npm install`

**Problem**: Module not found errors
- **Solution**: Make sure you ran `npm install` before running `npm run dev`

### Project Features

Once running, you can:
- ✅ Browse industrial crafts
- ✅ Search and filter crafts
- ✅ View detailed craft information
- ✅ Make reservations (dummy data)
- ✅ View your reservations
- ✅ Check your profile
- ✅ Contact form
- ✅ Learn about the platform

### Next Steps After Backend is Ready

When your colleague completes the Node.js backend:

1. **Update Controllers** to use API calls instead of dummy data
2. **Add Authentication** for real user login
3. **Connect Reservation System** to actual database
4. **Add Payment Integration** if needed
5. **Deploy** both frontend and backend

### Development Tips

- **Hot Reload**: Changes to `.jsx` and `.css` files will automatically reload the browser
- **Console Errors**: Check the browser console (F12) for any errors
- **React DevTools**: Install React DevTools browser extension for debugging
- **File Organization**: Follow the MVC structure when adding new features

### File Structure Overview

```
src/
├── models/          → Data structures and dummy data
├── controllers/     → Business logic
├── views/          → Page components
├── components/     → Reusable UI components
└── styles/         → CSS files
```

### Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal for error messages
3. Verify all dependencies are installed (`npm install`)
4. Make sure you're using a compatible Node.js version (v16+)

---

**Happy Developing! 🎉**
