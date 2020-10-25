const controller = require('./controller');
const Course = require('src/models/course');
const Episode = require('src/models/episode');
const Comment = require('src/models/comment');
const validator = require('validator');
const sm = require('sitemap')
const { createGzip } = require('zlib')
const { Readable } = require('stream')

let sitemap;

class homeController extends controller {
  index = async (req, res) => {
    //   console.log(req.getLocale());
    let courses = await Course.find({}).sort({ createdAt: 1 }).limit(8).exec();
    res.render('home/index', { courses });
  };
  about = async (req, res) => {
    res.render('home/about');
  };

  comment = async (req, res, next) => {
    try {
      let status = await this.validateComment(req);

      if (!status) return this.back(req, res);

      let newComment = new Comment({
        user: req.user.id,
        ...req.body,
      });

      await newComment.save();

      return this.back(req, res);
    } catch (error) {
      next(error);
    }
  };

  validateComment(req) {
    let validationResult = [];

    if (!validator.isLength(req.body.comment, { min: 20, max: undefined })) {
      validationResult.push('متن بدنه نمی‌تواند کمتر از 10 کاراکتر باشد');
    }

    if (validationResult.length == 0) {
      return true;
    } else {
      req.flash('errors', validationResult);
      return false;
    }
  }

  async sitemap(req, res, next) {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');

    if (sitemap) {
      return res.send(sitemap);
    }

    try {
      let smStream = new sm.SitemapStream({
        hostname: process.env.WEBSITE_URL,
        // cacheTime : 600000
      });

      let pipeline = smStream.pipe(createGzip());

      smStream.write({ url: '/', changefreq: 'daily', priority: 1 })
      smStream.write({ url: '/courses', priority: 1 })

      let courses = await Course.find({}).sort({ createdAt: -1 }).exec();

      courses.forEach(course => {
        smStream.write({ url: course.path(), changefreq: 'weekly', priority: 0.8 })
      })

      let episodes = await Episode.find({}).populate('course').sort({ createdAt: -1 }).exec();

      episodes.forEach(episode => {
        smStream.write({ url: episode.path(), changefreq: 'weekly', priority: 0.8 })
      })

      sm.streamToPromise(pipeline).then(sm => sitemap = sm)

      smStream.end()

      pipeline.pipe(res).on('error', e => { throw e })

    } catch (error) {
      res.send(error)
    }
  }

}

module.exports = new homeController();
