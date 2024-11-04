// server/models/db.js
import { Sequelize } from 'sequelize';

// Local database configuration
const db = new Sequelize('usuariossoporte_crud', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

/* Uncomment and use this if you want to connect to the remote database
const db = new Sequelize('heroku_400060f9830c2e6', 'b8e0f4832953a9', '7ab139e7', {
  host: 'us-cluster-east-01.k8s.cleardb.net',
  dialect: 'mysql',
});
*/

// Test the connection
db.authenticate()
  .then(() => {
    console.log('Connected to the MySQL database using Sequelize');
  })
  .catch((error) => {
    console.error('Unable to connect to the MySQL database:', error);
  });

export default db;
