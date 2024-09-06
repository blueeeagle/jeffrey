const mongoose = require('mongoose')
mongoose.set('debug', true)

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Database connected successfully'))
  .catch(error => console.log('Database Not connected', error))
