from dotenv import load_dotenv
import os
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

#cargar las variables de entorno
load_dotenv()

# Configuración de la base de datos
dbConfig = {
    'host': os.environ.get('DB_HOST'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASS'),
    'database': os.environ.get('DB_NAME'),
    'port': os.environ.get('DB_PORT')
}

# Configuración del servidor s3 de Amazon
s3Config = {
    'name': os.environ.get('AWS_BUCKET_NAME'),
    'id': os.environ.get('AWS_ACCESS_KEY_ID'),
    'key': os.environ.get('AWS_SECRET_ACCESS_KEY'),
    'region': os.environ.get('AWS_REGION_NAME'),
}

def test_s3_connection():
    try:
        # Crear una sesión de boto3 con las credenciales
        session = boto3.Session(
            aws_access_key_id=s3Config['id'],
            aws_secret_access_key=s3Config['key'],
            region_name=s3Config['region']
        )

        # Crear un cliente S3
        s3 = session.resource('s3')
        bucket = s3.Bucket(s3Config['name'])

        # Intenta listar los objetos en el bucket para verificar la conexión
        for obj in bucket.objects.all():
            print(obj.key)

        print("Conexión exitosa al bucket de S3.")

    except NoCredentialsError:
        print("Error: Credenciales no encontradas.")
    except PartialCredentialsError:
        print("Error: Credenciales incompletas.")
    except Exception as e:
        print(f"Error al conectar con S3: {e}")

if __name__ == "__main__":
    test_s3_connection()