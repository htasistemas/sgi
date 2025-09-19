const createCrudController = require('./crudControllerFactory');
const clientService = require('../services/clientService');

module.exports = createCrudController(clientService);
