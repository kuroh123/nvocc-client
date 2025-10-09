# NVOCC Management System

A comprehensive Non-Vessel Operating Common Carrier (NVOCC) management application built with React, TypeScript, and Tailwind CSS.

## Features

### Authentication & Authorization
- User login with email/password
- Multi-role support (Admin, Customer, Port, Depot, Sales, Master Port, HR)
- Role-based access control
- Dynamic menu system based on active role
- Role switching without logout
- JWT token-based authentication

### Core Modules
- **Dashboard**: Overview of operations with statistics and quick actions
- **Bookings**: Manage shipping bookings with full CRUD operations
- **Customers**: Customer database management
- **Ports**: Port management (placeholder)
- **Depots**: Depot management (placeholder)
- **Users**: User management with role assignments
- **Roles**: Role and permission management
- **Activity Logs**: Audit trail tracking
- **Settings**: System configuration

### UI/UX Features
- Responsive design for desktop and mobile
- Modern, maritime-themed design
- Tailwind CSS for styling
- Mobile-first sidebar navigation
- Real-time notifications
- Loading states and error handling

## Technology Stack

- **Frontend**: React 19.1.1
- **Routing**: React Router DOM (latest)
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Build Tool**: Vite
- **Package Manager**: npm

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nvocc-client
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

### Demo Credentials

You can use any email/password combination for demo purposes. Example:
- **Email**: admin@nvocc.com
- **Password**: admin123

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── ProtectedRoute.jsx
│   ├── common/
│   │   └── LoadingSpinner.jsx
│   └── layout/
│       ├── Header.jsx
│       ├── MainLayout.jsx
│       ├── MobileSidebar.jsx
│       └── Sidebar.jsx
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── Bookings.jsx
│   ├── Customers.jsx
│   └── Dashboard.jsx
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## Authentication Flow

1. **Login**: Users authenticate with email/password
2. **Role Assignment**: System loads user roles and permissions
3. **Role Selection**: Default to first available role
4. **Menu Generation**: Dynamic menu based on active role
5. **Role Switching**: Users can switch roles without logout
6. **Session Management**: JWT tokens with refresh logic

## Role-Based Access Control

### Roles Supported:
- **ADMIN**: Full system access
- **CUSTOMER**: Limited to bookings and customer data
- **PORT**: Port-specific operations
- **DEPOT**: Depot-specific operations  
- **SALES**: Sales and customer management
- **MASTER_PORT**: Port and depot oversight
- **HR**: User and role management

### Permission System:
- Menu visibility based on role
- Component-level permission checks
- API-level authorization (when backend connected)

## API Integration

The application is designed to work with a REST API backend. Currently uses mock data for development.

### Expected API Endpoints:
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /users/me` - Current user profile
- `POST /users/switch-role` - Role switching
- `GET /menus` - Role-based menu items
- `GET /bookings` - Booking management
- `GET /customers` - Customer management

## Customization

### Theme Colors
The application uses a maritime-inspired color palette defined in `tailwind.config.js`:
- **Primary**: Blue tones (ocean/shipping theme)
- **Secondary**: Gray tones (professional look)
- **Accent**: Orange tones (highlights)
- **Success**: Green tones
- **Warning**: Yellow tones
- **Danger**: Red tones

### Adding New Features
1. Create new page components in `src/pages/`
2. Add routes in `App.jsx`
3. Update menu configuration in `AuthContext.jsx`
4. Add permission checks as needed

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Environment Variables
Create a `.env` file for environment-specific configuration:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=NVOCC Management
```

## Deployment

### Production Build
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch  
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please contact the development team or create an issue in the repository.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
