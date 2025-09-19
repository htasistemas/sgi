const createCrudController = require('./crudControllerFactory');
const teamService = require('../services/teamService');

module.exports = createCrudController(teamService);
