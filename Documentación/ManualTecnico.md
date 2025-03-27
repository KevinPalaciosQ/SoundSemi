# 🎶 SoundStream

<div align="center"><img src="./imgTecnico/login.png" width="300"/></div>

# Manual Técnico

## ÍNDICE:

- [🎶 SoundStream](#-soundstream)
- [Manual Técnico](#manual-técnico)
  - [ÍNDICE:](#índice)
  - [Objetivos](#objetivos)
    - [General](#general)
    - [Específicos](#específicos)
  - [Arquitectura del proyecto](#arquitectura-del-proyecto)
  - [Estructura del código](#estructura-del-código)
    - [Backend](#backend)
      - [Python](#python)
      - [NodeJS](#nodejs)
    - [API](#api)
    - [Frontend](#frontend)
      - [Reactjs](#reactjs)
  - [Descripción de los servicios de AWS](#descripción-de-los-servicios-de-aws)
    - [S3](#s3)
      - [Buckets](#buckets)
    - [EC2](#ec2)
    - [Load Balancer](#load-balancer)
    - [RDS](#rds)
    - [IAM](#iam)
  - [Conclusiones](#conclusiones)

## Objetivos

### General
Brindar al desarrollador una guía para la comprensión del código y la arquitectura del proyecto.Asi mismo poder comprender como poder adaptar el proyecto a servicios en la nobe que en este caso es AWS.

### Específicos

1. Comprender la arquitectura del proyecto.
2. Comprender la estructura del código.
3. Comprender los servicios de AWS utilizados.
4. Comprender como adaptar el proyecto a servicios en la nube.

## Arquitectura del proyecto

![Arquitectura](../Documentación/imgTecnico/Arquitectura.jpeg)

Dicha arquitectura se presenta en donde contamos con un cliente que accede al sitio web de `SoundStream` que está alojado en S3, asi tambien cualquier peticion que quiere realizar pasará por un Load Balancer que se encargará de distribuir la carga entre los servidores EC2 donde aloja uno una API desarrollada con Python y otra una API desarrollada en NodeJS, en donde se encuentran en una zona de disponibilidad, estos servidores se encargan de procesar las peticiones y de acceder a la base de datos que se encuentra en RDS.

## Estructura del código

### Backend

#### Python
<div align="center"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1869px-Python-logo-notext.svg.png" width="100"/></div>

Para la realización de la API desarrollada en Python se utilizó el framework de Flask, el cual es un framework de Python que permite la creación de API's de forma sencilla.

Para poder ejecutar el proyecto se utilizó el siguiente comando:

``` 
pyhon3 main.py 
```

Para esto se necesita haber instlado con pip3 los requerimientos que se encuentran en el archivo [`requirements.txt`](../../Backend/Python/src/requirements.txt).

Puede ubicar el código del Backend desarrollado en Python se encuentra en la carpeta [`Python`](./../../Backend/Python) en donde se encuentra la carpeta [`src`](./../../Backend/Python/src) en donde se encuentra el código de la API.

Este proyecto se encuentra corriendo en un servidor EC2 en la zona de disponibilidad `us-east-1a` en el puerto `3001`.

- Para el uso de la base de datos se utilizó la librería de mysql-connector-python.
- Para el manejo de objetos S3 se utilizó la librería de boto3.
- Para el manejo de los endpoints se utilizó la librería de Flask con Blueprint para poder separar los endpoints por archivos.

#### NodeJS
<div align="center"><img src="https://seeklogo.com/images/N/nodejs-logo-FBE122E377-seeklogo.com.png" width="100"/></div>

Para la realización de la API desarrollada en NodeJS se utilizó el framework de Express, el cual es un framework de NodeJS que permite la creación de API's de forma sencilla.

Tambien se utilizó la librería de Multer para poder subir archivos a S3, asi mismo tambien se utilizó la librería de Bcrypt para poder encriptar las contraseñas de los usuarios, la librería de UUID para poder generar los id's de los usuarios y la librería de Morgan para poder ver las peticiones que se realizan a la API, asi mismo tambien se utilizó la librería de Cors para poder realizar peticiones desde el cliente.

Para poder conectarse a la base de datos se utilizó la librería de mysql2, y para poder conectarse a S3 se utilizó la librería de aws-sdk.

Para poder ejecutar el proyecto se utilizó el siguiente comando:

```
node app.js
```

Para esto se necesita haber instlado con npm los requerimientos que se encuentran en el archivo [`package.json`](../../Backend/NodeJS/package.json).

El codigo de la API se encuentra en la carpeta [`NodeJS`](./../../Backend/NodeJS) en donde se encuentra la carpeta [`src`](./../../Backend/NodeJS/src) en donde se encuentra el código de la API.

Este proyecto se encuentra corriendo en un servidor EC2 en la zona de disponibilidad `us-east-1a` en el puerto `3001`.

### API

Aca se encuentra la documentación de los endpoints de la API desarrollada en Python y NodeJS.

- [ENPOINTS](https://documenter.getpostman.com/view/15418354/2s9YJey1DJ)


### Frontend

#### Reactjs
<div align="center"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/539px-React-icon.svg.png" width="100"/></div>

Para la realización de la interfaz por la parte del cliente se utilizó la librería de ReactJS la cual es una librería de JavaScript que permite la creación de interfaces de usuario de forma sencilla.

Para poder correr el proyecto en entorno de desarrollo se utilizó el siguiente comando:

```bash
npm start
```

Puede ubicar el código en la carpeta [`Frontend`](./../../Frontend) en donde se encuentra la carpeta [`src`](./../../Frontend/src) en donde se encuentra el código de la interfaz.

Este proyecto se encuentra alojado en S3. Y se compone por distintos componentes, pages, context, hooks, etc.

Para el uso de estilos se utilizó la librería de TailwindCSS.

Para el uso de iconos se utilizó la librería de HeroIcons y ReactIcons.

Para el uso de rutas se utilizó la librería de ReactRouter la cual cuenta con las rutas de los distintos componentes en el siguiente [enlace](./../../Frontend/src/index.jsx).

## Descripción de los servicios de AWS
<div align="center"><img src="https://5.imimg.com/data5/SELLER/Default/2021/8/NP/YN/DN/3775979/aws-logo.png" width="200"/></div>

Para la realización de este proyecto se utilizó el proveedor de servicios en la nube de AWS, en donde se utilizó los siguientes servicios:

### S3
<div align="center"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Amazon-S3-Logo.svg/1712px-Amazon-S3-Logo.svg.png" width="100"/></div>

Descripción xd

#### Buckets

- `multimedia-semi1-a-g15`:

- `multimedia-semi1-a-g15`: Bucket en donde se encuentra alojado el proyecto de ReactJS y donde estará expuesto el link a todo publico.

    ![buckets](./imgTecnico/bucket.png)

### EC2
<div align="center"><img src="https://www.logicata.com/wp-content/uploads/2020/08/Amazon-EC2@4x-e1593195270371.png" width="100"/></div>

Amazon Elastic Compute Cloud (Amazon EC2) fue utilizado en nuestro proyecto para poder alojar los servidores en donde se alojan las API's desarrolladas en Python y NodeJS. Asi mismo tambien se utilizó para recibir las peticiones del Load Balancer y poder acceder a la base de datos de RDS.

#### Instancias

- `EC2-1`: En esta instancia se aloja la API desarrollada en Python, que es ejecutada en el puerto 4000 y se encuentra en la zona de disponibilidad `us-east-1a`.

- `EC2-2`: En esta instancia se aloja la API desarrollada en NodeJS, que es ejecutada en el puerto 4000 y se encuentra en la zona de disponibilidad `us-east-1a`.

#### Creación de Instancias

##### 1. _Instancias_
Para comenzar con la configuración de las instancias, primeramente se accedió a la cuenta - lo que llevó a la página de inicio de la Consola:
Una vez accedido, se ingresó al servicio de EC2:

Se busca en el Panel de Navegación de la izquierda la opción de `Instancias` y se selecciona la opción de `Lanzar Instancia`:
###### Se configuraron las instancias de la siguiente manera:

Se ingresa el nombre de la instancia:
Se selecciona la imagen de la máquina en este caso Ubuntu y se selecciona la versión 22.04 LTS, se selecciona la arquitectura de la máquina en este caso x86 (Free Tier):
Se selecciona el tipo de instancia, en este caso se seleccionó `t2.micro` y se crean claves SSH para poder acceder a la instancia:

<div align="center"><img src="./imgTecnico/EC2/config1.png" width="700"/></div>

Se crea el grupo de claves para poder acceder al la maquina virtual.
<div align="center"><img src="./imgTecnico/EC2/config2.png" width="600"/></div>

<div align="center"><img src="./imgTecnico/EC2/config3.png" width="600"/></div>

Se configura la vpc para la salida a internet.
<div align="center"><img src="./imgTecnico/EC2/config4.png" width="400"/></div>

Se lanza la intancia. 
<div align="center"><img src="./imgTecnico/EC2/config5.png" width="700"/></div>


### Load Balancer
<div align="center"><img src="https://miro.medium.com/v2/resize:fit:301/0*LdwQuhRO4rb4ogdx.png" width="100"/></div>

Una de las características de la aplicación es que posee los 2 servidores los cuales se explicaron anteriormente en la sección de `EC2`. Ya que dichos servidores necesitan una manera de verificar su estado, se utilizó lo que es un *`Load Balancer`*. Amazon AWS nos provee con un el servicio de _Elastic Load Balancing_, este es el que distribuye el tráfico entrante de varios destinos al igual que realizar la dicha monitorización del estado de los destinos que se registran y logra enrutar el tráfico a los destinos con buen estado. 
<br>
La realización de este se muestra a continuación:
<br>

#### Creación del Load Balancer
Para comenzar con la configuración del Load Balancer, primeramente se accedió a la cuenta - lo que llevó a la página de inicio de la Consola:
Una vez accedido, se ingresó al servicio de EC2:
<br>

![ec2](./imgTecnico/LoadBalancing/Panel.png)
<br>

#### 1. _Target Groups_
Primeramente se tuvo que fefinir el grupo de destino para saber a donde se dirigirá el tráfico. Para esto se ingresó a: `EC2 > Grupos de Destino` lo que nos presentó el siguiente panel:

<br>

![target_group](./imgTecnico/LoadBalancing/grupoDestino.png)

<br>

Luego, al seleccionar la opción de `Crear grupo de destino` se configuró de la siguiente manera:

<br>

![target_group](./imgTecnico/LoadBalancing/config1.png)

<br>

> Se seleccionó un tipo destino como 'Instancias'

<br>

![target_group](./imgTecnico/LoadBalancing/config2.png)

<br>

> Se definió el Nombre del grupo destino como 'elb-semi1-a-practica1-grupo15', se seleccionó el protocolo HTTP y el puerto 3001, ya que es el puerto en el que se ejecutan las API de NodeJS y Python. Tipo de direcciones IP como IPv4 y se seleccionó el VPC en el que se encuentran las instancias. Versión de protocolo como HTTP1.

<br>

![target_group](./imgTecnico/LoadBalancing/config3.png)

<br>

> Se definió comprobaciones de estado con la ruta /.

<br>

![target_group](./imgTecnico/LoadBalancing/config4.png)

<br>

> Por último, se registraron los destinos, en este caso las instancias que se crearon anteriormente.

<br>

![target_group](./imgTecnico/LoadBalancing/config5.png)


<br>

> En base a lo creado, se revisaron los destinos por última vez y se creó el grupo de destino.

<br>


##### 2. _Balanceador de Carga_
En recursos, se ingresó de la siguiente manera:  `Recursos > Balanceadores de Carga`
<br>

![recursos](./imgTecnico/LoadBalancing/config6.png)
<br>

![recursos](./imgTecnico/LoadBalancing/config7.png)
<br>

Dichas acciones nos redireccionó hacia el panel de Balanceadores de Carga:
<br>

![bal_carga](./imgTecnico/LoadBalancing/config8.png)
<br>

Luego, se seleccionó la opción de `Crear balanceador de carga`:
<br>

![bal_carga](./imgTecnico/LoadBalancing/config3.png)
<br>

Una vez dentro, se seleccionó según las opciones que AWS provee, el tipo de equilibrador de carga, en este caso se seleccionó `Balanceador de carga de aplicaciones` esto porque se necesita un balanceador de carga que pueda enrutar el tráfico HTTP y HTTPS a los destinos de Amazon EC2, en donde se ejecutan los servidores.
<br>

![bal_carga](./imgTecnico/LoadBalancing/config4.png)

<br>
Una vez seleccionado, se especificaron los detalles del grupo de la siguiente manera:

<br>

![bal_carga](./imgTecnico/LoadBalancing/config6.png)

<br>

> El nombre del load balancer se definió como elb-semi1-a-practica1-grupo#15 con un esquema expuesto a internet y tipo de direcciones IPv4.

<br>

![bal_carga](./imgTecnico/LoadBalancing/config7.png)

<br>

> Se eligió en el mapeo de red la VPC donde se encuentran las instancias y de Mapeo 3 zonas de disponibilidad.

<br>

![bal_carga](./imgTecnico/LoadBalancing/config9.png)

<br>

> Grupo de seguridad default.

<br>

![bal_carga](./imgTecnico/LoadBalancing/config10.png)

<br>

> Se seleccionó el grupo de destino creado anteriormente.

<br>

![bal_carga](./imgTecnico/LoadBalancing/config11.png)

<br>

> Se presenta el resumen de las configuraciones.

<br>

![bal_carga](./imgTecnico/LoadBalancing/config12.png)

<br>

> Se guardó el balanceador de carga.

<br>


### RDS
<div align="center"><img src="https://brandslogos.com/wp-content/uploads/images/large/aws-rds-logo.png" width="100"/></div>

Creación de la base de datos en RDS

Para comenzar con la configuración de la base de datos, primeramente se accedió a la cuenta - lo que llevó a la página de inicio de la Consola:

Una vez accedido, se ingresó al servicio de RDS:

Se busca en el Panel de Navegación de la izquierda la opción de `Bases de datos` y se selecciona la opción de `Crear base de datos`, en elegir un metodo de creación se selecciona `Creación estándar`:


Se selecciona el motor de base de datos, en este caso se seleccionó `MySQL`:


Se selecciona la versión del motor de base de datos, en este caso se seleccionó `MySQL 8.0.33`:

En las opciones de plantilla se selecciona `Capa Gratuita`:


Le indicamos el identificador de la base de datos

Se le asigna un nombre de usuario y una contraseña para poder acceder a la base de datos:


Se selecciona el tamaño de la instancia, en este caso se seleccionó `db.t3.micro`:


Se selecciona la zona de disponibilidad, en este caso se seleccionó `us-east-1d`

Le damos acceso al publico y se selecciona el grupo de seguridad que se creó anteriormente `vpc-mysql-semi` la cual tiene el puerto 3306 abierto tanto para el acceso publico como para el acceso privado:

Para la auteuticacion de la base de datos se selecciona `Autenticación con contraseña`:

Se crea la base de datos:

<div align="center"><img src="./imgTecnico/RDS/panelRDS.png"/></div>

#### Diagrama Entidad Relación

<div align="center"><img src="./imgTecnico/RDS/rds.jpg"/></div>

### IAM
<div align="center"><img src="https://logowiki.net/uploads/logo/a/aws-iam.svg" width="80"/></div>

Para poder realizar la conexión entre los servicios de AWS se utilizó IAM, en donde se crearon distintos roles para poder acceder a los distintos servicios. Asi mismo tambien se crearon distintos usuarios para poder acceder a los distintos servicios dependiendo del rol que desempeñaran en el desarrollo. A si mismo a cada desarrollador se le asigno un usuario con un rol especifico para poder acceder a los servicios que necesitaban para el desarrollo.

#### Usuarios

Se crearon los siguientes usuarios con los números de carnet de los desarrolladores:

![users](./imgTecnico/IAM/config6.png)

## Conclusiones

1.  La comprensión de la arquitectura del proyecto es esencial para el éxito en su implementación y mantenimiento.El tener una arquitectura definida proporciona una base sólida para trabajar efectivamente en el proyecto. Sabiendo como se organiza el proyecto, nos permite identificar áreas de mejora y aplicar buenas prácticas de programación. Esto se traduce en un código más limpio, menos propenso a errores y más fácil de mantener.

2. La estructura del código es fundamental para la legibilidad, la colaboración y el mantenimiento eficiente. 

3.  La utilización de servicios en la nube, específicamente los proporcionados por AWS, ha demostrado ser una estrategia efectiva para aprovechar los beneficios que la capa gratuita nos provee, igualmente nos permitió aprender sobre nuevas tecnologías y servicios que nos ayudarán en el futuro.

4.  Se concluye que el uso de los servicios en la nube puede aportar ventajas significativas en términos de rendimiento y disponibilidad. Sin embargo, es importante tener en cuenta que la implementación de una aplicación en la nube requiere un conocimiento profundo de la arquitectura de la aplicación y de los servicios en la nube.