const Result = require('./constants/result');
const Sequelize = require('sequelize');

async function checkServer(ip, dbName) {
    const dbServer = new Sequelize('CustomerDB', 'customeruser', '123456a$', {
        host: '118.27.192.106',
        dialect: 'mssql',
        operatorsAliases: '0',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: false,
            freezeTableName: true
        }
    });
    try {
        await dbServer.authenticate();

        const serverInfo = await dbServer.define('Customer', {
            ID: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },
            ServerIP: Sequelize.STRING,
            Username: Sequelize.STRING,
            Password: Sequelize.STRING,
            DatabaseName: Sequelize.STRING,
        });

        const serverData = await serverInfo.findOne({
            where: { ServerIP: ip, DatabaseName: dbName }
        })

        var server = {
            ip: serverData['ServerIP'],
            dbName: serverData['DatabaseName'],
            username: serverData['Username'],
            password: serverData['Password']
        };
        return Promise.resolve(server)
    } catch (error) {
        return Promise.reject(error)
    }
}

module.exports = {

    checkServerInvalid: async function (ip, dbName, secretKey) {
        if (secretKey == '00a2152372fa8e0e62edbb45dd82831a') {
            const dbServer = new Sequelize('CustomerDB', 'customeruser', '123456a$', {
                host: '118.27.192.106',
                dialect: 'mssql',
                operatorsAliases: '0',
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
                define: {
                    timestamps: false,
                    freezeTableName: true
                }
            });

            try {
                await dbServer.authenticate();

                const serverInfo = await dbServer.define('Customer', {
                    ID: {
                        type: Sequelize.BIGINT,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    ServerIP: Sequelize.STRING,
                    Username: Sequelize.STRING,
                    Password: Sequelize.STRING,
                    DatabaseName: Sequelize.STRING,
                });


                const serverData = await serverInfo.findOne({
                    where: { ServerIP: ip, DatabaseName: dbName }
                })

                dbServer.close();

                const mainServer = new Sequelize(serverData['DatabaseName'], serverData['Username'], serverData['Password'], {
                    host: serverData['ServerIP'],
                    dialect: 'mssql',
                    operatorsAliases: '0',
                    pool: {
                        max: 5,
                        min: 0,
                        acquire: 30000,
                        idle: 10000
                    },
                    define: {
                        timestamps: false,
                        freezeTableName: true
                    }
                });
                await mainServer.authenticate();

                return Promise.resolve(mainServer)
            } catch (error) {
                dbServer.close();
                return Promise.reject(Result.LOGIN_FAIL)
            }
        } else {
            return Promise.reject(Result.NO_PERMISSION)
        }
    },

    updateTable: async function (listObj, table, id) {
        let updateObj = {};
        for (let field of listObj) {
            updateObj[field.key] = field.value
        }
        try {
            await table.update(updateObj, { where: { ID: id } });
            return Promise.resolve(1);
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }


    }

}