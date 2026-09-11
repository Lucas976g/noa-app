# Distribuidora NOA

Aplicación de gestion de pedidos para distribuidora NOA. Uso de autenticación, roles (cliente/director), y módulos de catálogo, pedidos, inventario, clientes, logística y reportes.

## Stack

- React 19 + TypeScript 6
- Vite 8
- Tailwind CSS 4 (vía `@tailwindcss/vite`)
- shadcn/ui (estilo `radix-nova`, iconos `@tabler/icons-react`)
- Zustand (state management)
- React Router 7

## Requisitos

- Node.js >= 18
- pnpm (no usar npm ni yarn)

## Setup

```bash
pnpm install
pnpm dev
```

El server arranca en `http://localhost:5174`.

## Comandos

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Typecheck + build de producción |
| `pnpm typecheck` | Typecheck sin emitir |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |

## Estructura

```
src/
├── app/          # App root, rutas principales
├── auth/         # Autenticación (modelo, UI, store)
├── catalog/      # Módulo de catálogo
├── clients/      # Módulo de clientes
├── components/   # Componentes compartidos (ui/, theme-provider)
├── inventory/    # Módulo de inventario
├── layout/       # Shells y layouts (navbar, sidebar, client-shell)
├── logistics/    # Módulo de logística
├── orders/       # Módulo de pedidos
├── reports/      # Módulo de reportes
├── routes/       # Páginas/rutas por módulo
├── shared/       # Utilidades compartidas (http/, lib/, ui/)
└── index.css     # Theme tokens de Tailwind v4
```

## Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para el estilo de código, convenciones y guías del equipo.
