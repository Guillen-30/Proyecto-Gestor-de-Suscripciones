-- ============================================================
--  Sistema de Gestión de Suscripciones — Creación BD (v4 final)
--  SQL Server 2019 Developer Edition
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SuscripcionesDB')
BEGIN
    CREATE DATABASE SuscripcionesDB;
END
GO

USE SuscripcionesDB;
GO

-- ============================================================
--  TABLAS DE CATÁLOGO
-- ============================================================

IF OBJECT_ID('Estado', 'U') IS NULL
CREATE TABLE Estado (
    ID          INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion NVARCHAR(15) NOT NULL
);
GO

IF OBJECT_ID('cicloFacturacion', 'U') IS NULL
CREATE TABLE cicloFacturacion (
    ID          INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion NVARCHAR(15) NOT NULL
);
GO

IF OBJECT_ID('Tipo', 'U') IS NULL
CREATE TABLE Tipo (
    ID          INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion NVARCHAR(30) NOT NULL
);
GO

-- ============================================================
--  TABLA USUARIO
-- ============================================================

IF OBJECT_ID('Usuario', 'U') IS NULL
CREATE TABLE Usuario (
    ID             INT           IDENTITY(1,1) PRIMARY KEY,
    MetodoDePagoID INT           NULL,
    Contrasena     NVARCHAR(255) NOT NULL,
    Nombre         NVARCHAR(30)  NOT NULL
);
GO

-- ============================================================
--  TABLAS QUE DEPENDEN DE USUARIO
-- ============================================================

IF OBJECT_ID('Correo', 'U') IS NULL
CREATE TABLE Correo (
    ID          INT           IDENTITY(1,1) PRIMARY KEY,
    UsuarioID   INT           NOT NULL,
    Descripcion NVARCHAR(255) NOT NULL,
    CONSTRAINT FK_Correo_Usuario FOREIGN KEY (UsuarioID) REFERENCES Usuario(ID)
);
GO

IF OBJECT_ID('MetodoDePago', 'U') IS NULL
CREATE TABLE MetodoDePago (
    ID      INT          IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT         NULL,
    TipoID  INT          NOT NULL,
    Alias   NVARCHAR(40) NOT NULL,
    Detalles NVARCHAR(500) NULL,
    CONSTRAINT FK_MetodoDePago_Tipo FOREIGN KEY (TipoID) REFERENCES Tipo(ID)
);
GO

-- Categoria incluye Color para identificación visual en el panel
IF OBJECT_ID('Categoria', 'U') IS NULL
CREATE TABLE Categoria (
    ID          INT          IDENTITY(1,1) PRIMARY KEY,
    UsuarioID   INT          NOT NULL,
    Nombre      NVARCHAR(20) NOT NULL,
    Descripcion NVARCHAR(30) NULL,
    Color       NVARCHAR(7)  NULL,    -- hex ej: #22C55E
    CONSTRAINT FK_Categoria_Usuario FOREIGN KEY (UsuarioID) REFERENCES Usuario(ID)
);
GO

-- ============================================================
--  TABLA SUSCRIPCION
--  - UsuarioID directo (propietario)
--  - CategoriaID directo (1 categoria por suscripcion)
--  - ImagenURL + ImagenAlt para accesibilidad
-- ============================================================

IF OBJECT_ID('Suscripcion', 'U') IS NULL
CREATE TABLE Suscripcion (
    ID                  INT            IDENTITY(1,1) PRIMARY KEY,
    UsuarioID           INT            NOT NULL,
    MetodoDePagoID      INT            NOT NULL,
    cicloFacturacionID  INT            NOT NULL,
    EstadoID            INT            NOT NULL,
    CategoriaID         INT            NULL,
    Descripcion         NVARCHAR(40)   NULL,
    Costo               DECIMAL(10, 2) NOT NULL,
    FechaRenovacion     DATE           NOT NULL,
    ImagenURL           NVARCHAR(255)  NULL,    -- ruta/URL de imagen subida
    ImagenAlt           NVARCHAR(150)  NULL,    -- texto alternativo (accesibilidad)
    Notas               NVARCHAR(500)  NULL,
    CONSTRAINT FK_Suscripcion_Usuario          FOREIGN KEY (UsuarioID)          REFERENCES Usuario(ID),
    CONSTRAINT FK_Suscripcion_MetodoDePago     FOREIGN KEY (MetodoDePagoID)     REFERENCES MetodoDePago(ID),
    CONSTRAINT FK_Suscripcion_cicloFacturacion FOREIGN KEY (cicloFacturacionID) REFERENCES cicloFacturacion(ID),
    CONSTRAINT FK_Suscripcion_Estado           FOREIGN KEY (EstadoID)           REFERENCES Estado(ID),
    CONSTRAINT FK_Suscripcion_Categoria        FOREIGN KEY (CategoriaID)        REFERENCES Categoria(ID)
);
GO

-- ============================================================
--  TABLA CREDENCIAL
-- ============================================================

IF OBJECT_ID('Credencial', 'U') IS NULL
CREATE TABLE Credencial (
    ID              INT           IDENTITY(1,1) PRIMARY KEY,
    UsuarioID       INT           NOT NULL,
    SuscripcionID   INT           NULL,
    Contrasena      NVARCHAR(255) NOT NULL,
    NombreUsuario   NVARCHAR(30)  NOT NULL,
    URL             NVARCHAR(150) NULL,
    Descripcion     NVARCHAR(100) NULL,
    CONSTRAINT FK_Credencial_Usuario FOREIGN KEY (UsuarioID) REFERENCES Usuario(ID)
);
GO

