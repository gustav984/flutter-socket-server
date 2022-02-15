const express= require('express');
const path=require('path');
const Band = require('./models/band');
const Bands = require('./models/bands');
require('dotenv').config();

//App de Express
const app= express();

//Node server 
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const bands = new Bands();

bands.addBand(new Band('Queen'));
bands.addBand(new Band('Nirvana'));
bands.addBand(new Band('The Police'));
bands.addBand(new Band('Pink Floyd'));
bands.addBand(new Band('Blur'));

console.log(bands);

//Mensajes de socket
io.on('connection', client => {
    console.log('Cliente conectado')

    client.emit('bandas-activas',bands.getBands())

    client.on('disconnect', () => { 
        console.log('Cliente desconectado')
    });

    client.on('mensaje',(payload)=>{ 
        console.log('Mensaje!!!',payload);

        io.emit('mensaje',{admin:'Nuevo mensaje'});
    });

    // client.on('emitir-mensaje',(payload)=>{
    //     client.broadcast.emit('nuevo-mensaje',payload); //emite a todos menos al que lo emitio
    // });

    client.on('vote-band', (payload)=>{
       bands.voteBand(payload.id);
       io.emit('bandas-activas',bands.getBands())
    });
    
    //Escuchar: add-band

    client.on('add-band', (payload)=>{
        bands.addBand(new Band(payload.name))
        io.emit('bandas-activas',bands.getBands())
    });

    //ESCUCHAR : delete-band

    client.on('delete-band', (payload)=>{
        bands.deleteBand(payload.id)
        io.emit('bandas-activas',bands.getBands())
    });
});


//Path publico
const pathPublico = path.resolve( __dirname,'public');

app.use(express.static(pathPublico));

server.listen(process.env.PORT,(err)=>{

    if( err ) throw new Error(err);

    console.log('Servidor corriendo en puerto',process.env.PORT)
});