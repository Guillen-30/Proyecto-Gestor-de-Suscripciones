-- ============================================================
--  Stored Procedures — SuscripcionesDB (v4 final)
--  SQL Server 2019 Developer Edition
-- ============================================================

USE SuscripcionesDB;
GO

-- ============================================================
--  USUARIOS
-- ============================================================

CREATE OR ALTER PROCEDURE spCrearUsuario
    @Contrasena NVARCHAR(255),
    @Nombre     NVARCHAR(30),
    @Correo     NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO Usuario (Contrasena, Nombre)
        VALUES (@Contrasena, @Nombre);

        DECLARE @NuevoUsuarioID INT = SCOPE_IDENTITY();

        INSERT INTO Correo (UsuarioID, Descripcion)
        VALUES (@NuevoUsuarioID, @Correo);

        SELECT @NuevoUsuarioID AS ID;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE spActualizarUsuario
    @ID           INT,
    @Contrasena   NVARCHAR(255) = NULL,
    @Nombre       NVARCHAR(30)  = NULL,
    @MetodoPagoID INT           = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Usuario
    SET
        Contrasena     = ISNULL(@Contrasena,   Contrasena),
        Nombre         = ISNULL(@Nombre,        Nombre),
        MetodoDePagoID = ISNULL(@MetodoPagoID, MetodoDePagoID)
    WHERE ID = @ID;

    IF @@ROWCOUNT = 0
        RAISERROR('Usuario no encontrado.', 16, 1);
END;
GO

CREATE OR ALTER PROCEDURE spEliminarUsuario
    @ID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Usuario WHERE ID = @ID)
        BEGIN
            RAISERROR('Usuario no encontrado.', 16, 1);
            RETURN;
        END

        DELETE FROM HistorialDePago WHERE UsuarioID = @ID;
        DELETE FROM Credencial      WHERE UsuarioID = @ID;
        DELETE FROM Suscripcion     WHERE UsuarioID = @ID;
        DELETE FROM Categoria       WHERE UsuarioID = @ID;

        -- Desasociar método de pago predeterminado antes de eliminarlos
        UPDATE Usuario SET MetodoDePagoID = NULL WHERE ID = @ID;
        DELETE FROM MetodoDePago WHERE UsuarioID = @ID;

        DELETE FROM Correo  WHERE UsuarioID = @ID;
        DELETE FROM Usuario WHERE ID = @ID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE spObtenerUsuarioPorCorreo
    @Correo NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        u.ID,
        u.Nombre,
        u.Contrasena,
        u.MetodoDePagoID,
        c.Descripcion AS Correo
    FROM Usuario u
    INNER JOIN Correo c ON c.UsuarioID = u.ID
    WHERE c.Descripcion = @Correo;
END;
GO

-- ============================================================
--  CREDENCIALES
-- ============================================================

CREATE OR ALTER PROCEDURE spCrearCredencial
    @UsuarioID     INT,
    @SuscripcionID INT           = NULL,
    @Contrasena    NVARCHAR(255),
    @NombreUsuario NVARCHAR(30),
    @URL           NVARCHAR(150) = NULL,
    @Descripcion   NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Credencial (UsuarioID, SuscripcionID, Contrasena, NombreUsuario, URL, Descripcion)
    VALUES (@UsuarioID, @SuscripcionID, @Contrasena, @NombreUsuario, @URL, @Descripcion);

    SELECT SCOPE_IDENTITY() AS ID;
END;
GO

CREATE OR ALTER PROCEDURE spActualizarCredencial
    @ID            INT,
    @SuscripcionID INT           = NULL,
    @Contrasena    NVARCHAR(255) = NULL,
    @NombreUsuario NVARCHAR(30)  = NULL,
    @URL           NVARCHAR(150) = NULL,
    @Descripcion   NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Credencial
    SET
        SuscripcionID  = ISNULL(@SuscripcionID, SuscripcionID),
        Contrasena     = ISNULL(@Contrasena,    Contrasena),
        NombreUsuario  = ISNULL(@NombreUsuario, NombreUsuario),
        URL            = ISNULL(@URL,           URL),
        Descripcion    = ISNULL(@Descripcion,   Descripcion)
    WHERE ID = @ID;

    IF @@ROWCOUNT = 0
        RAISERROR('Credencial no encontrada.', 16, 1);
END;
GO

CREATE OR ALTER PROCEDURE spEliminarCredencial
    @ID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Credencial WHERE ID = @ID;

    IF @@ROWCOUNT = 0
        RAISERROR('Credencial no encontrada.', 16, 1);
END;
GO

