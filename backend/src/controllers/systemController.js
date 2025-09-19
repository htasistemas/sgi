const createCrudController = require('./crudControllerFactory');
const systemService = require('../services/systemService');

module.exports = createCrudController(systemService);
