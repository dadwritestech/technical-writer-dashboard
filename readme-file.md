# Technical Writer Dashboard

A comprehensive productivity dashboard for technical writers to track time, manage projects, and generate weekly reports.

## Features

- **Time Tracking**: Track time spent on different activities (deep work, meetings, planning, etc.)
- **Project Management**: Create, update, and manage documentation projects
- **Weekly Reports**: Automatically generate weekly summaries with metrics
- **Data Export/Import**: Backup and restore your data
- **Local Storage**: All data stored locally in your browser for privacy

## Setup Instructions

### Prerequisites

- Git installed on your computer
- A GitHub account
- Basic knowledge of using terminal/command line

### Step 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository `techwriter-dashboard`
4. Keep it public (required for GitHub Pages)
5. Don't initialize with README (we'll add our own)
6. Click "Create repository"

### Step 2: Set Up the Project Locally

1. Open your terminal/command prompt
2. Create and navigate to your project directory:
   ```bash
   mkdir techwriter-dashboard
   cd techwriter-dashboard
   ```

3. Initialize git and add remote:
   ```bash
   git init
   git remote add origin https://github.com/YOUR_USERNAME/techwriter-dashboard.git
   ```

### Step 3: Add Project Files

1. Create the project structure and files as shown in the documentation
2. Copy all the provided code into their respective files
3. Make sure to create the `.github/workflows/` directory for the GitHub Actions workflow

### Step 4: Commit and Push to GitHub

```bash
git add .
git commit -m "Initial commit: Technical Writer Dashboard"
git branch -M main
git push -u origin main
```

### Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" (in the repository navigation)
3. Scroll down to "Pages" in the left sidebar
4. Under "Build and deployment":
   - Source: Select "GitHub Actions"
5. Save the changes

### Step 6: Wait for Deployment

1. Go to the "Actions" tab in your repository
2. You should see the workflow running
3. Wait for it to complete (usually takes 2-3 minutes)
4. Once complete, your app will be available at:
   `https://YOUR_USERNAME.github.io/techwriter-dashboard/`

## Usage Guide

### Time Tracking

1. Navigate to "Time Tracking" from the navigation menu
2. Select the type of work (Deep Work, Meeting, etc.)
3. Choose a project from the dropdown
4. Add a description (optional)
5. Click "Start Timer"
6. Click "Stop" when finished

### Project Management

1. Go to "Projects" section
2. Click "New Project" to create a project
3. Fill in project details:
   - Name
   - Team
   - Status
   - Priority
   - Due date (optional)
   - Description (optional)
4. Projects can be edited or archived

### Weekly Summary

1. Navigate to "Weekly Summary"
2. View metrics for the current week
3. Add completed items and in-progress tasks
4. Generate email summary with one click
5. Copy to clipboard or open in email client

### Data Backup

1. Go to "Settings"
2. Click "Export Backup" to download your data
3. To restore: Click "Import Backup" and select your backup file

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Dexie.js** - IndexedDB wrapper for local storage
- **React Router** - Navigation
- **Lucide React** - Icons
- **date-fns** - Date utilities

## Local Development

If you want to run the project locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Data Privacy

All data is stored locally in your browser using IndexedDB. No data is sent to any external servers. Regular backups are recommended to prevent data loss.

## Browser Support

Works best in modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Troubleshooting

### App not loading after deployment
- Check GitHub Actions tab for any errors
- Ensure GitHub Pages is enabled with GitHub Actions as source
- Clear browser cache and try again

### Data not persisting
- Make sure you're not in incognito/private mode
- Check browser console for any errors
- Try exporting and re-importing your data

### Build fails on GitHub Actions
- Check that all dependencies are listed in package.json
- Ensure no syntax errors in the code
- Review the error logs in GitHub Actions

## Contributing

Feel free to fork this project and customize it for your needs!

## License

MIT License - feel free to use this project for personal or commercial purposes.