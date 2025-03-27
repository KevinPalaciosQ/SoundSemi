
import pymysql
import pymysql.cursors
from pymysql.err import MySQLError
from dotenv import load_dotenv
from flask import Blueprint, current_app
from util.configdb import dbConfig

blueprint = Blueprint('db', __name__)

# Cargar las variables de entorno
load_dotenv()

# Realizar la conexión a la DB
def get_connection():
    try:
        return pymysql.connect(
            host=dbConfig['host'],
            user=dbConfig['user'],
            password=dbConfig['password'],
            db=dbConfig['database'],
        )
    except MySQLError as e:
        current_app.logger.error(f"Error connecting to the database: {e}")
        raise

# Función para hacer consultas sin retorno
def query(quer: str, data=None):
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                consultas = quer.split("--")
                for i in consultas:
                    if data:
                        cursor.execute(i, data)
                    else:
                        cursor.execute(i)
                connection.commit()
    except MySQLError as e:
        current_app.logger.error(f"Error executing query: {e}")
        raise

# Función para hacer consultas con retorno
def query_con_retorno(quer: str, data=None):
    try:
        with get_connection() as connection:
            with connection.cursor(pymysql.cursors.DictCursor) as cursor:
                consultas = quer.split("--")
                retorno = []
                for i in consultas:
                    if data:
                        cursor.execute(i, data)
                    else:
                        cursor.execute(i)
                    retorno.extend(cursor.fetchall())
                connection.commit()
                return retorno
    except MySQLError as e:
        current_app.logger.error(f"Error executing query with return: {e}")
        raise