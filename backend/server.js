const express = require('express');
const dotenv = require('dotenv');
const colors = require("colors");
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const cors = require("cors");
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
const app = express();

app.use(express.json());

//connecting backend and frontend using cors
app.use(cors({
    origin: ["http://localhost:3000", "https://task-management-web-app-fzjf.onrender.com"]
}));

app.use('/api/user', userRoutes);
app.use('/api/task', taskRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('API is running');
});

const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`.cyan.bold)
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();