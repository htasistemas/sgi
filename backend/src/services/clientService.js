const createCrudService = require('./crudServiceFactory');

module.exports = createCrudService({
  table: 'clients',
  columns: ['name', 'email', 'phone', 'company'],
  orderBy: 'name',
  requiredColumns: ['name'],
});
