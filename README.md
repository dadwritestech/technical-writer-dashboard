# Technical Writer Dashboard 📝

A comprehensive productivity dashboard designed specifically for technical writers to track time, manage documentation projects, and monitor writing performance.

![Technical Writer Dashboard](https://img.shields.io/badge/React-18.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0.6-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 📊 **Smart Analytics**
- Real-time time tracking with work phase categorization (Research, Writing, Review, etc.)
- Daily, weekly, and project-based productivity insights
- Documentation debt tracking to identify outdated content

### 🎯 **Project Management**
- Content type categorization (API docs, user guides, tutorials, etc.)
- Document version tracking (drafts, reviews, published)
- Team collaboration and priority management
- Due date tracking with visual indicators

### ⏰ **Time Tracking**
- Precise time blocks with start/stop/pause functionality
- Separate research vs. writing time tracking
- Project-based time allocation
- Task description logging

### 🌙 **Modern UI/UX**
- Dark/light theme toggle
- Glassmorphism design with smooth animations
- Mobile-responsive with bottom navigation
- Accessibility-first design (ARIA labels, keyboard navigation)

### 🔄 **Data Management**
- Local storage using IndexedDB (works offline)
- Export/import functionality for data backup
- Weekly summary reports
- Real-time dashboard updates

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (or yarn/pnpm)
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/technical-writer-dashboard.git
   cd technical-writer-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
# Build the project
npm run build

# Preview the build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm run test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |

### Project Structure

```
src/
├── components/          # React components
│   ├── __tests__/      # Component tests
│   ├── Dashboard.jsx   # Main dashboard
│   ├── TimeTracker.jsx # Time tracking interface
│   ├── ProjectManager.jsx # Project management
│   └── ...
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── styles/             # CSS and Tailwind styles
├── utils/              # Utility functions
└── __mocks__/          # Test mocks
```

### Tech Stack

- **Frontend**: React 18, React Router, React Hooks
- **Styling**: Tailwind CSS, CSS-in-JS
- **Database**: Dexie.js (IndexedDB wrapper)
- **Build Tool**: Vite
- **Testing**: Jest, React Testing Library
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🎯 Usage

See the [User Guide](./USER_GUIDE.md) for detailed instructions on using the dashboard.

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow React best practices and hooks patterns
- Write tests for new components and features
- Use TypeScript-style JSDoc comments
- Follow the existing code style (Prettier/ESLint)
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first styling approach
- **Dexie.js** for the excellent IndexedDB wrapper
- **Lucide** for the beautiful icons
- **Vite** for the lightning-fast build tool

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [User Guide](./USER_GUIDE.md)
2. Search existing [GitHub Issues](https://github.com/yourusername/technical-writer-dashboard/issues)
3. Create a new issue with detailed description

## 🔮 Roadmap

- [ ] **Team Collaboration**: Real-time collaboration features
- [ ] **Integrations**: Connect with GitHub, Notion, Confluence
- [ ] **Advanced Analytics**: AI-powered writing insights
- [ ] **Templates**: Document templates and snippets
- [ ] **Workflow Automation**: Custom automation rules
- [ ] **Cloud Sync**: Optional cloud backup and sync

---

**Made with ❤️ for technical writers everywhere**

> *"Documentation is a love letter that you write to your future self."* - Damian Conway