const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
// mongoose.promise??

const userSchema = mongoose.Schema({
  username: String,
  password: String
});

const documentSchema = mongoose.Schema({
  title: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  collaborators: Array,
  body: Object,
  font: Number,
  inlineStyles: Object,
  password: String,
  history: {}
});
const User = mongoose.model('User', userSchema)
const Document = mongoose.model('Document', documentSchema)

module.exports = {
  User: User,
  Document: Document
}
