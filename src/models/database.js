require('dotenv').config();
const mysql = require('mysql2');
const { Pool } = require('pg');

// Conexão com MySQL para IXC FlyLink
const ixcFlyLinkDb = mysql.createPool({
    host: process.env.DB_IXC_FLYLINK_HOST,
    user: process.env.DB_IXC_FLYLINK_USER,
    password: process.env.DB_IXC_FLYLINK_PASSWORD,
    database: process.env.DB_IXC_FLYLINK_DATABASE,
    port: process.env.DB_IXC_FLYLINK_PORT
  });

// Conexão com MySQL para IXC Select
const ixcSelectDb = mysql.createPool({
    host: process.env.DB_IXC_SELECT_HOST,
    user: process.env.DB_IXC_SELECT_USER,
    password: process.env.DB_IXC_SELECT_PASSWORD,
    database: process.env.DB_IXC_SELECT_DATABASE,
    port: process.env.DB_IXC_SELECT_PORT || 3306 // Porta padrão do MySQL é 3306
  });

// Conexão com PostgreSQL para HubSoft MicrowebNet
const hubsoftMicrowebDb = new Pool({
    host: process.env.DB_HUBSOFT_MICROWEB_HOST,
    user: process.env.DB_HUBSOFT_MICROWEB_USER,
    password: process.env.DB_HUBSOFT_MICROWEB_PASSWORD,
    database: process.env.DB_HUBSOFT_MICROWEB_DATABASE,
    port: process.env.DB_HUBSOFT_MICROWEB_PORT || 5432 // Porta padrão do PostgreSQL é 5432
  });
  
module.exports = {
  ixcFlyLinkDb,
  ixcSelectDb,
  hubsoftMicrowebDb
};
