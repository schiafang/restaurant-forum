const express = require('express')
const exphbs = require('express-handlebars')
const db = require('./models')
const app = express()
const PORT = 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.listen(PORT, () => {
  db.sequelize.sync()
  console.log(`app is listening on http://localhost:${PORT}`)
})

require('./routes/index')(app)