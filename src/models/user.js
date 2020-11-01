const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const uniqueString = require('unique-string');
const mongoosePaginate = require('mongoose-paginate');

const userSchema = Schema(
  {
    name: { type: String, required: true },
    admin: { type: Boolean, default: false },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    rememberToken: { type: String, default: null },
    vipTime: { type: Date, default: new Date().toISOString() },
    vipType: { type: String, default: 'month' },
    boughtCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

userSchema.plugin(mongoosePaginate);

userSchema.methods.hashPassword = function (password) {
  let salt = bcrypt.genSaltSync(15);
  let hash = bcrypt.hashSync(password, salt);

  return hash;
}

// userSchema.pre('findOneAndUpdate', function (next) {
//   let salt = bcrypt.genSaltSync(15);
//   let password = this.getUpdate().$set.password;
//   console.log(password)
//   let hash = bcrypt.hashSync(password, salt);
//   console.log()

//   password = hash;
//   next();
// });

userSchema.methods.comparePasswords = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.isVip = function () {
  return new Date(this.vipTime) > new Date();
};

userSchema.methods.checkLearning = function (courseId) {
  return this.boughtCourses.indexOf(courseId) !== -1;
};

userSchema.methods.setRememberToken = function (res) {
  const token = uniqueString();
  res.cookie('remember_token', token, {
    maxAge: 1000 * 60 * 60 * 24 * 90,
    httpOnly: true,
    signed: true,
  });

  this.updateOne({ rememberToken: token }, (err) => {
    console.log(err);
  });
};

userSchema.methods.hasRole = function (roles) {
  let result = roles.filter((role) => {
    return this.roles.indexOf(role) > -1;
  });

  return !!result.length;
};

userSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'user',
});

module.exports = mongoose.model('User', userSchema);
