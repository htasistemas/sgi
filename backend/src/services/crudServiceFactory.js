const db = require('../db/pool');
const HttpError = require('../utils/httpError');

const buildInsertQuery = (table, columns) => {
  const valuePlaceholders = columns.map((_, index) => `$${index + 1}`);
  return {
    text: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${valuePlaceholders.join(', ')}) RETURNING *`,
  };
};

const buildUpdateQuery = (table, columns, idColumn = 'id') => {
  const setFragments = columns.map((column, index) => `${column} = $${index + 2}`);
  return {
    text: `UPDATE ${table} SET ${setFragments.join(', ')} WHERE ${idColumn} = $1 RETURNING *`,
  };
};

const buildDeleteQuery = (table, idColumn = 'id') => ({
  text: `DELETE FROM ${table} WHERE ${idColumn} = $1`,
});

const buildListQuery = (table, columns, orderBy) => ({
  text: `SELECT ${columns.join(', ')} FROM ${table} ORDER BY ${orderBy}`,
});

const createCrudService = ({
  table,
  columns,
  orderBy = 'id',
  idColumn = 'id',
  requiredColumns = [],
}) => {
  const insertQuery = buildInsertQuery(table, columns);
  const updateQuery = buildUpdateQuery(table, columns, idColumn);
  const deleteQuery = buildDeleteQuery(table, idColumn);
  const listQuery = buildListQuery(table, columns, orderBy);

  const pickColumns = (input, { allowPartial = false } = {}) => {
    const payload = columns.reduce((acc, column) => {
      if (Object.prototype.hasOwnProperty.call(input, column)) {
        acc[column] = input[column];
      }
      return acc;
    }, {});

    if (!allowPartial) {
      const missing = requiredColumns.filter((column) => payload[column] == null || payload[column] === '');
      if (missing.length > 0) {
        throw new HttpError(400, `Missing required fields: ${missing.join(', ')}`);
      }
    }

    return payload;
  };

  return {
    async list() {
      const { rows } = await db.query(listQuery.text);
      return rows;
    },

    async create(data) {
      const payload = pickColumns(data);
      const values = columns.map((column) => payload[column] ?? null);
      const { rows } = await db.query(insertQuery.text, values);
      return rows[0];
    },

    async update(id, data) {
      const payload = pickColumns(data, { allowPartial: true });
      if (Object.keys(payload).length === 0) {
        throw new HttpError(400, 'At least one field must be provided for update.');
      }
      const values = [id, ...columns.map((column) => payload[column] ?? null)];
      const { rows } = await db.query(updateQuery.text, values);
      if (!rows[0]) {
        throw new HttpError(404, `${table} record with id ${id} not found.`);
      }
      return rows[0];
    },

    async remove(id) {
      const result = await db.query(deleteQuery.text, [id]);
      if (result.rowCount === 0) {
        throw new HttpError(404, `${table} record with id ${id} not found.`);
      }
      return { success: true };
    },
  };
};

module.exports = createCrudService;
