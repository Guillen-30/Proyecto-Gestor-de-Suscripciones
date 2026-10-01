# Herramientas para Claude Code: Playwright CLI, Graphify y OmniRoute

Guía para instalar tres herramientas que complementan a Claude Code. Cada una se instala **en tu computadora** (no en tu cuenta de Claude): si usas Claude en otra máquina, tienes que repetir la instalación allí.

| Herramienta | Para qué sirve | Se instala con |
|---|---|---|
| **Playwright CLI** | Que Claude controle un navegador (abrir páginas, hacer clic, llenar formularios, capturas) gastando pocos tokens | npm (Node.js) |
| **Graphify** | Convierte tu proyecto en un *knowledge graph* para que Claude entienda la estructura sin leer todos los archivos | pip / pipx (Python) |
| **OmniRoute** | Proxy local que enruta las peticiones de Claude Code a otros proveedores/modelos y comprime el contexto | npm (Node.js) |

> Información verificada contra la documentación oficial de cada proyecto (septiembre 2026). Si algún comando no coincide con lo que ves, revisa el enlace oficial de la sección: estas herramientas cambian rápido.

---

## Requisitos

- **Claude Code** instalado: https://claude.ai/code
- **Node.js 18 o superior** (para Playwright CLI y OmniRoute) — https://nodejs.org
  ```bash
  node --version
  ```
- **Python 3.10 o superior** (para Graphify) — https://www.python.org/downloads
  ```bash
  python --version
  ```

---

## 1. Playwright CLI

Repositorio oficial: https://github.com/microsoft/playwright-cli · Docs: https://playwright.dev/agent-cli/introduction

Es una línea de comandos pensada para agentes de IA. A diferencia de otras integraciones, no vuelca toda la página en el contexto del modelo, así que ahorra tokens.

> ⚠️ No confundir con `@playwright/test`, que es el ejecutor de tests de Playwright. Son paquetes distintos.

### Instalar

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
```

### Conectarlo con Claude Code

Instala las *skills* para que Claude Code sepa usarlo:

```bash
playwright-cli install --skills
```

Después de esto, puedes pedirle a Claude en lenguaje normal cosas como *"abre http://localhost:5173, inicia sesión y toma una captura del dashboard"*, y él usará `playwright-cli`.

### Comandos principales (por si quieres usarlo tú directamente)

| Tarea | Comando |
|---|---|
| Abrir navegador visible | `playwright-cli open https://example.com --headed` |
| Ir a una URL | `playwright-cli goto <url>` |
| Ver la página (snapshot con referencias) | `playwright-cli snapshot` |
| Clic en un elemento | `playwright-cli click <ref>` |
| Llenar un campo | `playwright-cli fill <ref> <texto>` |
| Escribir texto | `playwright-cli type "texto"` |
| Presionar una tecla | `playwright-cli press Enter` |
| Captura de pantalla | `playwright-cli screenshot` |
| Cerrar navegador | `playwright-cli close` |

Las `<ref>` salen del resultado de `snapshot`.

---

## 2. Graphify

Repositorio oficial: https://github.com/safishamsi/graphify

Lee tu proyecto (código, docs, SQL, imágenes) y genera un grafo de conocimiento. Claude consulta el grafo para entender cómo se conectan las piezas en lugar de abrir archivo por archivo, lo que ahorra tokens en proyectos grandes.

> ⚠️ El paquete de Python se llama **`graphifyy`** (con doble *y*), pero el comando es `graphify`. Hay un paquete de npm llamado `graphify` que **no tiene nada que ver**: no lo instales.

### Instalar

Recomendado (maneja el PATH automáticamente):

```bash
pipx install graphifyy
graphify install
```

Alternativas: `uv tool install graphifyy` o `pip install graphifyy`.

`graphify install` registra la skill `/graphify` en Claude Code. Para registrarla solo en el proyecto actual: `graphify install --project`.

