# CRUD_SOPORTEUDLA

![Estado del proyecto](https://img.shields.io/badge/STATUS-EN%20DESARROLLO-green)

## Descripción

CRUD_SOPORTEUDLA es un sistema de gestión de tickets diseñado para empresas o equipos de soporte técnico. Su objetivo es optimizar la asignación de tickets entre agentes de soporte, garantizando una distribución equitativa de tareas y mejorando la eficiencia del equipo. Este sistema incluye funcionalidades avanzadas, como reportes personalizados, filtros por fechas, y la implementación de roles de usuario.

---

## Índice

1. [Descripción](#descripción)
2. [Características](#características)
3. [Requisitos Previos](#requisitos-previos)
4. [Instalación](#instalación)
5. [Uso](#uso)
6. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
7. [Capturas de Pantalla](#capturas-de-pantalla)
8. [Contribución](#contribución)
9. [Licencia](#licencia)

---

## Características

- **Gestor de tickets:** Creación, asignación y actualización de tickets.
- **Roles de usuario:** Permite diferenciar entre solicitantes, gestores y agentes.
- **Asignación automática:** Distribución equitativa de tickets basada en carga de trabajo, prioridad y ubicación.
- **Reportes personalizados:** Incluye filtros avanzados por fechas, estado y agente.
- **Autenticación JWT:** Seguridad implementada con tokens.
- **Frontend moderno:** Construido con React para una experiencia de usuario fluida.
- **Backend robusto:** API RESTful con Node.js y Sequelize.

---

## Requisitos Previos

Asegúrate de tener instalados:

- **Node.js** (v14 o superior)
- **npm** o **yarn**
- **MySQL** (o el sistema de base de datos configurado en tu proyecto)

---

## Instalación

Sigue estos pasos para configurar el proyecto localmente:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/EstebanEr03/CRUD_SOPORTEUDLA.git
   cd CRUD_SOPORTEUDLA
   ```
2. **Instala las dependencias:**
   ```bash
   npm install
   # o
   yarn install
   ```
3. **Configura las variables de entorno:**
   - Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=tu_contraseña
     DB_NAME=nombre_base_datos
     JWT_SECRET=tu_secreto
     PORT=3001
     ```
4. **Crea y configura la base de datos:**
   - Ejecuta el script de inicialización de la base de datos, si existe.
   - Usa las migraciones de Sequelize:
     ```bash
     npx sequelize-cli db:migrate
     ```
5. **Inicia el servidor:**
   ```bash
   npm run dev
   # o
   yarn dev
   ```
6. **Inicia el cliente:**
   ```bash
   cd client
   npm start
   # o
   yarn start
   ```

---

## Uso

### Roles disponibles

1. **Solicitante:** Puede crear tickets y consultar su estado.
2. **Gestor:** Puede asignar y gestionar tickets, así como priorizarlos.
3. **Agente:** Puede actualizar el estado de los tickets asignados.

### Acceso al sistema

- Visita `http://localhost:3000` después de iniciar el cliente.
- Ingresa con las credenciales proporcionadas.

---

## Arquitectura del Proyecto

```
root
├── server
│   ├── controllers   # Lógica de la API
│   ├── models        # Modelos de Sequelize
│   ├── routes        # Rutas de la API
│   ├── middleware    # Middlewares como autenticación
│   └── config        # Configuración de la base de datos
├── client
│   ├── src
│   │   ├── components  # Componentes reutilizables
│   │   ├── views       # Vistas principales
│   │   ├── controllers # Lógica de frontend
│   │   └── App.js      # Configuración de rutas
└── README.md          # Documentación del proyecto
```

---

## Capturas de Pantalla

### Pantalla de Inicio

![Pantalla de Inicio](ruta/a/imagen_inicio.png)

### Gestión de Tickets

![Gestión de Tickets](ruta/a/imagen_tickets.png)

### Reportes

![Reportes](ruta/a/imagen_reportes.png)

---

## Contribución

Si quieres contribuir:

1. Haz un fork del proyecto.
2. Crea una rama con tu característica o arreglo:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y confirma los commits:
   ```bash
   git commit -m "Agrega nueva funcionalidad"
   ```
4. Envía tus cambios al repositorio remoto:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. Crea un Pull Request en GitHub.

---

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

---

## Autor

- **Esteban Enríquez** - [Perfil de GitHub](https://github.com/EstebanEr03)

