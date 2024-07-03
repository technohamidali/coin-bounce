const express = require('express');
const app = express();
// const client = require('./database/index');
const { PORT } = require('./config/index');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');

// routes
const authRoutes = require('./routes/auth-routes.js');
const blogRoutes = require('./routes/blog-routes.js');

// DB
require('./database/index.js')

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/storage', express.static('storage'));
// api end points
app.use('/api', authRoutes, blogRoutes);
app.use(errorHandler);
//app.get('/',(req, res)=>res.json({msg:'hello'})),
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`)
})