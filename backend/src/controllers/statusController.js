const createCrudController = require('./crudControllerFactory');
const statusService = require('../services/statusService');

module.exports = createCrudController(statusService);
