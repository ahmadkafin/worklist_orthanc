import dbConnecttion from '../../core/db.connection.js';
import { Sequelize } from 'sequelize';
import pg from 'pg';
import Modality from './Modality.models.js';
import Parameters from './Parameter.models.js';
import Worklists from './Worklists.models.js';

const sequelize = new Sequelize(
    dbConnecttion.DB,
    dbConnecttion.USER,
    dbConnecttion.PASSWORD,
    {
        host: dbConnecttion.HOST,
        port: dbConnecttion.PORT,
        dialectModule: pg,
        dialect: dbConnecttion.DIALECT,
        logging: false,
        schemas: dbConnecttion.SCHEMA,
    }
)

const db = {}
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Modality = Modality(sequelize, Sequelize);
db.Parameters = Parameters(sequelize, Sequelize);
db.Worklist = Worklists(sequelize, Sequelize);

export default db;