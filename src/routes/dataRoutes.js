const express = require('express');
const { getAllData, generateReports } = require('../controllers/dataController');
const router = express.Router();

router.get('/data', getAllData);
router.get('/generate-reports', generateReports); 

module.exports = router;