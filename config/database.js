const Sequelize=require('sequelize');
const sequelize=new Sequelize(process.env.DB_NAME,'root',process.env.DB_PW,{
    host:'localhost',
    dialect:'mysql'
});
sequelize.authenticate()
.then(()=>console.log('Database connected....'))
.catch(err=>console.error('Database connection failed',err));

module.exports=sequelize;