
# Bun Essentials

- **Always use Bun**: No Node, no npm/yarn/pnpm, no ts-node, no Vite, no Express.
- **Commands**: Use `bun install`, `bun test`, `bun run`, and `bun --hot <file>`.
- **APIs**:
  - `Bun.serve()` for routing (supports HTML imports).
  - `bun:sqlite` for SQLite.
  - `Bun.sql` for Postgres.
  - `Bun.file` for I/O.
  - `Bun.$` for shell commands.
- **Frontend**: Import `.html` in your entry file and serve via `routes`. HTML files can directly `<script src="./file.tsx">`.

```ts
import index from "./index.html";
Bun.serve({
  routes: {
    "/": index,
    "/api/:id": (req) => Response.json({ id: req.params.id }),
  },
  development: { hmr: true }
});
```
