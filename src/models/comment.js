const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const CommentSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    approved: { type: Boolean, default: false },
    course: { type: Schema.Types.ObjectId, ref: 'Course', default: undefined },
    episode: {
      type: Schema.Types.ObjectId,
      ref: 'Episode',
      default: undefined,
    },
    comment: { type: String, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

CommentSchema.plugin(mongoosePaginate);

CommentSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
});

CommentSchema.virtual('belongTo', {
  ref: (doc) => {
    if (doc.course) return 'Course';
    else if (doc.episode) return 'Episode';
  },
  localField: (doc) => {
    if (doc.course) return 'course';
    else if (doc.episode) return 'episode';
  },
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Comment', CommentSchema);
