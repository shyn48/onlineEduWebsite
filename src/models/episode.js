const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require('bcrypt');

const EpisodeScehma = Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, required: true },
    type: { type: String, required: true },
    body: { type: String, required: true },
    time: { type: String, default: '00:00:00' },
    number: { type: Number, required: true },
    videoUrl: { type: String, required: true },
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: { updatedAt: false } }
);

EpisodeScehma.plugin(mongoosePaginate);

EpisodeScehma.methods.download = function (req) {
  if (!req.isAuthenticated()) return '#';

  let status = false;

  if (this.type == 'free') status = true;
  else if (this.type == 'vip') status = req.user.isVip();
  else if (this.type == 'cash') status = req.user.checkLearning(this.course);

  let timestamps = new Date().getTime() + 3600 * 1000 * 12;

  let text = `aQTR@!F#FAHKLGN#*&%*${this.id}${timestamps}`;

  let salt = bcrypt.genSaltSync(15);
  let hash = bcrypt.hashSync(text, salt);

  return status ? `/download/${this.id}?mac=${hash}&t=${timestamps}` : '#';
};

EpisodeScehma.methods.typeToPersian = function () {
  switch (this.type) {
    case 'cash':
      return 'نقدی';
      break;
    case 'vip':
      return 'اعضای ویژه';
      break;
    default:
      return 'رایگان';
      break;
  }
};

EpisodeScehma.methods.path = function () {
  return `${this.course.path()}#${this.number}`;
};

EpisodeScehma.methods.inc = async function (field, count = 1) {
  this[field] += count;
  await this.save();
};

module.exports = mongoose.model('Episode', EpisodeScehma);
