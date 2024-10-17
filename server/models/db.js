import mysql from 'mysql';

const db = mysql.createConnection({
  host: 'us-cluster-east-01.k8s.cleardb.net',
  user: 'b8e0f4832953a9',
  password: '7ab139e7',
  database: 'heroku_400060f9830c2e6',
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

export default db;

mysql://b8e0f4832953a9:7ab139e7@us-cluster-east-01.k8s.cleardb.net/heroku_400060f9830c2e6?reconnect=true

