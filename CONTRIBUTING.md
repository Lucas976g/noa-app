# Contribuir en Noa

Guía de estilo y convenciones para el equipo.

## Setup

Usamos **pnpm** como gestor de paquetes. No usar npm ni yarn.

```bash
pnpm install
pnpm dev
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Dev server (Vite, puerto 5174) |
| `pnpm build` | Typecheck + build de producción |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Typecheck sin emitir |
| `pnpm format` | Prettier write en `**/*.{ts,tsx}` |

Correr `pnpm typecheck` y `pnpm lint` antes de commitear. Si hay errores, arreglarlos.

## Estilo de código

- **Inglés** en código: nombres de variables, funciones, componentes, tipos, comentarios técnicos.
- **Español** en contenido visible al usuario: textos de UI, labels, mensajes, placeholder, etc.
- **Sin punto y coma** (`"semi": false`).
- **Doble comilla** (`"singleQuote": false`).
- **2 espacios** de indentación.
- **Trailing commas** estilo ES5.
- **Max 80 caracteres** por línea.
- Correr `pnpm format` antes de commit para que Prettier ordene las clases de Tailwind automáticamente.

## TypeScript

- `verbatimModuleSyntax: true` — usar `import type { ... }` para imports de solo tipo.
- `noUnusedLocals` y `noUnusedParameters` — no dejar código muerto.
- `erasableSyntaxOnly` — no usar enums ni namespaces con runtime emit. Usar union types o `as const` objects.
- Usar el path alias `@/` en vez de rutas relativas largas (`@/components/ui/button` en vez de `../../components/ui/button`).

## React

- React 19. Usar function components y hooks.
- Componentes como function declarations, no arrow functions (`function Button(...)`, no `const Button = (...)`).
- Exportar el componente y las variantes/utilidades que otros necesiten.
- No abusar de `useEffect`. Preferir derivación de estado y `useMemo`/`useCallback` cuando sea necesario.

## Tailwind CSS y shadcn

- **Tailwind v4** — no hay `tailwind.config.js`. El tema vive en `src/index.css` bajo `@theme inline`.
- **shadcn style: `radix-nova`**. Seguir este estilo al agregar componentes.
- **Iconos: `@tabler/icons-react`**, no lucide-react.
- **Radix UI**: importar desde el paquete umbrella (`import { Slot } from "radix-ui"`), no desde `@radix-ui/react-slot`.
- Para agregar componentes shadcn: `pnpm dlx shadcn@latest add <nombre>`.
- Usar `cn()` de `@/lib/utils` para combinar clases (clsx + tailwind-merge).

## Estructura del proyecto

```
src/
├── app/          # App root, rutas principales
├── auth/         # Autenticación (modelo, UI, store)
├── catalog/      # Módulo de catálogo
├── clients/      # Módulo de clientes
├── components/   # Componentes compartidos (ui/, theme-provider)
├── inventory/    # Módulo de inventario
├── layout/       # Shells y layouts
├── logistics/    # Módulo de logística
├── orders/       # Módulo de pedidos
├── reports/      # Módulo de reportes
├── routes/       # Páginas/rutas por módulo
├── shared/       # Utilidades compartidas (http/, lib/, ui/)
└── index.css     # Theme tokens de Tailwind v4
```

Cada módulo (`auth`, `catalog`, etc.) puede tener su propia carpeta con `model/`, `ui/`, `store/` según necesidad.

## CSS

- Usar **Tailwind utility classes** siempre que sea posible.
- Para estilos complejos o variantes, usar `cva()` (class-variance-authority).
- No crear archivos CSS adicionales salvo que sea estrictamente necesario.
- El dark mode se configura con `@custom-variant dark (&:is(.dark *))` en `index.css`. No usar la variante `dark:` nativa de Tailwind.

## Commits

- Mensajes claros y cortos en inglés.
- Formato: `<tipo>: <descripción corta>` (ej. `feat: add product search`, `fix: resolve login redirect`).
- No commitear `.env` ni `node_modules`.
- No commitear cambios en `dist/`.

## PRs

- Que el build pase (`pnpm build`).
- Que no haya errores de lint ni typecheck.
- Describir qué se cambió y por qué.
- Si es un componente nuevo, mostrar cómo se usa.
