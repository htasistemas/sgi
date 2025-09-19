const createCrudService = require('./crudServiceFactory');

module.exports = createCrudService({
  table: 'statuses',
  columns: ['name', 'color'],
  orderBy: 'name',
  requiredColumns: ['name'],
});
