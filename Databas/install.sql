CREATE DATABASE FotbollsLagDB;

USE FotbollsLagDB;

CREATE TABLE Lag (
    LagID INT PRIMARY KEY,
    LagNamn VARCHAR(100) NOT NULL,
    Ekonomi DECIMAL(15,2),
    ChampionsLeagueTrophies INT,
    LigaTitlar INT
);                       


