const { Sequelize, DataTypes } = require("sequelize")
const dotenv = require("dotenv")

// configure dotenv
dotenv.config()

// declare .env variables
DATABASE_NAME = process.env.DATABASE_NAME
DATABASE_USERNAME = process.env.DATABASE_USERNAME
DATABASE_PASSWORD = process.env.DATABASE_PASSWORD
DATABASE_HOST = process.env.DATABASE_HOST

// create database connection
// using https://www.digitalocean.com/community/tutorials/how-to-use-sequelize-with-node-js-and-mysql#step-1-installing-and-configuring-sequelize
const sequelize = new Sequelize(
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    {
        host: DATABASE_HOST,
        dialect: 'mysql'
    }
)

// creates Queue model for queues table with primary key String name and JSON queue variables
const Queue = sequelize.define("queues", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        get() {
            return this.getDataValue("name")
        },
        set(value) {
            this.setDataValue("name", value)
        }
    },
    queue: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
            return this.getDataValue("queue")
        },
        set(value) {
            this.setDataValue("queue", value)
        }
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return this.getDataValue("thumbnail")
        },
        set(value) {
            this.setDataValue("thumbnail", value)
        }
    }
})

// creates db connection and authenticates
async function loadQueue() {
    await sequelize.authenticate().then(() => {
        console.log("Connection has been established successfully.")
    }).catch((error) => {
        return console.error("Unable to connect to the database: ", error)
    })

    // add Queue model to database
    sequelize.sync().then(() => {
        console.log("Queue table created successfully.")
    }).catch((error) => {
        return console.error("Unable to create table: ", error)
    })
}
loadQueue()




module.exports = {
    Queue,
    DatabaseInstance: sequelize,
}