const express = require('express');

const createCrudRouter = (controller) => {
  const router = express.Router();

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
};

module.exports = createCrudRouter;