-- ============================================================
--  SUSCRIPCIONES
-- ============================================================

CREATE OR ALTER PROCEDURE spCrearSuscripcion
    @UsuarioID          INT,
    @MetodoDePagoID     INT           = NULL,
    @cicloFacturacionID INT,
    @EstadoID           INT,
    @CategoriaID        INT           = NULL,
    @Descripcion        NVARCHAR(40)  = NULL,
    @Costo              DECIMAL(10,2),
    @FechaRenovacion    DATE,
    @ImagenURL          NVARCHAR(255) = NULL,
    @ImagenAlt          NVARCHAR(150) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Usuario          WHERE ID = @UsuarioID)
            RAISERROR('Usuario no encontrado.',              16, 1);
        IF @MetodoDePagoID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM MetodoDePago WHERE ID = @MetodoDePagoID)
            RAISERROR('Método de pago no encontrado.',       16, 1);
        IF NOT EXISTS (SELECT 1 FROM cicloFacturacion WHERE ID = @cicloFacturacionID)
            RAISERROR('Ciclo de facturación no encontrado.', 16, 1);
        IF NOT EXISTS (SELECT 1 FROM Estado           WHERE ID = @EstadoID)
            RAISERROR('Estado no encontrado.',               16, 1);

        IF @CategoriaID IS NOT NULL AND
           NOT EXISTS (SELECT 1 FROM Categoria WHERE ID = @CategoriaID AND UsuarioID = @UsuarioID)
            RAISERROR('Categoría no encontrada o no pertenece al usuario.', 16, 1);

        INSERT INTO Suscripcion
            (UsuarioID, MetodoDePagoID, cicloFacturacionID, EstadoID, CategoriaID,
             Descripcion, Costo, FechaRenovacion, ImagenURL, ImagenAlt)
        VALUES
            (@UsuarioID, @MetodoDePagoID, @cicloFacturacionID, @EstadoID, @CategoriaID,
             @Descripcion, @Costo, @FechaRenovacion, @ImagenURL, @ImagenAlt);

        SELECT SCOPE_IDENTITY() AS ID;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE spActualizarSuscripcion
    @ID                 INT,
    @UsuarioID          INT,
    @MetodoDePagoID     INT           = NULL,
    @cicloFacturacionID INT           = NULL,
    @EstadoID           INT           = NULL,
    @CategoriaID        INT           = NULL,
    @Descripcion        NVARCHAR(40)  = NULL,
    @Costo              DECIMAL(10,2) = NULL,
    @FechaRenovacion    DATE          = NULL,
    @ImagenURL          NVARCHAR(255) = NULL,
    @ImagenAlt          NVARCHAR(150) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Suscripcion WHERE ID = @ID AND UsuarioID = @UsuarioID)
        BEGIN
            RAISERROR('Suscripción no encontrada o no pertenece al usuario.', 16, 1);
            RETURN;
        END

        IF @CategoriaID IS NOT NULL AND
           NOT EXISTS (SELECT 1 FROM Categoria WHERE ID = @CategoriaID AND UsuarioID = @UsuarioID)
            RAISERROR('Categoría no encontrada o no pertenece al usuario.', 16, 1);

        UPDATE Suscripcion
        SET
            MetodoDePagoID     = ISNULL(@MetodoDePagoID,     MetodoDePagoID),
            cicloFacturacionID = ISNULL(@cicloFacturacionID, cicloFacturacionID),
            EstadoID           = ISNULL(@EstadoID,           EstadoID),
            CategoriaID        = ISNULL(@CategoriaID,        CategoriaID),
            Descripcion        = ISNULL(@Descripcion,        Descripcion),
            Costo              = ISNULL(@Costo,              Costo),
            FechaRenovacion    = ISNULL(@FechaRenovacion,    FechaRenovacion),
            ImagenURL          = ISNULL(@ImagenURL,          ImagenURL),
            ImagenAlt          = ISNULL(@ImagenAlt,          ImagenAlt)
        WHERE ID = @ID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE spEliminarSuscripcion
    @ID        INT,
    @UsuarioID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Suscripcion WHERE ID = @ID AND UsuarioID = @UsuarioID)
        BEGIN
            RAISERROR('Suscripción no encontrada o no pertenece al usuario.', 16, 1);
            RETURN;
        END

        DELETE FROM HistorialDePago WHERE SuscripcionID = @ID;
        DELETE FROM Credencial      WHERE SuscripcionID = @ID;
        DELETE FROM Suscripcion     WHERE ID = @ID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ============================================================
--  CATEGORÍAS
-- ============================================================

