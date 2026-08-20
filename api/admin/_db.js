// La integración de Vercel con Neon expone la conexión como DATABASE_URL
// (y DATABASE_URL_UNPOOLED), no como POSTGRES_URL que es lo que
// @vercel/postgres busca por defecto. La mapeamos aquí para no depender de
// que alguien cree una variable de entorno duplicada a mano.
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

const { sql } = require('@vercel/postgres');

module.exports = { sql };
