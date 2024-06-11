const express = require('express');
const dotenv = require('dotenv');
const colors = require("colors");
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes')
const taskRoutes = require('./routes/taskRoutes')

dotenv.config();
connectDB();
const app = express();

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/task', taskRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`API Running on PORT : ${PORT}`.cyan.bold));