CREATE DATABASE FotbollsLagDB;

USE FotbollsLagDB;

CREATE TABLE Lag (
  LagID INT AUTO_INCREMENT PRIMARY KEY,
  LagNamn VARCHAR(255) NOT NULL,
  Ekonomi DECIMAL(15, 2) NOT NULL,
  ChampionsLeagueTrophies INT NOT NULL,
  LigaTitlar INT NOT NULL
);
                    


