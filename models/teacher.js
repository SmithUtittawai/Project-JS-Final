const mongoose = require('mongoose');

const collection = 'teacher';

const teacherSchema = new mongoose.Schema({
    tec_id: String,
    tec_pwd: String,
    tec_name: String,
    tec_course: {type: Array, default: []}
}, {
    timestamps: true,
    versionKey: false,
    collection
});

module.exports = mongoose.model(collection, teacherSchema);