require('dotenv').config();
const express = require('express');
const dataRoutes = require('./src/routes/dataRoutes');

const app = express();

app.use(express.json());
app.use('/api', dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
