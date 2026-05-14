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

const models = {
    Modality: Modality(sequelize, Sequelize),
    Parameters: Parameters(sequelize, Sequelize),
    Worklists: Worklists(sequelize, Sequelize),
}

Object.values(models)
    .filter(model => typeof model.associate === "function")
    .forEach(model => model.associate(models))

db.Sequelize = Sequelize;
db.sequelize = sequelize;

Object.assign(db, models);


export default db;