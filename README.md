# Secure QR Scanner Frontend (React)

A modern, secure QR code scanner web application built with React. This application allows users to scan QR codes safely, analyze their content for potential security risks, and maintain a history of scans. Features user authentication, dark/light theme support, and a responsive design.

## Features

- **Secure QR Scanning**: Scan QR codes using your device's camera with built-in safety analysis
- **Content Safety Analysis**: Automatically detects potentially malicious QR codes containing JavaScript, data URLs, or VBScript
- **Scan History**: View and manage your scanning history (stored locally)
- **User Authentication**: Login, signup, or continue as a guest user
- **Dark/Light Theme**: Toggle between dark and light themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Privacy-Focused**: All scanning is processed locally in the browser - no data sent to external servers

## Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **QR Scanning**: html5-qrcode library
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend/Auth**: Supabase (with local storage fallback)
- **State Management**: React Context API

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- A modern web browser with camera access

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/
   cd Secure_QR_Scanner_FrontEnd_React
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Authentication**: Login with your account, create a new account, or continue as a guest
2. **Scanning**: Click "Start Scanning" to activate your camera and scan QR codes
3. **Safety Check**: The app automatically analyzes scanned content for security risks
4. **Results**: View scan results with safety status and timestamp
5. **History**: Access your scan history from the navigation menu
6. **Profile**: Manage your account settings

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── InputField.jsx
│   ├── Navbar.jsx
│   └── StatusBadge.jsx
├── context/             # React Context providers
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── pages/               # Main application pages
│   ├── History.jsx
│   ├── Login.jsx
│   ├── Profile.jsx
│   ├── Scanner.jsx
│   └── Signup.jsx
├── App.jsx              # Main application component
├── config.js            # Configuration settings
├── index.css            # Global styles
└── main.jsx             # Application entry point
```

## Security Features

- **Local Processing**: All QR code scanning and analysis happens in the browser
- **Pattern Detection**: Identifies potentially dangerous content patterns
- **No Data Transmission**: Scan data is never sent to external servers
- **Local Storage**: User data and scan history stored locally only

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [html5-qrcode](https://github.com/mebjas/html5-qrcode) for QR scanning functionality
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Supabase](https://supabase.com/) for backend services
- [Lucide React](https://lucide.dev/) for icons
