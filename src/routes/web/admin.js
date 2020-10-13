const express = require('express');
const router = express.Router();
const adminController = require('src/http/controllers/admin/adminController');
const courseController = require('src/http/controllers/admin/courseController');
const episodeController = require('src/http/controllers/admin/episodeController');
const commentController = require('src/http/controllers/admin/commentController');
const categoryController = require('src/http/controllers/admin/categoryController');
const userController = require('src/http/controllers/admin/userController');
const permissionController = require('src/http/controllers/admin/permissionController');
const roleController = require('src/http/controllers/admin/roleController');

router.use((req, res, next) => {
  res.locals.layout = 'admin/master';
  next();
});
//middlewares
const convertFileToField = require('src/http/middlewares/convertFileToField');
//helpers
const upload = require('src/helpers/uploadImage');
const gate = require('src/helpers/gate');

//Admin routes
router.get('/', adminController.index);

//Course routes

router.get('/courses', courseController.index);
router.get('/courses/create', courseController.create);
router.post(
  '/courses/create',
  upload.single('images'),
  convertFileToField.handle,
  courseController.store
);
router.delete('/courses/:id', courseController.destroy);
router.put(
  '/courses/:id',
  upload.single('images'),
  convertFileToField.handle,
  courseController.update
);
router.get('/courses/:id/edit', courseController.edit);

//episode routes

router.get('/episodes', episodeController.index);
router.get('/episodes/create', episodeController.create);
router.post('/episodes/create', episodeController.store);
router.delete('/episodes/:id', episodeController.destroy);
router.put('/episodes/:id', episodeController.update);
router.get('/episodes/:id/edit', episodeController.edit);

//comments routes

router.get('/comments', commentController.index);
router.delete('/comments/:id', commentController.destroy);
router.put('/comments/:id/approve', commentController.update);
router.get(
  '/comments/approve',
  gate.can('show-approved-comments'),
  commentController.approve
);

//category routes

router.get('/categories', categoryController.index);
router.get('/categories/create', categoryController.create);
router.post('/categories/create', categoryController.store);
router.delete('/categories/:id', categoryController.destroy);
router.put('/categories/:id', categoryController.update);
router.get('/categories/:id/edit', categoryController.edit);

//permission routes

router.get('/users/permissions', permissionController.index);
router.get('/users/permissions/create', permissionController.create);
router.post('/users/permissions/create', permissionController.store);
router.delete('/users/permissions/:id', permissionController.destroy);
router.put('/users/permissions/:id', permissionController.update);
router.get('/users/permissions/:id/edit', permissionController.edit);

// Role routes

router.get('/users/roles', roleController.index);
router.get('/users/roles/create', roleController.create);
router.post('/users/roles/create', roleController.store);
router.delete('/users/roles/:id', roleController.destroy);
router.put('/users/roles/:id', roleController.update);
router.get('/users/roles/:id/edit', roleController.edit);

router.post(
  '/upload-image',
  upload.single('upload'),
  adminController.uploadImage
);

router.get('/users', userController.index);
router.delete('/users/:id', userController.destroy);
router.get('/users/:id/toggleadmin', userController.toggleAdmin);
router.get('/users/:id/addrole', userController.addRole);
router.post('/users/:id/addrole', userController.storeRole);

module.exports = router;
