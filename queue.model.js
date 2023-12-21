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

sequelize.authenticate().then(() => {
    console.log("Connection has been established successfully.")
}).catch((error) => {
    console.error("Unable to connect to the database: ", error)
})

// creates Queue model for queues table with primary key String name and JSON queue variables
const Queue = sequelize.define("queues", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        get() {
            return this.getDataValue("name")
        }
    },
    queue: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
            return this.getDataValue("queue")
        }
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return this.getDataValue("thumbnail")
        }
    }
})

// add Queue model to database
sequelize.sync().then(() => {
    console.log("Queue table created successfully.")
}).catch((error) => {
    console.error("Unable to create table: ", error)
})