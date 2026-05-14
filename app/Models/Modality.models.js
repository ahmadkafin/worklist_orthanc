const Modality = (sequelize, DataTypes) => {
    const Model = sequelize.define('modality', {
        uuid: {
            type: DataTypes.UUID,
            primaryKey: true,
            autoIncrement: false,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        modality: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ae_title: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'modality',
        underscored: true,
        indexes: [
            {
                name: 'name_indexes',
                fields: ['name']
            }
        ]
    })
    Model.associate = (models) => {
        Model.hasMany(models.Parameters, {
            foreignKey: 'modality_uid',
            as: 'parameters'
        })
    }
    return Model;
}

export default Modality;