const express = require('express')
const app = express()

//Chamando as variaves de ambiente.
require('dotenv').config()

// Configurar conexão com o banco de dados.
const Pool = require('pg').Pool
const db = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: parseInt(process.env.PORT),
    database: process.env.DATABASE,
})

// Configurar o servdor para apresentat arquivos estaticos.
app.use(express.static('frontend'))

app.use(express.urlencoded({ extended: true}))

//Configurando template engine.                             
const nunjucks = require('nunjucks')
nunjucks.configure("./", {
    express: app,
    noCache: true
})

//Configurar a aparência da página.                     
app.get('/', (req, res) => {
    
    db.query("SELECT * FROM donors", function(err, result){
        if (err) return res.send("Erro no banco de dados.")

        const allDonors = result.rows

        const donorsNumber = allDonors.length 
        const donors = allDonors.slice(-8).reverse()
        return res.render('index.html', { donors, donorsNumber})
    })
})

app.post('/', (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const blood = req.body.blood

    if ( name == '' || email == '' || blood == '' ) {
        return res.send('Todos os campos são obrigatórios.')
    }

    //Coloco os valores dentro do banco de dados.
    const query = ` INSERT INTO donors ("name", "email", "blood") 
                    VALUES ($1, $2, $3) `

    const values = [name, email, blood]

    db.query( query, values, function(err){
        if (err) return res.send('Erro no banco de dados. ' + err )
        
        return res.redirect('/')
    })
})

//Ligar o servidor e permitir o acesso a porta 3000.            
app.listen(3000, () => {
    console.log('server on')
})