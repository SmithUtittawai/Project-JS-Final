const mongoose = require('mongoose');

const collection = 'course';

const courseSchema = new mongoose.Schema({
    course_id: String,
    course_name: String,
    course_section: Array,
}, {
    timestamps: true,
    versionKey: false,
    collection
});

module.exports = mongoose.model(collection, courseSchema);