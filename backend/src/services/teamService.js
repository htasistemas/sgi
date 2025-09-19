const createCrudService = require('./crudServiceFactory');

module.exports = createCrudService({
  table: 'teams',
  columns: ['name', 'email', 'phone', 'role'],
  orderBy: 'name',
  requiredColumns: ['name'],
});
