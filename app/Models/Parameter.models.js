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
        group: {
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
    Model.associate = (model) => {
        Model.belongsTo(models.Modality, {
            foreignKey: 'modality_uid',
            as: 'modality'
        });

        Model.hasMany(model.Worklist, {
            foreignKey: 'parameter_uid'
        });
    }
    return Model;
}

export default Parameters;