CREATE OR ALTER PROCEDURE spCrearCategoria
    @UsuarioID   INT,
    @Nombre      NVARCHAR(20),
    @Descripcion NVARCHAR(30) = NULL,
    @Color       NVARCHAR(7)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Usuario WHERE ID = @UsuarioID)
        RAISERROR('Usuario no encontrado.', 16, 1);

    INSERT INTO Categoria (UsuarioID, Nombre, Descripcion, Color)
    VALUES (@UsuarioID, @Nombre, @Descripcion, @Color);

    SELECT SCOPE_IDENTITY() AS ID;
END;
GO

CREATE OR ALTER PROCEDURE spActualizarCategoria
    @ID          INT,
    @Nombre      NVARCHAR(20) = NULL,
    @Descripcion NVARCHAR(30) = NULL,
    @Color       NVARCHAR(7)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Categoria
    SET
        Nombre      = ISNULL(@Nombre,      Nombre),
        Descripcion = ISNULL(@Descripcion, Descripcion),
        Color       = ISNULL(@Color,       Color)
    WHERE ID = @ID;

    IF @@ROWCOUNT = 0
        RAISERROR('Categoría no encontrada.', 16, 1);
END;
GO

CREATE OR ALTER PROCEDURE spEliminarCategoria
    @ID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Categoria WHERE ID = @ID)
        BEGIN
            RAISERROR('Categoría no encontrada.', 16, 1);
            RETURN;
        END

        -- Desasociar suscripciones antes de eliminar la categoría
        UPDATE Suscripcion SET CategoriaID = NULL WHERE CategoriaID = @ID;

        DELETE FROM Categoria WHERE ID = @ID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ============================================================
--  MÉTODOS DE PAGO
-- ============================================================

CREATE OR ALTER PROCEDURE spCrearMetodoPago
    @UsuarioID INT,
    @TipoID   INT,
    @Alias    NVARCHAR(40),
    @Detalles NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Tipo WHERE ID = @TipoID)
        RAISERROR('Tipo de método de pago no encontrado.', 16, 1);

    INSERT INTO MetodoDePago (UsuarioID, TipoID, Alias, Detalles)
    VALUES (@UsuarioID, @TipoID, @Alias, @Detalles);

    SELECT SCOPE_IDENTITY() AS ID;
END;
GO

CREATE OR ALTER PROCEDURE spEliminarMetodoPago
    @ID        INT,
    @UsuarioID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM MetodoDePago WHERE ID = @ID AND UsuarioID = @UsuarioID)
        BEGIN
            RAISERROR('Método de pago no encontrado.', 16, 1);
            RETURN;
        END

        -- Desasociar suscripciones antes de eliminar el método de pago
        UPDATE Suscripcion SET MetodoDePagoID = NULL WHERE MetodoDePagoID = @ID;

        DELETE FROM MetodoDePago WHERE ID = @ID AND UsuarioID = @UsuarioID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ============================================================
--  PAGOS E HISTORIAL
-- ============================================================

CREATE OR ALTER PROCEDURE spRegistrarPago
    @UsuarioID     INT,
    @SuscripcionID INT,
    @Monto         DECIMAL(10,2),
    @Fecha         DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF @Fecha IS NULL SET @Fecha = CAST(GETDATE() AS DATE);

        IF NOT EXISTS (SELECT 1 FROM Suscripcion WHERE ID = @SuscripcionID AND UsuarioID = @UsuarioID)
        BEGIN
            RAISERROR('Suscripción no encontrada o no pertenece al usuario.', 16, 1);
            RETURN;
        END

        INSERT INTO HistorialDePago (UsuarioID, SuscripcionID, Fecha, Monto)
        VALUES (@UsuarioID, @SuscripcionID, @Fecha, @Monto);

        DECLARE @CicloDesc NVARCHAR(15);
        SELECT @CicloDesc = cf.Descripcion
        FROM Suscripcion s
        INNER JOIN cicloFacturacion cf ON cf.ID = s.cicloFacturacionID
        WHERE s.ID = @SuscripcionID;

        -- Avanzar desde la fecha del pago, no desde FechaRenovacion guardada
        DECLARE @NuevaFecha DATE;
        SET @NuevaFecha = CASE @CicloDesc
            WHEN 'Semanal'    THEN DATEADD(DAY,   7, @Fecha)
            WHEN 'Quincenal'  THEN DATEADD(DAY,  15, @Fecha)
            WHEN 'Mensual'    THEN DATEADD(MONTH, 1, @Fecha)
            WHEN 'Bimestral'  THEN DATEADD(MONTH, 2, @Fecha)
            WHEN 'Trimestral' THEN DATEADD(MONTH, 3, @Fecha)
            WHEN 'Semestral'  THEN DATEADD(MONTH, 6, @Fecha)
            WHEN 'Anual'      THEN DATEADD(YEAR,  1, @Fecha)
            ELSE DATEADD(MONTH, 1, @Fecha)
        END;

        UPDATE Suscripcion
        SET
            FechaRenovacion = @NuevaFecha,
            EstadoID = CASE
                WHEN EstadoID = (SELECT ID FROM Estado WHERE Descripcion = 'Por vencer')
                THEN (SELECT ID FROM Estado WHERE Descripcion = 'Activa')
                ELSE EstadoID
            END
        WHERE ID = @SuscripcionID;

        SELECT @NuevaFecha AS NuevaFechaRenovacion;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE spObtenerHistorialPorUsuario
    @UsuarioID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        h.ID,
        h.Fecha,
        h.Monto,
        s.Descripcion AS Suscripcion,
        s.Costo       AS CostoSuscripcion
    FROM HistorialDePago h
    INNER JOIN Suscripcion s ON s.ID = h.SuscripcionID
    WHERE h.UsuarioID = @UsuarioID
    ORDER BY h.Fecha DESC;
