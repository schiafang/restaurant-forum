const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const PORT = 3000

app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

app.listen(PORT, () => {
  console.log(`app is listening on http://localhost:${PORT}`)
})

app.get('/', (req, res) => {
  res.render('index')
})