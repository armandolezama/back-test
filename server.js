const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const port = 8000;
const cors = require('cors');
const JWT_PASS = 'Antónimo';

app.use(express.json())
app.use(cors())

const {Schema, model} = mongoose;
const User = model(
    'User',
    new Schema({
        name: String,
        email: {type:String, unique: true},
        password: String
    })
)

app.post('/login', (req, resp) => {
    const {email, password} = req.body;
    User.findOne({email})
        .then(user=>{
            return bcrypt.compare(password, user.password)
            .then(success => ({success, user}))
        })
        .then(({success, user}) => {
            if(!success){
                resp.status(400).json({msg: 'correo y contraseña incorrectos'})
                return
        }

        jwt.sign(
            {_id: user._id}, 
            JWT_PASS, 
            {expiresIn: 60*60*24},
            (err, token) => {
                    if (err) {
                        throw{msg: 'Error, try later'}
                    }
                    resp.json({token})
                }
            )
    })
})

app.post('/signup', (req, resp) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        resp.status(400).json({msg: "Error, debe llenar todos los campos"})
        return
    }

    bcrypt.hash(password, 8).then(
        (hash, err) => {
            const user = new User({name, email, password: hash})
            return user.save();
        }).then(user =>{
            resp.json(user)
        }).catch(err => resp.status(400).json('Correo ya registrado'))
})

app.listen(port, () =>{
    console.log('server listening...')
})

mongoose.connect('mongodb+srv://Armando:qG6HrHOHjxkonr26@cluster0-s6xnp.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true })
.then(function(result) {
    console.log('connected with mongo');
  })
  .catch(function(err){
    console.log(err);
  })

