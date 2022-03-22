const { Pool } = require ('pg');

const dbPool = new Pool ({
    database: 'Personal-web',
    port: '5433',
    user: 'postgres',
    password: 'root',
});

module.exports = dbPool;