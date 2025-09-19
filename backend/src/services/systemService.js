const createCrudService = require('./crudServiceFactory');

module.exports = createCrudService({
  table: 'systems',
  columns: ['name', 'description'],
  orderBy: 'name',
  requiredColumns: ['name'],
});
