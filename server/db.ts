import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '34.30.114.65',
  user: 'root',
  password: 'instance-1',
  database: 'dwellx',
  connectionLimit: 10
});

export default pool;