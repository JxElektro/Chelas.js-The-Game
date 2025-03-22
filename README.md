ChelasJS – App de Networking para Eventos
ChelasJS es una aplicación web (principalmente móvil) pensada para facilitar el networking en eventos, conferencias o reuniones sociales, ayudando a los participantes a romper el hielo y conocerse mejor a través de temas de conversación sugeridos. El nombre surge de la idea de compartir una “chela” (cerveza) y charlar de manera relajada, pero es adaptable a cualquier contexto.

Índice
Acerca del Proyecto

Características Principales

Tecnologías Utilizadas

Arquitectura y Estructura de Datos

Flujo de Usuario

Integración con DeepSeek API

Instalación y Configuración

Uso de la Aplicación

Próximas Mejoras y Roadmap

Contribución

Contacto

Acerca del Proyecto
En muchas conferencias o reuniones, especialmente en el ámbito tecnológico, se hace difícil entablar conversación cuando no se conocen los gustos o intereses de los demás. ChelasJS nace para:

Sugerir temas de conversación adaptados a los intereses de cada usuario.

Permitir a los asistentes descubrir y conectar con otros participantes de forma más relajada.

Romper el hielo incluso cuando no hay otros usuarios disponibles (mediante un perfil predeterminado / bot).

Características Principales
Interfaz en Español

Toda la aplicación está diseñada para un público hispanohablante.

Diseño Responsivo (Mobile-First)

Enfocado en uso desde dispositivos móviles, con un layout responsivo que también funciona en escritorio.

Selector de Intereses Intuitivo

Usa tabs para separar categorías (por ejemplo, “Trabajo”, “Personal”, “Hobbies”, “Cultura”, etc.).

Incluye un checklist básico para elegir intereses rápidamente.

Posibilidad de hablar con la IA para refinar y personalizar aún más los gustos del usuario.

Bot Conversacional (Usuario Predeterminado)

Si no hay otro usuario disponible o el participante no ha iniciado sesión, se ofrece un perfil-bot para practicar o simular una conversación.

Este bot tiene intereses ficticios y genera respuestas para que la experiencia sea fluida.

Temporizador de Conversación

Cada conversación tiene un tiempo límite ajustable (por defecto 3 minutos) para mantener la dinámica.

Preferencias Personalizadas

El usuario puede indicar qué temas desea tratar y cuáles prefiere evitar (almacenados en su perfil).

Registro y Autenticación

Se integra con Supabase Auth para manejar la creación de cuentas e inicio de sesión.

Tecnologías Utilizadas
React con TypeScript

Para el desarrollo del frontend, asegurando tipado estático y componentes reutilizables.

Supabase

Base de datos PostgreSQL y servicios de autenticación (Auth).

Realtime para detectar cambios en tiempo real (usuarios conectados o desconectados).

Framer Motion

Para animaciones fluidas en la interfaz.

Tailwind CSS

Para un diseño rápido y responsivo, con clases utilitarias.

DeepSeek AI

API de inteligencia artificial que genera temas de conversación basados en los intereses de los usuarios.

Arquitectura y Estructura de Datos
La aplicación sigue una arquitectura cliente-servidor. ChelasJS es una Single Page Application (SPA) en React, que interactúa con Supabase para la persistencia de datos y la autenticación.

Base de Datos (Supabase)
Tabla usuarios

id (UUID): Identificador único del usuario.

email: Correo electrónico para autenticación.

nombre: Nombre o nickname visible para otros participantes.

avatar: URL o identificador de avatar.

temas_preferidos: Array de temas de interés.

temas_evitar: Array de temas que el usuario prefiere no tratar.

estado: Estado actual (online_disponible, en_conversacion, offline).

Tabla conversaciones

id (UUID): Identificador único de la conversación.

usuario1_id y usuario2_id: Referencias a la tabla usuarios.

tema_generado: Tema o pregunta sugerido por la IA.

inicio y fin: Timestamps de inicio y fin de la conversación.

estado_conversacion: pendiente, activa, finalizada o cancelada.

Tabla temas (Opcional)

Catálogo con la lista de categorías de intereses para el checklist y las tabs.

El uso de Row Level Security (RLS) en Supabase garantiza que cada usuario solo acceda y modifique su propia información.

Flujo de Usuario
Registro / Inicio de Sesión

El usuario ingresa su correo y contraseña (o Magic Link).

Supabase maneja la creación de la cuenta y la autenticación.

Configuración de Perfil

