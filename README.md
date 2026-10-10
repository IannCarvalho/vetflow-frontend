# VetFlow Frontend

Frontend application for VetFlow - a comprehensive veterinary clinic management system.

Built with:
- **React 19** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI 7)** - Component library
- **Vite** - Build tool
- **React Router v7** - Routing
- **React Query (@tanstack/react-query)** - Server state management
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Yup** - Form validation
- **Vitest + Testing Library** - Automated tests

## Language Convention

This project follows a strict separation between code and user-facing text:

### Code (English)
- Variable/function/component names
- File names
- TypeScript types and interfaces
- Hook names
- Query keys
- Code comments and JSDoc

### User Interface (Portuguese - pt-BR)
- Page titles and headers
- Form labels and placeholders
- Button labels
- Validation messages
- Toast/snackbar messages
- Menu items
- All user-facing strings

## Project Structure

```
frontend/
├── src/
│   ├── api/               # API layer with Axios and typed functions
│   │   ├── axios.ts       # Axios instance configuration
│   │   ├── authApi.ts
│   │   ├── usersApi.ts
│   │   ├── clientsApi.ts
│   │   ├── petsApi.ts
│   │   ├── consultationsApi.ts
│   │   ├── vaccinesApi.ts
│   │   └── notificationsApi.ts
│   ├── hooks/             # React Query hooks for data fetching
│   │   ├── useClientsQuery.ts
│   │   ├── usePetsQuery.ts
│   │   ├── useConsultationsQuery.ts
│   │   ├── useVaccinesQuery.ts
│   │   └── useNotificationsQuery.ts
│   ├── contexts/          # React contexts (auth-context.tsx)
│   ├── routes/            # Route definitions + protected-route.tsx
│   ├── types/             # TypeScript type definitions
│   ├── pages/             # Page components
│   ├── sections/          # Feature-specific components
│   ├── layouts/           # Layout components
│   ├── components/        # Shared components
│   ├── utils/             # Utility functions (format-number, format-time, ...)
│   ├── theme/             # MUI theme configuration
│   └── test/              # Test setup (setup.ts)
├── .env.example           # Environment variables template
└── package.json
```

## Features

### Authentication
- Email/password login and registration (`AuthProvider` in `src/contexts/auth-context.tsx`)
- Social login via Google OAuth (`@react-oauth/google`) — configured through `VITE_GOOGLE_CLIENT_ID` (the `.env.example` also lists Facebook/Discord placeholders for future providers)
- Token persisted in `localStorage`; protected routes gated by `ProtectedRoute` (`src/routes/protected-route.tsx`)
- Profile and password management wired to the backend `/users` endpoints

### Dashboard
- Summary statistics: Total clients, pets, consultations this month, upcoming vaccinations
- Recent consultations table
- Upcoming vaccinations table

### Clientes (Pet Owners)
- View all clients in a table
- Create new client
- Edit client information
- Delete client (with confirmation)
- Client details: name, CPF, phone, address

### Pets
- View all pets with species filtering
- Filter by species: Dogs, Cats, Others
- Create new pet
- Edit pet information
- Delete pet (with confirmation)
- Pet details: name, species, breed, age, sex, neutered status, weight

### Consultas (Consultations)
- View all veterinary consultations
- Create new consultation
- Delete consultation
- Consultation details: date, vet name, anamnesis, diet, physiological data, summary

### Vacinas (Vaccinations)
- View all vaccine records
- Visual indicators for upcoming vaccinations (within 30 days)
- Create new vaccination record
- Edit vaccination record
- Delete vaccination record
- Vaccine details: vaccine name, batch, manufacturer, application date, next dose date

## Setup

### Prerequisites
- Node.js v20 or higher
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Update `VITE_API_BASE_URL` to your backend server URL:
```
VITE_API_BASE_URL=http://localhost:8080
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3039` (or the next available port)

### Build

```bash
npm run build
```

### Production Preview

```bash
npm run start
```

## Theme Colors

VetFlow uses a custom color palette reflecting veterinary branding throughout the entire interface:

### Primary Colors
- **Azul (Primary)**: `#0284C7` - Main brand color for buttons, links, and focus states
  - Light: `#7DD3FC` - Hover and active states
  - Lighter: `#E0F2FE` - Unread notification backgrounds, subtle highlights

### Secondary Colors  
- **Verde (Secondary)**: `#16A34A` - Complementary brand color
  - Light: `#86EFAC` - Borders and accents
  - Lighter: `#DCFCE7` - Read notification backgrounds

