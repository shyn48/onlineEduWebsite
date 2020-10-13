const controller = require('src/http/controllers/controller');
const Comment = require('src/models/comment');

class commentController extends controller {
  async index(req, res, next) {
    try {
      let page = req.query.page || 1;
      let comments = await Comment.paginate(
        { approved: true },
        {
          page,
          sort: { createdAt: -1 },
          limit: 20,

          populate: [
            {
              path: 'user',
              select: 'name',
            },
            {
              path: 'course',
            },
            {
              path: 'episode',
              populate: {
                path: 'course',
                select: 'slug',
              },
            },
          ],
        }
      );

      res.render('admin/comments/index', { title: 'کامنت‌ها', comments });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      let page = req.query.page || 1;
      let comments = await Comment.paginate(
        { approved: false },
        {
          page,
          sort: { createdAt: -1 },
          limit: 20,

          populate: [
            {
              path: 'user',
              select: 'name',
            },
            {
              path: 'course',
            },
            {
              path: 'episode',
              populate: {
                path: 'course',
                select: 'slug',
              },
            },
          ],
        }
      );

      res.render('admin/comments/approve', {
        title: 'کامنت‌های تایید نشده',
        comments,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      this.isMongoId(req.params.id);

      let comment = await Comment.findById(req.params.id).populate('belongTo');

      if (!comment) this.error('چنین کامنتی وجود ندارد, 404');

      await comment.belongTo.inc('commentCount');

      comment.approved = true;

      await comment.save();

      return this.back(req, res);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req, res, next) {
    try {
      this.isMongoId(req.params.id);
      let comment = await Comment.findById(req.params.id);
      if (!comment) {
        this.error('چنین کامنتی وجود ندارد', 404);
      }

      //delete comment itself
      comment.remove();

      return this.back(req, res);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new commentController();
