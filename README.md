# Gestor de Suscripciones

Aplicación web para gestionar suscripciones personales o empresariales. Permite rastrear pagos, administrar métodos de pago, almacenar credenciales de forma segura y visualizar gastos a través de un dashboard.

## Características

- Dashboard con resumen de gastos y próximos pagos
- CRUD completo de suscripciones con categorías y ciclos de facturación
- Historial y registro manual de pagos
- Bóveda de credenciales (almacenamiento cifrado)
- Gestión de métodos de pago y categorías personalizadas
- Preferencias de notificaciones por suscripción
- Modo oscuro / claro y soporte multimoneda

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Auth API | Node.js / Express — puerto 3001 |
| Subscriptions API | Node.js / Express — puerto 3002 |
| Base de datos | SQL Server 2019 — puerto 1433 |
| Contenedores | Docker + Docker Compose |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Puertos **1433**, **3001**, **3002** y **5173** libres en tu máquina

No necesitas Node.js, npm ni SQL Server instalados localmente; todo corre dentro de contenedores.

---

## Instalación y ejecución

### Opción A — Docker Compose (recomendado)

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd Proyecto-Gestor-de-Suscripciones
   ```

2. Levanta todos los servicios:
   ```bash
   docker compose up --build
   ```
   La primera vez tarda varios minutos porque:
   - SQL Server necesita iniciar (~15 s)
   - Se ejecutan los scripts SQL de creación de base de datos y stored procedures
   - Se compilan las dependencias nativas de Node (bcrypt)

3. Cuando veas en la terminal `Scripts ejecutados!`, la app está lista en:
   ```
   http://localhost:5173
   ```

4. Para detener todos los servicios:
   ```bash
   docker compose down
   ```
   Para detener **y borrar la base de datos** (volumen):
   ```bash
   docker compose down -v
   ```

---

### Opción B — Ejecución local (sin Docker, mejor no la haga legalmente)

Necesitarás: Node.js 20+, npm y una instancia de SQL Server accesible.

#### 1. Base de datos

Crea la base de datos y los stored procedures ejecutando en orden:

```
API Proyecto/creacion_BD.sql
API Proyecto/stored_procedures.sql
```

#### 2. User API

```bash
cd "API Proyecto/user-api"
npm install
```

Crea un archivo `.env`:
```env
PORT=3001
DB_USER=sa
DB_PASSWORD=tu_contraseña
DB_SERVER=localhost
DB_NAME=SuscripcionesDB
JWT_SECRET=tu_clave_secreta_super_segura
```

```bash
node index.js
```

#### 3. Subscriptions API

```bash
cd "API Proyecto/subscriptions-api"
npm install
```

Crea un archivo `.env`:
```env
PORT=3002
DB_USER=sa
DB_PASSWORD=tu_contraseña
DB_SERVER=localhost
DB_NAME=SuscripcionesDB
JWT_SECRET=tu_clave_secreta_super_segura
ENCRYPTION_KEY=EstaEsUnaClaveSecretaDe32Caracteres!
```

> **Importante:** `ENCRYPTION_KEY` debe tener exactamente 32 caracteres. Si cambias este valor después de haber guardado credenciales, no podrás descifrarlas.

```bash
node index.js
```

#### 4. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

---

## Primer uso

1. Ve a `http://localhost:5173`
2. Haz clic en **Registrarse** y crea una cuenta
3. Inicia sesión
4. Desde el dashboard puedes agregar tu primera suscripción con el botón **Agregar Suscripción**

---

## Estructura del proyecto

```
Proyecto-Gestor-de-Suscripciones/
├── docker-compose.yml              # Orquestación completa
├── API Proyecto/
│   ├── creacion_BD.sql             # Script de creación de tablas
│   ├── stored_procedures.sql       # Stored procedures
│   ├── docker-compose.yml          # Compose alternativo para desarrollo
│   ├── user-api/                   # Microservicio de autenticación (puerto 3001)
│   │   ├── index.js
│   │   ├── Dockerfile
│   │   └── ...
│   └── subscriptions-api/          # Microservicio principal (puerto 3002)
│       ├── index.js
│       ├── Dockerfile
│       └── ...
└── Frontend/                       # Aplicación React (puerto 5173)
    ├── src/
    │   └── app/
    │       ├── components/         # Componentes UI
    │       ├── contexts/           # ThemeContext
    │       ├── hooks/              # Custom hooks
    │       ├── lib/
    │       │   └── api.ts          # Cliente HTTP hacia las APIs
    │       └── routes/             # Páginas de la app
    └── ...
```

---

## Variables de entorno

### User API (`API Proyecto/user-api`)

| Variable | Descripción | Valor por defecto (Docker) |
|----------|-------------|---------------------------|
| `PORT` | Puerto del servidor | `3001` |
| `DB_USER` | Usuario de SQL Server | `sa` |
| `DB_PASSWORD` | Contraseña de SQL Server | — |
| `DB_SERVER` | Host de SQL Server | `sqlserver` |
| `DB_NAME` | Nombre de la base de datos | `SuscripcionesDB` |
| `JWT_SECRET` | Clave para firmar tokens JWT | — |

### Subscriptions API (`API Proyecto/subscriptions-api`)

Las mismas que User API, más:

| Variable | Descripción |
|----------|-------------|
| `ENCRYPTION_KEY` | Clave AES de 32 caracteres para cifrar credenciales |

---

## Notas importantes

### Tokens JWT

Los tokens expiran en **2 horas**. Si después de ese tiempo ves errores 401/403 en el frontend, cierra sesión e inicia sesión de nuevo.

### Fechas de renovación

Al crear una suscripción, la "Próxima Fecha de Pago" se ingresa manualmente — no se calcula automáticamente a partir del ciclo de facturación. Asegúrate de ingresar la fecha correcta que corresponde al ciclo seleccionado.

Cuando registras un pago manualmente (desde Historial Financiero), el sistema avanza la fecha de renovación automáticamente según el ciclo de la suscripción, a partir de la fecha del pago registrado.

### Persistencia de datos

Con Docker Compose, los datos de SQL Server se guardan en el volumen `sqlserver_data`. Este volumen **persiste entre reinicios** (`docker compose down` sin `-v`). Para resetear completamente la base de datos usa `docker compose down -v`.

---

## Solución de problemas

**Los servicios no inician / la app no carga**
- Verifica que Docker Desktop esté corriendo
- Confirma que los puertos 1433, 3001, 3002 y 5173 no están en uso
- Revisa los logs: `docker compose logs -f`

**Error 401 / 403 al navegar**
- El token expiró. Cierra sesión desde el menú lateral y vuelve a iniciar sesión.

**La base de datos no se crea**
- Asegúrate de haber esperado a que aparezca `Scripts ejecutados!` en los logs antes de usar la app.
- Si el mensaje no aparece, prueba: `docker compose down -v && docker compose up --build`

**Error de puerto en uso**
```bash
# Ver qué proceso usa el puerto (ejemplo: 3001)
netstat -ano | findstr :3001   # Windows
lsof -i :3001                  # macOS / Linux
```
