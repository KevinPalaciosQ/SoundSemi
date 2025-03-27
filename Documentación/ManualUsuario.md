# 🎧 SoundStream


# Manual de Usuario

## ÍNDICE#️⃣:

1. [Objetivos](#objetivos)
2. [Explicación y Descripción de la aplicación](#explicación-y-descripción-de-la-aplicación)
3. [Cómo utilizar la aplicación](#cómo-utilizar-la-aplicación)
    - [Usuario Subscriptor](#usuario-subscriptor)
        * [Ingresar a la plataforma](#1-ingresar-a-la-plataforma)
        * [Registro](#2-registro)
        * [Home](#3-home)
        * [Búsqueda](#4-búsqueda)
        * [Perfil](#5-perfil)
        * [Radio](#6-radio)
        * [Crea tu Playlist](#7-crea-tu-playlist)
        * [Mis Playlists](#8-mis-playlists)
        * [Agregando canciones a una playlist](#agregando-canciones-a-una-playlist)
        * [Eliminando canciones de una playlist](#eliminando-canciones-de-una-playlist)
        * [Favoritos](#favoritos)
        * [El Reproductor](#7-el-reproductor)
        * [Cerrar Sesión](#9-cerrar-sesión)
    - [Usuario Administrador](#usuario-administrador)
        * [CRUD Cancion](#crud-cancion)



## Objetivos:
### General:
Brindar al usuario una guía clara y completa para el uso de 'SoundStream' - una plataforma de streaming de música en línea, de modo que la experiencia de este sea satisfactoria, personalizada y conveniente, de tal manera que pueda efectivamente disfrutar de todas las características y funcionalidades que esta plataforma ofrece.

### Específicos:
1. Brindar una experiencia totalmente personalizable y única al usuario.
2. Explicar al usuario la manera de utilizar la plataforma para que este pueda registrarse, escuchar música, crear sus listas de reproducciones y demás.
3. Proporcionar información sobre problemas y/o dudas comunes que puedan surgir al utilizar la aplicación.
4. Informar al usuario administrador sobre el manejo correcto de la aplicación.

## Explicación y Descripción de la aplicación
Se presenta la plataforma denominada "SoundStream", una aplicación web en la nube - accesible de cualquier navegador, donde el usuario subscriptor podrá disfrutar de funciones tales como  reproducir canciones, guardar canciones favoritas, escuchar álbumes, crear sus propias playlists, ver la información sobre su artista favorito, realizar lo que son búsquedas y visualizar las estadísticas sobre su cuenta - además de poder personalizar su perfil y tener una experiencia adaptada a sus preferencias personales. Igualmente, si lo desea, también posee la oportunidad de descubrir nueva música y artistas por la función de radio. 
<br>
Adicionalmente, si el usuario posee el rol de administrador, no solo disfrutará las funcionalidades previamente mencionadas, sino que tendrá más control - esto por medio de las gestiones disponibles para las canciones, álbumes y artistas. Un adminstrador es capaz de agregar, editar, eliminar y visualizar con mejor detalle los anteriores puntos, lo que contribuye a una experiencia mejorada y completa.

## Cómo utilizar la aplicación
### _Usuario Subscriptor_
#### 1. Ingresar a la plataforma
Se le presenta a usted la siguiente pantalla al ingresar:
<br>
![Inicio](1.jpeg)
Si posee cuenta, podrá ingresar con su correo electrónico y contraseña, de lo contrario, deberá registrarse.

#### 2. Registro
Para poder registrarse, en la pantalla de inicio deberá de hacer click en la sección de **Regístrate aquí**. Una vez hecho esto, se le presentará la siguiente pantalla:
<br>
![Registro](2.jpeg)

Deberá de llenar sus datos acorde al formulario:
- Nombres
- Apellidos
- Correo electrónico
- Fecha de nacimiento
- Contraseña
- Confirmar contraseña
- Seleccionar foto
Una vez completos sus datos, podrá clickear en el botón de **Registrar**.

Y aparecerá un mensaje:
<br>
![Registro](3.jpeg)
Que cuando usted confirme, lo redirigirá a la pantalla de inicio de sesión par que posteriormente pueda ingresar a la plataforma.

#### 3. Home
Una vez que usted se haya registrado o ingresado a la plataforma, se le presentará la siguiente pantalla:
<br>
![Home](4.jpeg)
Dicha pantalla corresponde al Home, su página principal - puede entonces navegar por las diferentes secciones de la plataforma por la sidebar que se encuentra a la izquierda de la pantalla o si usted lo desea, permanecer en el Home, donde bastará con un click en alguna de las canción que se le presenta para empezar a reproducirla. 
![Home](6.jpeg)


#### 4. Búsqueda
Se le presenta en la Navbar la opción de _buscar_, donde la siguiente pantalla se le presentará:
![Busqueda](5.jpeg)
Las canciones puede usted reproducirlas por medio del botón de play que se le presenta,- como se mostró en la sección de _Home_.

#### 5. Perfil
En la Navbar se le presenta la opción de _perfil_, donde la siguiente pantalla se le presentará si usted hace click en ella:
![Perfil](./7.jpeg)

Como puede verse, usted es capaz de editar y actualizar su información una vez hace click en el botón de _Editar_, donde se le presentará el siguiente formulario:
![Perfil](8.jpeg)

#### 6. Radio
En la Navbar se le presenta la opción de _radio_, donde todas las canciones disponibles se le serán presentadas y de manera aleatoria, se reproducirán:
![Radio](9.jpeg)

#### 7. Crea tu Playlist
En esta sección, usted podrá configurar y crear una nueva playlist - donde podrá agregar canciones, editar su información y eliminarla. Para ello, en la Navbar se le presenta la opción de _Crea tu Playlist_, donde la siguiente pantalla se le presentará si usted hace click en ella:
![Playlist](./10.jpeg)


#### _Favoritos_:
Para agregar una canción a favoritos, bastará con hacer click al corazón que se le presenta cada vez que se lista una canción:
![Playlist](./FAV.jpeg)

#### 8. El Reproductor
Una vez ya descritas las maneras de interactuar con las canciones, se presenta el reproductor, el cual se encuentra en la parte inferior de la pantalla. Una vez usted decida reproducir una canción, esta empezará a sonar y se le presentará la siguiente pantalla:

![Reproductor](./REP.jpeg)

Como puede notar, es posible visualizar el nombre del artista, nombre de la canción al igual que su respectiva imagen. Podrá usted:
* Pausar la canción
* Reanudar la canción
* Avanzar a la siguiente canción
* Retroceder a la canción anterior
* Elegir por medio de la barra de progreso, el punto de la canción en el que desea reproducir
* Ajustar el volumen de la canción


#### 9. Cerrar Sesión
Para cerrar sesión, deberá de hacer click en la opción de Salida que aparece en la parte superior derecha de la pantalla:
![Cerrar](./CERRAR.jpeg)


### _Usuario Administrador_
Como se mencionó anteriormente, el usuario administrador posee las mismas funcionalidades que el usuario subscriptor, pero además, posee la capacidad de gestionar las canciones. Para ello, en la Navbar se le presenta la opción nueva de _Funcionalidades CRUD_, donde la siguiente pantalla se le presentará si usted hace click en ella:

![Gestion](./ADMIN.jpeg)

#### CRUD Administrador
Se le presentará la siguiente pantalla si usted hace click en la opción de _CRUD Administrador:
![Cancion](./crud.jpeg)

Donde usted podrá agregar, editar, eliminar y visualizar las canciones que se encuentran en la plataforma.
*_Agregar_*:
Para agregar una canción, deberá de hacer click en el botón de _Agregar Canción_, donde se le presentará el siguiente formulario:
![Cancion](./formulario.jpeg)

> Nota: Para agregar una canción, deberá de tener previamente un artista.
> Espere a que la canción se haya subido correctamente, esto puede tardar unos segundos, al igual que la imagen.

Una vez llena la información, deberá de hacer click en el botón de _Guardar_.

*_Actualizar_*:
Es posible actualizar los datos de una canción, para ello, deberá de hacer click en el botón  de _Actualizar_ que se le presenta y con esto, se le presentará el siguiente formulario:


*_Delete_*:
Es posible eliminar una canción, para ello, deberá de hacer click en el botón rojo de _Eliminar_ q

Donde usted deberá de ingresar su contraseña de administrador y hacer click en el botón de _Eliminar_, si es correcta - la canción será eliminada.




