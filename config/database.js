const Sequelize=require('sequelize');
const sequelize=new Sequelize('group-chat-app','root','Chintu5050@',{
    host:'localhost',
    dialect:'mysql'
});
sequelize.authenticate()
.then(()=>console.log('Database connected....'))
.catch(err=>console.error('Database connection failed',err));

module.exports=sequelize;