-- ============================================================
--  TABLA HISTORIAL DE PAGO
-- ============================================================

IF OBJECT_ID('HistorialDePago', 'U') IS NULL
CREATE TABLE HistorialDePago (
    ID              INT            IDENTITY(1,1) PRIMARY KEY,
    UsuarioID       INT            NOT NULL,
    SuscripcionID   INT            NOT NULL,
    Fecha           DATE           NOT NULL,
    Monto           DECIMAL(10, 2) NOT NULL,
    CONSTRAINT FK_Historial_Usuario     FOREIGN KEY (UsuarioID)     REFERENCES Usuario(ID),
    CONSTRAINT FK_Historial_Suscripcion FOREIGN KEY (SuscripcionID) REFERENCES Suscripcion(ID)
);
GO

-- ============================================================
--  FKs DIFERIDAS
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Credencial_Suscripcion')
ALTER TABLE Credencial
    ADD CONSTRAINT FK_Credencial_Suscripcion
    FOREIGN KEY (SuscripcionID) REFERENCES Suscripcion(ID);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Usuario_MetodoDePago')
ALTER TABLE Usuario
    ADD CONSTRAINT FK_Usuario_MetodoDePago
    FOREIGN KEY (MetodoDePagoID) REFERENCES MetodoDePago(ID);
GO

-- ============================================================
--  ÍNDICES
-- ============================================================

CREATE INDEX IX_Suscripcion_UsuarioID        ON Suscripcion(UsuarioID);
CREATE INDEX IX_Suscripcion_FechaRenovacion  ON Suscripcion(FechaRenovacion);
CREATE INDEX IX_Suscripcion_CategoriaID      ON Suscripcion(CategoriaID);
CREATE INDEX IX_Credencial_UsuarioID         ON Credencial(UsuarioID);
CREATE INDEX IX_HistorialDePago_UsuarioID    ON HistorialDePago(UsuarioID);
CREATE INDEX IX_Correo_UsuarioID             ON Correo(UsuarioID);
CREATE INDEX IX_Categoria_UsuarioID          ON Categoria(UsuarioID);
GO

-- ============================================================
--  DATOS DE CATÁLOGO
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM Estado)
INSERT INTO Estado (Descripcion) VALUES
    ('Activa'), ('Pausada'), ('Cancelada'), ('Por vencer');
GO

IF NOT EXISTS (SELECT 1 FROM cicloFacturacion)
INSERT INTO cicloFacturacion (Descripcion) VALUES
    ('Semanal'), ('Mensual'), ('Trimestral'), ('Semestral'), ('Anual');
GO

IF NOT EXISTS (SELECT 1 FROM Tipo)
INSERT INTO Tipo (Descripcion) VALUES
    ('Tarjeta de crédito'), ('Tarjeta de débito'),
    ('Transferencia bancaria'), ('PayPal'), ('Efectivo');
GO

-- ============================================================
--  DATOS DE PRUEBA
-- ============================================================

INSERT INTO Usuario (Contrasena, Nombre)
VALUES ('$2b$10$hashbcryptejemplo123456789012345678901234567890123456', 'Joche Zumbado');
GO

INSERT INTO Correo (UsuarioID, Descripcion)
VALUES (1, 'joche@example.com');
GO

INSERT INTO MetodoDePago (UsuarioID, TipoID, Alias, Detalles)
VALUES (1, 1, 'Visa terminada en 4242', 'Tarjeta de crédito terminada en 4242');
GO

UPDATE Usuario SET MetodoDePagoID = 1 WHERE ID = 1;
GO

INSERT INTO Categoria (UsuarioID, Nombre, Descripcion, Color)
VALUES (1, 'Entretenimiento', 'Streaming y videojuegos', '#E50914');
GO

INSERT INTO Suscripcion
    (UsuarioID, MetodoDePagoID, cicloFacturacionID, EstadoID, CategoriaID,
     Descripcion, Costo, FechaRenovacion, ImagenURL, ImagenAlt, Notas)
VALUES
    (1, 1, 2, 1, 1,
     'Plan estándar Netflix', 9.99, '2026-06-01',
     '/uploads/netflix.png', 'Logo de Netflix sobre fondo rojo', NULL);
GO

INSERT INTO Credencial (UsuarioID, SuscripcionID, Contrasena, NombreUsuario, URL, Descripcion)
VALUES (1, 1, '$2b$10$hashbcryptejemplo123456789012345678901234567890123456',
        'joche@example.com', 'https://netflix.com', 'Cuenta personal Netflix');
GO

INSERT INTO HistorialDePago (UsuarioID, SuscripcionID, Fecha, Monto)
VALUES (1, 1, '2026-05-01', 9.99);
GO

-- ============================================================
--  VERIFICACIÓN FINAL
-- ============================================================

SELECT 'Estado'           AS Tabla, COUNT(*) AS Registros FROM Estado
UNION ALL SELECT 'cicloFacturacion',  COUNT(*) FROM cicloFacturacion
UNION ALL SELECT 'Tipo',              COUNT(*) FROM Tipo
UNION ALL SELECT 'Usuario',           COUNT(*) FROM Usuario
UNION ALL SELECT 'Correo',            COUNT(*) FROM Correo
UNION ALL SELECT 'MetodoDePago',      COUNT(*) FROM MetodoDePago
UNION ALL SELECT 'Categoria',         COUNT(*) FROM Categoria
UNION ALL SELECT 'Suscripcion',       COUNT(*) FROM Suscripcion
UNION ALL SELECT 'Credencial',        COUNT(*) FROM Credencial
UNION ALL SELECT 'HistorialDePago',   COUNT(*) FROM HistorialDePago;
GO
