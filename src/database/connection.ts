import { Sequelize } from "sequelize";

const sequelize = new Sequelize("hmsdb", "root", "", {
  host: "localhost",
  dialect: "mysql",
  dialectModule: require("mysql2"),
});

export default sequelize;
