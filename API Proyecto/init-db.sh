#!/bin/bash

# Iniciar SQL Server en background y guardar su PID
/opt/mssql/bin/sqlservr &
SQL_PID=$!

# Esperar a que SQL Server esté listo para aceptar conexiones
echo "Esperando a que SQL Server inicie..."
for i in {1..60}; do
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -Q "SELECT 1" -C &>/dev/null
    if [ $? -eq 0 ]; then
        echo "SQL Server está listo!"
        break
    fi
    echo "Intento $i de 60, esperando 2s..."
    sleep 2
done

# Ejecutar script de creación de BD y tablas
echo "Ejecutando creacion_BD.sql..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -d master -i /var/opt/mssql/scripts/creacion_BD.sql -C
if [ $? -ne 0 ]; then
    echo "ERROR al ejecutar creacion_BD.sql"
fi

# Ejecutar stored procedures
echo "Ejecutando stored_procedures.sql..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -d SuscripcionesDB -i /var/opt/mssql/scripts/stored_procedures.sql -C
if [ $? -ne 0 ]; then
    echo "ERROR al ejecutar stored_procedures.sql"
fi

echo "Inicializacion completada!"

# Mantener el contenedor vivo esperando el proceso de SQL Server
wait $SQL_PID
