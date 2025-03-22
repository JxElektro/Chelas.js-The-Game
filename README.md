
# ChelasJS - App de Networking para Eventos

## Acerca del Proyecto

ChelasJS es una aplicación de networking diseñada para ayudar a los asistentes de conferencias y eventos a romper el hielo y conocer a otros participantes a través de temas de conversación sugeridos.

## Características Principales

- **Interfaz en Español**: Aplicación completamente adaptada para usuarios hispanohablantes.
- **Diseño Responsivo**: Optimizado principalmente para dispositivos móviles.
- **Temas de Conversación Diversos**: Desde tecnología hasta arte, música, deportes y más.
- **Bot Conversacional**: Perfil predefinido para simular conversaciones cuando no hay otros usuarios disponibles.
- **Temporizador de Conversación**: Ayuda a mantener conversaciones dinámicas.
- **Preferencias Personalizadas**: Los usuarios pueden seleccionar temas que les interesan y aquellos que prefieren evitar.

## Tecnologías Utilizadas

- React con TypeScript
- Supabase para base de datos y autenticación
- Framer Motion para animaciones
- Tailwind CSS para estilos
- DeepSeek AI para generación de temas de conversación

## Integración con DeepSeek API

La aplicación utiliza la API de DeepSeek para generar temas de conversación personalizados basados en los intereses compartidos de los usuarios. En la versión de producción, esta clave se manejará a través de variables de entorno.

## Estructura de la Base de Datos

- **Perfiles**: Información de los usuarios
- **Intereses**: Categorías y temas de conversación 
- **Conversaciones**: Registro de interacciones entre usuarios
- **Temas de Conversación**: Temas generados para cada conversación

## Próximas Mejoras

- Sistema completo de autenticación con login y registro
- Más categorías de temas de conversación
- Implementación de chat en tiempo real
- Sistema de feedback para calificar conversaciones

## Desarrollo

Para ejecutar el proyecto localmente:

```sh
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## Contacto

Para cualquier consulta o sugerencia sobre el proyecto, por favor contacta al equipo de desarrollo.

