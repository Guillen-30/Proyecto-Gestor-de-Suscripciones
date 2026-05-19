-- Migration: add UsuarioID to MetodoDePago and FK to Usuario
USE SuscripcionesDB;
GO

IF COL_LENGTH('dbo.MetodoDePago','UsuarioID') IS NULL
BEGIN
    ALTER TABLE dbo.MetodoDePago
    ADD UsuarioID INT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_MetodoDePago_Usuario')
BEGIN
    ALTER TABLE dbo.MetodoDePago
    ADD CONSTRAINT FK_MetodoDePago_Usuario FOREIGN KEY (UsuarioID) REFERENCES Usuario(ID);
END
GO