El usuario elige un nombre (o nickname) y un avatar.

Selecciona sus intereses en un selector con tabs (ej. “Trabajo”, “Personal”, “Hobbies”, “Cultura”, etc.).

Puede hablar con la IA para detallar aún más sus gustos, y la app actualizará los temas_preferidos en la base de datos.

Lobby (Lista de Usuarios Disponibles)

Al marcarse como “disponible”, el usuario aparece en el lobby.

Se muestra un listado de usuarios activos, con su avatar y nombre.

Emparejamiento

El usuario invita a otro a conversar.

La IA (DeepSeek) genera un tema basado en los intereses de ambos.

Inicia el temporizador de conversación (por defecto 3 minutos).

Conversación

Durante el tiempo asignado, ambos usuarios discuten el tema en persona o por chat (dependiendo de la implementación).

Al terminar, pueden extender la conversación, solicitar otro tema o volver al lobby.

Bot Conversacional

Si no hay nadie disponible o el usuario no ha iniciado sesión, puede hablar con un perfil predeterminado (bot).

Este bot tiene intereses simulados y permite practicar la dinámica de la aplicación sin requerir a otra persona.

Historial

Las conversaciones finalizadas se registran en la tabla conversaciones para evitar repetir temas y dar seguimiento a la experiencia del usuario.

Integración con DeepSeek API
Contexto para la IA:

Se combinan los intereses de ambos usuarios y se excluyen los temas marcados como “a evitar”.

El prompt se envía a la API de DeepSeek.

Se recibe un tema o pregunta adaptado a esos intereses.

Manejo de la Clave API:

En desarrollo, puede estar hardcodeada para pruebas.

En producción, se guarda en variables de entorno (por ejemplo, DEEPSEEK_API_KEY) para mayor seguridad.

Instalación y Configuración
Clonar el Repositorio

bash
Copiar
git clone <URL_DEL_REPOSITORIO>
cd chelasjs
Instalar Dependencias

bash
Copiar
npm install
# o
yarn install
Configurar Variables de Entorno
Crea un archivo .env en la raíz del proyecto con la configuración de Supabase y la clave de DeepSeek (si la tienes disponible). Por ejemplo:

env
Copiar
REACT_APP_SUPABASE_URL=https://<TU_PROYECTO>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<TU_ANON_KEY>
REACT_APP_DEEPSEEK_API_KEY=<TU_DEEPSEEK_KEY>
(Ajusta los nombres de las variables según tu configuración.)

Iniciar el Servidor de Desarrollo

bash
Copiar
npm run dev
# o
yarn dev
Abre http://localhost:3000 para ver la aplicación en tu navegador.

Uso de la Aplicación
Registro / Login

Regístrate con tu correo y contraseña.

Si la confirmación de email está activa, revisa tu bandeja de entrada para validar la cuenta.

Perfil e Intereses

Elige tu nombre, avatar y navega por las tabs de temas (por ejemplo, “Trabajo”, “Personal”, “Hobbies”, “Cultura”, etc.) para marcar tus intereses.

Conversa con la IA para afinar o descubrir nuevos gustos.

Lobby

Pulsa el botón “Disponible” para aparecer en la lista.

Selecciona a un usuario para invitarlo a conversar.

Si no hay usuarios disponibles, inicia una charla con el bot predeterminado.

Conversación

Recibirás un tema de conversación generado por la IA.

Habla en persona o por chat (si está implementado) y observa el temporizador.

Finalizar o Extender

Al terminar el tiempo, decide si deseas seguir conversando, pedir otro tema o regresar al lobby.

Próximas Mejoras y Roadmap
Chat en Tiempo Real

Implementar mensajería instantánea dentro de la app para quienes no pueden hablar en persona.

Feedback y Calificaciones

Posibilidad de dar “like” o calificar la experiencia de la conversación.

Mejoras en el Bot

Añadir personalidades o estilos de respuesta distintos.

Interfaz de Edición de Perfil

Permitir cambiar intereses, avatar y nombre de manera más rápida.

Múltiples Eventos

Soportar diferentes eventos en simultáneo, cada uno con su propio lobby.

Contribución
¡Las contribuciones son bienvenidas! Para colaborar en el proyecto:

Haz un fork de este repositorio.

Crea una rama para tu funcionalidad o corrección de bug (git checkout -b feature/nueva-funcionalidad).

Realiza los cambios y haz commit.

Abre un Pull Request describiendo tus modificaciones y su propósito.