> **Windows:** si después de `pip install` el comando `graphify` "no se reconoce", agrega la carpeta de Scripts de Python al PATH (`%APPDATA%\Python\Python3xx\Scripts`, cambiando `3xx` por tu versión, p. ej. `313`) o usa `pipx`, que lo resuelve solo.
>
> **macOS:** si `pip install` falla con *externally-managed-environment*, usa `pipx install graphifyy`.

### Generar el grafo

Abre Claude Code en la carpeta de tu proyecto y escribe:

```
/graphify .
```

Se crea la carpeta `graphify-out/` con:

- `graph.html` — visualización interactiva (ábrela en el navegador)
- `GRAPH_REPORT.md` — resumen y preguntas sugeridas
- `graph.json` — el grafo que consulta Claude

Recomendación: agrega `graphify-out/` a tu `.gitignore` si no quieres subirlo al repositorio.

### Mantenerlo actualizado

```
/graphify . --update          # re-procesa solo los archivos que cambiaron
```

```bash
graphify hook install          # reconstruye el grafo automáticamente en cada commit
```

### Consultas útiles

```
/graphify query "¿cómo se conecta el frontend con la API de suscripciones?"
/graphify explain "Layout"
/graphify path "Login" "Dashboard"
```

---

## 3. OmniRoute

Repositorio oficial: https://github.com/diegosouzapw/OmniRoute

Es un servidor local que se pone **entre Claude Code y el modelo**. Recibe las peticiones, las comprime (RTK + Caveman, activado por defecto) y las envía al proveedor que elijas, con *fallback* automático si uno falla.

> ⚠️ **Lee esto antes de usarlo:**
> - Al pasar Claude Code por OmniRoute, **quien responde puede dejar de ser Claude**: depende del proveedor/modelo que configures (GLM, GPT, Gemini, modelos gratuitos…). La calidad y el comportamiento cambian.
> - El modo "sin configuración" usa por defecto el proveedor **OpenCode Free**, y tus peticiones (incluido tu código) pasan por la infraestructura de ese tercero. Revisa su política de privacidad antes de usarlo con código privado.
> - **No ahorra tokens por sí solo**: solo actúa si inicias Claude Code a través de él (ver abajo). Si abres Claude Code normalmente, OmniRoute no interviene.

### Instalar e iniciar

```bash
npm install -g omniroute
omniroute
```

Es normal ver avisos `npm warn ERESOLVE` durante la instalación. El paquete es grande (~550 MB) y puede tardar varios minutos.

Con el servidor corriendo:

- Dashboard: http://localhost:20128
- API: http://localhost:20128/v1

Otros comandos útiles:

```bash
omniroute setup     # asistente guiado de primera configuración
omniroute doctor    # diagnostica proveedores, puertos y dependencias
```

### Conectar un proveedor

En el dashboard → **Providers**, conecta el proveedor que quieras usar (con tu API key o una opción gratuita).

### Usarlo con Claude Code

La forma más simple es lanzar Claude Code a través de OmniRoute (no modifica tu configuración):

```bash
omniroute launch
```

O eligiendo un modelo concreto:

```bash
omniroute run claude --model <proveedor/modelo>
```

Para crear perfiles permanentes de Claude Code apuntando a OmniRoute: `omniroute setup-claude` (agrega `--dry-run` para ver qué escribiría sin tocar nada).

Para volver a Claude Code normal, simplemente ábrelo como siempre (`claude`), sin pasar por OmniRoute.

---

## Verificar que todo quedó instalado

```bash
playwright-cli --help
npm list -g @playwright/cli omniroute
pipx list            # debe aparecer graphifyy
```

## Actualizar

```bash
npm install -g @playwright/cli@latest
pipx upgrade graphifyy
npm install -g omniroute@latest
```

## Desinstalar

```bash
npm uninstall -g @playwright/cli
pipx uninstall graphifyy
npm uninstall -g omniroute
```
