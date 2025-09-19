const express = require('express');
const createCrudRouter = require('./createCrudRouter');
const teamController = require('../controllers/teamController');
const systemController = require('../controllers/systemController');
const clientController = require('../controllers/clientController');
const statusController = require('../controllers/statusController');

const router = express.Router();

router.use('/teams', createCrudRouter(teamController));
router.use('/systems', createCrudRouter(systemController));
router.use('/clients', createCrudRouter(clientController));
router.use('/statuses', createCrudRouter(statusController));

module.exports = router;
