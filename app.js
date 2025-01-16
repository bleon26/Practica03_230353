const express = require('express');
const session = require('express-session');
const moment =require('moment-timezone');// commonJS

const app = express();


//Configuración de la sesión
app.use(session({
    secret: 'p3-BLC#Leon-sesionespersistentes', //Secreto para firmar la cookie de sesión
    resave:false,  //No resguardar la sesión si no ha sido modificada
    saveUninitialized:true,  //Guardar la sesión aunque no haya sido inicializada
    cookie:{secure:false,maxAge:24 * 60 * 60 *1000}  //usar secure :true solo si usas HTTPS , maxAge permite definir la duracion maxima de la sesion 
}));

//Midelware para mostrar detalles de la sesion
app.use((req,res, next)=>{
    if(req.session){
        if(!req.session.createdAt){
            req.session.createdAt=new Date(); //Asignamos la fecha de la creación de la sesión
        }
        req.session.lastAccess=new Date(); //Asignamos la última vez que se accedió a la sesión
    }
    next();
});

//ruta para inicializar la sesion
app.get('/login/:User',(req,res)=>{
    if(req.session.createdAt){
        req.session.User=req.params.User;
        req.session.createdAt=new Date();
        req.session.lastAccess=new Date();
        res.send('La sesion ha sido iniciada');
    }else{
        res.send('La sesion ya existe');
    }
});

//ruta para actualizar la decha de ultima consulta
app.get('/update',(req,res)=>{
    if(req.session.createdAt){
        req.session.lastAccess=new Date();
        res.send('La fecha de ultimo acceso ha sido actualizada');
    }else{
        res.send('No hay una session activa.');
    }
});

//Ruta para mostrar la información de la sesión
app.get('/status',(req,res)=>{
    if(req.session.createdAt){
        const now= new Date();
        const started = new Date(req.session.createdAt);
        const lestUpdate = new Date (req.session.lastAccess);
        //calcular la antiguedad de la sesion
        const sessionAgeMs = now - started;
        const hours = Math.floor(sessionAgeMs/(1000*60*60));
        const minutes=Math.floor((sessionAgeMs%(1000*60*60))/(1000*60));
        const seconds=Math.floor((sessionAgeMs%(1000*60))/1000);

        //convertir las fechas al uso horario de CDMX
        const createdAt_CDMX = moment(started).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        const lastAccess_CDMX = moment(lestUpdate).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

        res.json({
            mensaje:'Estado de la sesion',
            User:req.session.User,
            inicio:createdAt_CDMX,
            ultimoAcceso:lastAccess_CDMX,
            antiguedad:`${hours} horas, ${minutes} y ${seconds} segundos`
        })
    }
    // if(req.session){
    //     const User = req.session.User;
    //     const sessionId = req.session.id;
    //     const createdAt = req.session.createdAt;
    //     const lastAccess = req.session.lastAccess;
    //     const sessionDuration = (new Date() - new Date(createdAt))/1000; //Duración de la sesión en segundos
    //     console.log(`La duración de la sesión es de ${sessionDuration} segundos.`);
        
    //     res.send(`
    //         <h1>Detalles de la sesion</h1>
    //         <p><strong>Usuario:</strong>${User}</p>
    //         <p><strong>ID de sesión:</strong>${sessionId}</p>
    //         <p><strong>Fecha de creación de la sesión:</strong>${createdAt}</p>
    //         <p><strong>último acceso:</strong>${lastAccess}</p>
    //         <p><strong>Duración de la sesión (en segundos):</strong>${sessionDuration}</p>
    //         `);
    // }

})

//Ruta para cerrar la sesión
app.get('/logout',(req,res)=>{
    if(req.session.createdAt){
        req.session.destroy((err)=>{
            if(err){
                return res.status(500).send('Error al cerrar sesion');

            }
            res.send('<h1>Sesion Cerrada exitosamente</h1>');

        });

    }else{
        res.send('no hay una sesion activa para cerrar')
    }
    // req.session.destroy((err)=>{
    //     if(err){
    //         return res.send('Error al cerrar sesion.');
    //     }
    //     res.send('<h1>Sesión cerrada exitosamente.</h1>');
    // });
});

//Iniciar el servidor en el puerto 3000
app.listen(3000,()=>{
    console.log('Servidor corriendo en el puerto 3000');
});