const Parameters = (seqeuelize, DataTypes) => {
    const Model = seqeuelize.define('parameter', {
        uuid: {
            type: DataTypes.UUID,
            primaryKey: true,
            autoIncrement: false,
            defaultValue: DataTypes.UUIDV4,
        },
        modality_uid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'modality',
                key: 'uuid'
            }
        },
        parameter_group: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        parameter: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: "parameters",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'parameter_index',
                fields: ['parameter'],
            }
        ]
    });
    Model.associate = (models) => {
        Model.belongsTo(models.Modality, {
            foreignKey: 'modality_uid',
            as: 'modality'
        });

        Model.hasMany(models.Worklists, {
            foreignKey: 'parameter_uid'
        });
    }
    return Model;
}

export default Parameters;