### Interface Elements
- **Sidebar Background**: Gradient `#F0F9FE → #F5FDF8` (blue to green)
- **Page Background**: `#F0F9FE` (soft azure blue)
- **Page Surface**: `#FFFFFF` (white cards and containers)
- **Dividers/Borders**: Light blue shades with transparency
- **Grey Scale**: Updated from neutral grey to blue-tinted grey for consistency

### Component Styling
- **Unread Notifications**: Azure blue (#E0F2FE) with blue borders and "Ler" button visible
- **Read Notifications**: Fresh green (#DCFCE7) with green borders
- **Primary Buttons**: Deep blue (#0284C7) with hover states in lighter blue
- **Active Navigation**: Blue tinted background in sidebar
- **Header**: Subtle gradient overlay (azure + green)

### Design System
The theme is configured in `src/theme/` with full Material-UI support:
- `theme-config.ts` - Base color definitions
- `palette.ts` - Color channel system for transparency
- Portuguese locale (`ptBR`) for all MUI components
- Consistent color application across all breakpoints and component states

## API Integration

All API calls are made through the `src/api/` layer using Axios. Each resource (clients, pets, consultations, vaccines) has:

- `getAll()` - Fetch all records
- `getById(id)` - Fetch single record
- `create(data)` - Create new record
- `update(id, data)` - Update existing record
- `delete(id)` - Delete record
- Entity-specific filtered queries (e.g., `getByOwnerId`, `getByPetId`)

All API functions are fully typed with TypeScript for type safety and IntelliSense.

## Form Validation

Forms use **React Hook Form** combined with **Yup** for validation. All validation messages are in Portuguese:

- "Campo obrigatório" (Required field)
- "CPF inválido" (Invalid CPF)
- "Telefone inválido" (Invalid phone)
- etc.

## Feedback & UX

- **Loading states**: Skeleton loaders while data is fetched
- **Success/Error messages**: Toast notifications in pt-BR
- **Confirmation dialogs**: For destructive actions (delete)
- **Empty states**: User-friendly messages when no data exists

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Preview production build
- `npm test` - Run the test suite (Vitest)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run fm:check` - Check code formatting
- `npm run fm:fix` - Fix code formatting
- `npm run fix:all` - Run all lint and format fixes

## Testing

Tests run on **Vitest** with **Testing Library** in a `jsdom` environment (configured in the `test` block of `vite.config.ts`, with setup in `src/test/setup.ts`). Coverage currently includes utility functions (`src/utils/`) and the `useAuth` hook (`src/contexts/`), with the API layer mocked so no real HTTP requests are made.

```bash
npm test
```

Test files live next to the code they cover as `*.test.ts` / `*.test.tsx`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Backend Connection Issues
- Verify `VITE_API_BASE_URL` in `.env` matches your backend URL
- Ensure backend server is running
- Check browser console for CORS errors

### Data Not Loading
- Verify API endpoints in `src/api/` match your backend routes
- Check React Query DevTools for query status
- Verify authentication if required by backend

## Future Enhancements

- [ ] Multi-step consultation form with stepper
- [ ] Advanced filtering and search
- [ ] Data export (CSV, PDF)
- [ ] Charts and analytics
- [ ] Notifications/Alerts
- [ ] Mobile responsiveness improvements

## License

This project is built on top of the [Minimal UI](https://github.com/minimal-ui-kit/material-kit-react) template (MIT License).

VetFlow is also MIT licensed.

## Support

For issues or questions:
1. Review the backend API documentation (Swagger at `/swagger` on the backend)
2. Create an issue in the repository



## Git Hooks — Merge Conflict Marker Gate

This repo ships a tracked `pre-commit` hook that refuses any commit containing
unresolved git merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`). The same
check runs in CI as the `no-conflict-markers` job in
`.github/workflows/ci.yml`, so a commit that passes locally also passes CI.

### Activate the hook (once per clone)

The hook lives in the tracked `.githooks/` directory (git does not share
`.git/hooks`). Point git at it with the provided script:

```bash
# macOS / Linux / Git Bash
bash scripts/install-hooks.sh
```

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts\install-hooks.ps1
```

Both do the same thing: `git config core.hooksPath .githooks`. Git for Windows
runs the bash hook through its bundled `sh`, so no extra setup is required.

### Behaviour

- On `git commit`, the hook scans the **staged** content of every added/modified
  file. If any still contains a conflict marker, the commit is aborted and the
  offending `file:line` locations are printed.
- Emergency bypass (discouraged): `git commit --no-verify`.
- The gate is enforced regardless of the hook in CI, so a bypassed local commit
  is still rejected on push / pull request.
