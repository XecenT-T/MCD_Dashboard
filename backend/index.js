const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/grievances', require('./routes/grievances'));
app.use('/api/payroll', require('./routes/payroll'));

app.use('/api/department-notices', require('./routes/departmentNotices'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wards', require('./routes/wards'));
app.use('/api/leaves', require('./routes/leaves'));



// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes (Placeholder)
app.get('/', (req, res) => {
    res.send('MCD Dashboard Backend Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