END;
GO

-- ============================================================
--  CONSULTAS DE RECORDATORIOS
-- ============================================================

CREATE OR ALTER PROCEDURE spObtenerSuscripcionesPorVencer
    @DiasAnticipacion INT = 7
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        s.ID               AS SuscripcionID,
        s.Descripcion      AS Suscripcion,
        s.FechaRenovacion,
        s.Costo,
        s.ImagenURL,
        s.ImagenAlt,
        cat.Color          AS ColorCategoria,
        cat.Nombre         AS NombreCategoria,
        u.ID               AS UsuarioID,
        u.Nombre           AS NombreUsuario,
        c.Descripcion      AS Correo,
        cf.Descripcion     AS CicloFacturacion,
        DATEDIFF(DAY, CAST(GETDATE() AS DATE), s.FechaRenovacion) AS DiasRestantes
    FROM Suscripcion s
    INNER JOIN cicloFacturacion cf ON cf.ID  = s.cicloFacturacionID
    INNER JOIN Estado e            ON e.ID   = s.EstadoID
    INNER JOIN Usuario u           ON u.ID   = s.UsuarioID
    INNER JOIN Correo c            ON c.UsuarioID = u.ID
    LEFT  JOIN Categoria cat       ON cat.ID = s.CategoriaID
    WHERE
        e.Descripcion IN ('Activa', 'Por vencer')
        AND s.FechaRenovacion BETWEEN CAST(GETDATE() AS DATE)
                                  AND DATEADD(DAY, @DiasAnticipacion, CAST(GETDATE() AS DATE))
    ORDER BY s.FechaRenovacion ASC;
END;
GO

CREATE OR ALTER PROCEDURE spObtenerSuscripcionesVencidas
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Suscripcion
    SET EstadoID = (SELECT ID FROM Estado WHERE Descripcion = 'Por vencer')
    WHERE
        FechaRenovacion < CAST(GETDATE() AS DATE)
        AND EstadoID    = (SELECT ID FROM Estado WHERE Descripcion = 'Activa');

    SELECT
        s.ID              AS SuscripcionID,
        s.Descripcion     AS Suscripcion,
        s.FechaRenovacion,
        s.Costo,
        s.ImagenURL,
        s.ImagenAlt,
        cat.Color         AS ColorCategoria,
        cat.Nombre        AS NombreCategoria,
        u.ID              AS UsuarioID,
        u.Nombre          AS NombreUsuario,
        c.Descripcion     AS Correo,
        DATEDIFF(DAY, s.FechaRenovacion, CAST(GETDATE() AS DATE)) AS DiasVencida
    FROM Suscripcion s
    INNER JOIN Estado e    ON e.ID   = s.EstadoID
    INNER JOIN Usuario u   ON u.ID   = s.UsuarioID
    INNER JOIN Correo c    ON c.UsuarioID = u.ID
    LEFT  JOIN Categoria cat ON cat.ID = s.CategoriaID
    WHERE e.Descripcion = 'Por vencer'
    ORDER BY s.FechaRenovacion ASC;
END;
GO

-- ============================================================
--  VERIFICACIÓN
-- ============================================================

SELECT
    name AS StoredProcedure,
    create_date,
    modify_date
FROM sys.procedures
WHERE name LIKE 'sp%'
ORDER BY name;
GO
