CREATE DATABASE IF NOT EXISTS dadu_weather CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dadu_weather;

CREATE TABLE IF NOT EXISTS cities (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL
);

INSERT IGNORE INTO cities (slug, name) VALUES
 ('dadu','Dadu'),('johi','Johi'),('mehar','Mehar'),('bhan-syedabad','Bhan Syedabad'),
 ('wahi-pandhi','Wahi Pandhi'),('khairpur-nathan-shah','Khairpur Nathan Shah'),
 ('moro','Moro'),('sehwan-sharif','Sehwan Sharif'),('larkana','Larkana'),('jamshoro','Jamshoro');

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(60)  NOT NULL,
  last_name     VARCHAR(60)  NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(20)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  city_id       INT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS login_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NULL,
  identifier VARCHAR(150) NOT NULL,
  success    TINYINT(1) NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  phone      VARCHAR(30) NULL,
  subject    VARCHAR(150) NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);