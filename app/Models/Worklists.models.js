const Worklists = (sequelize, DataTypes) => {
    const Model = sequelize.define('worklists', {
        uuid: {
            type: DataTypes.UUID,
            primaryKey: true,
            autoIncrement: false,
            defaultValue: DataTypes.UUIDV4
        },
        parameter_uid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'parameters',
                key: 'uuid'
            }
        },
        patient_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        patient_rm: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accession_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        parameter: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sop_instance_uid: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        study_instance_uid: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        schedule_procedure_start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    }, {
        tableName: "worklists",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'worklists_index',
                fields: ['patient_rm', 'accession_number']
            }
        ]
    })
    Model.associate = (models) => {
        Model.belongsTo(models.Parameters, {
            foreignKey: 'parameter_uid',
            as: 'parameters'
        })
    }
    return Model;
}

export default Worklists;