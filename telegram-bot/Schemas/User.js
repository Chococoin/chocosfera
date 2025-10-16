const mongoose = require('mongoose')
const { Schema, model } = mongoose
// const bip39 = require('bip39')
const encrypter = require('../utils/encrypter')

mongoose.set('strictQuery', true)

const UserSchema = new Schema({
  username : { type: String, required: false },
  telegramID: { type: Number, required: true, unique: true },
  sinceMessageID : { type: Number, required: true },
  session: { type: Number, default: 1 },
  name: { type: String, required: false },
  language: { type: String, required: false },
  referer: { type: Number, required: false },
  refereeNumber: { type: Number, required: true, default: 0 },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: Number, required: true, unique: true },
  phoneCode: { type: Number },
  emailCode: { type: Number },
  verifiedPhone: { type: Boolean, default: false },
  verifiedEmail: { type: Boolean, default: false },
  passphrase: { type: Array, default: () => encrypter()},
  address: { type: String, default: 'none'},
  link: { type: String, required: false, default: "broken_link" },
  listXeBook: { type: Array, required: true, default: 0 },
  isClient: { type: Boolean, required: true, default: false }
},
{ timestamps: true }
)

module.exports = model('User', UserSchema)
