# DUX Mensajería

Aplicación de mensajería en tiempo real con soporte para chats privados y grupos. Construida con React en el frontend y una API REST en .NET en el backend, utilizando SignalR para la comunicación bidireccional vía WebSockets.

**Demo en producción:** [https://dux.somee.com](https://dux.somee.com)

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Variables de entorno](#variables-de-entorno)
- [Cuentas de prueba](#cuentas-de-prueba)
- [Funcionalidades principales](#funcionalidades-principales)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Despliegue](#despliegue)
- [Preguntas frecuentes](#preguntas-frecuentes)
- [Autor](#autor)

---

## Descripción general

DUX Mensajería es una plataforma de comunicación en tiempo real que permite a los usuarios intercambiar mensajes de forma instantánea, tanto en conversaciones privadas como en grupos. El sistema garantiza la entrega de mensajes mediante WebSockets y mantiene el historial de conversaciones persistido en base de datos.

El proyecto fue desarrollado con el objetivo de demostrar el dominio de un stack full stack moderno, cubriendo desde la autenticación con JWT hasta la sincronización en tiempo real con SignalR, pasando por el diseño de una interfaz de usuario responsiva y accesible.

---

## Tecnologías utilizadas

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.2 | Biblioteca principal de UI |
| Vite | 7.x | Bundler y servidor de desarrollo |
| React Router DOM | 7.x | Enrutamiento del lado del cliente |
| Material UI (MUI) | 6.x | Sistema de componentes visuales |
| Microsoft SignalR | 8.x | Cliente WebSocket para tiempo real |
| Emotion | 11.x | Motor de estilos en tiempo de ejecución |

### Backend
| Tecnología | Propósito |
|---|---|
| ASP.NET Core | API REST y servidor de aplicaciones |
| SignalR | Hub de WebSockets para mensajería en tiempo real |
| Entity Framework Core | ORM para acceso a base de datos |
| JWT Bearer | Autenticación y autorización stateless |
| SQL Server | Base de datos relacional |

### Infraestructura
| Servicio | Propósito |
|---|---|
| Vercel | Despliegue del frontend |
| Somee.com | Hosting del backend y base de datos |

---

## Arquitectura del proyecto

```
Cliente (React + Vite)
        │
        ├── HTTP/REST ──────────────▶ ASP.NET Core API
        │                                    │
        └── WebSocket (SignalR) ────────────▶ SignalR Hub
                                             │
                                       SQL Server (EF Core)
```

El frontend se comunica con el backend a través de dos canales:

1. **REST API** para operaciones CRUD: autenticación, registro, carga de historial de mensajes, gestión de grupos.
2. **SignalR (WebSockets)** para la entrega de mensajes en tiempo real sin necesidad de polling.

---

## Requisitos previos

Antes de ejecutar el proyecto localmente, asegurate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior (incluido con Node.js)
- Acceso a internet (el backend ya está desplegado en producción)

Para verificar las versiones instaladas:

```bash
node --version
npm --version
```

---

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/WalterDuchi/dux.git
cd dux
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_API_URL=https://dux.somee.com
```

Este archivo ya está incluido en el repositorio con los valores correctos para conectarse al backend en producción.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### Otros comandos disponibles

```bash
npm run build      # Genera el bundle de producción en /dist
npm run preview    # Sirve el build de producción localmente
npm run lint       # Ejecuta ESLint sobre todo el proyecto
```

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API REST y SignalR Hub | `https://dux.somee.com` |

Todas las variables de entorno que expone Vite al cliente deben tener el prefijo `VITE_`.

---

## Cuentas de prueba

La aplicación incluye usuarios precargados para facilitar la evaluación:

| Usuario | Contraseña | Descripción |
|---|---|---|
| `admin` | `password123` | Cuenta con acceso completo |
| `walter` | `password123` | Usuario estándar |
| `alejandro` | `password123` | Usuario estándar |

En la pantalla de login hay accesos directos para rellenar las credenciales automáticamente con un solo clic.

---

## Funcionalidades principales

- **Autenticación segura** con JWT. El token se almacena en `localStorage` y se valida en cada sesión.
- **Registro de nuevos usuarios** con validación de contraseñas en el cliente.
- **Chat privado** entre dos usuarios con historial persistido.
- **Grupos de chat** con creación dinámica e invitación de miembros.
- **Mensajería en tiempo real** mediante SignalR. Los mensajes aparecen instantáneamente en todos los clientes conectados sin recargar la página.
- **Indicador de envío** con estado optimista: el mensaje se muestra de inmediato mientras se confirma la entrega.
- **Sidebar de conversaciones** con lista de chats activos y grupos.
- **Tema oscuro** por defecto con paleta de colores coherente usando Material UI.
- **Diseño responsivo** adaptable a distintos tamaños de pantalla.

---

## Estructura del proyecto

```
dux/
├── src/
│   ├── assets/                 # Recursos estáticos
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatComponent.jsx     # Contenedor principal del chat
│   │   │   ├── ChatSidebar.jsx       # Panel lateral con lista de conversaciones
│   │   │   ├── CreateGroupDialog.jsx # Modal para crear grupos
│   │   │   ├── GroupChat.jsx         # Vista de chat grupal
│   │   │   ├── PrivateChat.jsx       # Vista de chat privado
│   │   │   └── index.jsx             # Barrel export del módulo Chat
│   │   ├── Login.jsx                 # Pantalla de inicio de sesión
│   │   └── Register.jsx              # Pantalla de registro
│   ├── contexts/
│   │   └── AuthContext.jsx           # Context API para estado de autenticación
│   ├── App.jsx                       # Componente raíz con rutas y providers
│   └── main.jsx                      # Punto de entrada de la aplicación
├── .env                              # Variables de entorno
├── index.html                        # Plantilla HTML principal
├── package.json                      # Dependencias y scripts
├── vite.config.js                    # Configuración de Vite y proxy de desarrollo
├── eslint.config.js                  # Reglas de linting
└── vercel.json                       # Configuración de despliegue en Vercel
```

---

## Despliegue

### Frontend (Vercel)

El frontend está configurado para desplegarse en Vercel. El archivo `vercel.json` redirige todas las rutas al `index.html` para que React Router maneje la navegación del lado del cliente:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Para desplegar tu propia instancia:

```bash
npm run build
```

Luego conecta el repositorio a Vercel desde su panel web. El build se realiza automáticamente en cada push a la rama principal.

### Backend

El backend está alojado en Somee.com con una base de datos SQL Server. La URL de producción es `https://dux.somee.com`.

---

## Preguntas frecuentes

**¿Por qué no veo los mensajes en tiempo real?**
Verificá que tu navegador permita conexiones WebSocket. Algunos entornos corporativos o redes con proxies estrictos pueden bloquearlas. El proxy de Vite (`vite.config.js`) ya está configurado para redirigir tanto las peticiones HTTP como las conexiones WebSocket al backend durante el desarrollo local.

**¿Puedo levantar el backend localmente?**
El repositorio actual contiene únicamente el frontend. El backend en .NET es un proyecto separado. Para una evaluación completa, el backend en producción (`https://dux.somee.com`) ya está disponible y es el que usa la configuración por defecto del `.env`.

**¿Los mensajes se persisten si cierro el navegador?**
Sí. El historial de conversaciones se guarda en la base de datos del servidor. Al volver a ingresar con la misma cuenta, todos los mensajes anteriores estarán disponibles.

**¿Cómo se maneja la autenticación?**
Al iniciar sesión, el servidor devuelve un token JWT que se almacena en `localStorage`. En cada petición a la API se incluye ese token en el header `Authorization: Bearer <token>`. Al cargar la aplicación se valida el token con el endpoint `/api/auth/validate`; si no es válido, la sesión se cierra automáticamente.

**¿Qué navegadores son compatibles?**
Cualquier navegador moderno con soporte para ES2020 y WebSockets: Chrome 85+, Firefox 80+, Edge 85+, Safari 14+.

**¿Cómo creo un nuevo grupo?**
Desde la sidebar del chat, hacé clic en el botón de nuevo grupo. Se abre un diálogo donde podés ingresar el nombre del grupo y seleccionar los miembros que querés agregar.

---

## Autor

**Walter Alejandro Duchi Rivera**

Desarrollador Full Stack con experiencia en React, .NET y arquitecturas orientadas a eventos con WebSockets.

- GitHub: [@WalterDuchi](https://github.com/Walter-Duchi)
- LinkedIn: [linkedin.com/in/walterduchi](https://www.linkedin.com/in/walter-duchi/)

---

*Proyecto desarrollado como parte del portafolio profesional.*
