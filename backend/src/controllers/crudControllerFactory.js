const HttpError = require('../utils/httpError');

const parseId = (raw) => {
  const id = Number.parseInt(raw, 10);
  if (Number.isNaN(id)) {
    throw new HttpError(400, 'Invalid identifier provided.');
  }
  return id;
};

const createCrudController = (service) => ({
  list: async (req, res, next) => {
    try {
      const data = await service.list();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const data = await service.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      const data = await service.update(id, req.body);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      const result = await service.remove(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
});

module.exports = createCrudController;
