const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const apiSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    phone: {type: Number, required: true, unique: true},
    age: {type: Number, require:true},
    profile: [{name:{type: String, required: true}, profile_link:{type:String, required: true}}]
});

module.exports = mongoose.model('ApiData',apiSchema);