const controller = require('src/http/controllers/api/controller');
const Course = require('src/models/course');
const Episode = require('src/models/episode');
const comment = require('src/models/comment');


class CourseController extends controller {

    async courses(req, res, next) {
        try {
            let page = req.query.page || 1;
            let courses = await Course.paginate({}, { page, sort: { createdAt: 1 }, limit: 12, populate: [{ path: 'categories' }, { path: 'user' }] })

            res.json({
                data: this.filterCoursesData(courses),
                status: 'success'
            })

        } catch (error) {
            res.status(500).json({
                data: error.message,
                status: 'error'
            })
        }
    }

    filterCoursesData(courses) {
        return {
            ...courses,
            docs: courses.docs.map(course => {
                return {
                    id: course.id,
                    title: course.title,
                    slug: course.slug,
                    body: course.body,
                    image: course.thumb,
                    categories: course.categories.map(cate => {
                        return {
                            name: cate.name,
                            slug: cate.slug
                        }
                    }),
                    user: {
                        id: course.user.id,
                        name: course.user.name
                    },
                    price: course.price,
                    createdAt: course.createdAt
                }
            })
        }
    }

    async singleCourse(req, res, next) {
        try {
            let course = await Course.findByIdAndUpdate(
                req.params.course,
                { $inc: { viewCount: 1 } }
            )
                .populate([
                    {
                        path: 'user',
                        select: 'name',
                    },
                    {
                        path: 'episodes',
                        options: {
                            sort: { number: 1 },
                        },
                    },
                ]);

            if (!course) {
                return res.status(404).json({
                    data: error.message,
                    status: 'error'
                })
            }

            res.json({
                data: course,
                status: 'success'
            })


        } catch (error) {
            res.status(500).json({
                data: error.message,
                status: 'error'
            })
        }
    }

}

module.exports = new CourseController();