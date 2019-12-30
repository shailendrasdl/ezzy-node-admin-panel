const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EvotbonusSchema = new Schema({
    bonus: {
        type: String,
        required: true
    },
    evot_value: {
        type: String,
        required: true
    },
    updated_at: {
        type: String
    }
})

module.exports = mongoose.model('Evotbonus', EvotbonusSchema)