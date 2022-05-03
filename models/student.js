const mongoose = require('mongoose');

const collection = 'student';

const stdSchema = new mongoose.Schema({
    std_id: String,
    std_pwd: String,
    std_name: String,
    std_course: {type: Array, default: []}
}, {
    timestamps: true,
    versionKey: false,
    collection
});

module.exports = mongoose.model(collection, stdSchema);