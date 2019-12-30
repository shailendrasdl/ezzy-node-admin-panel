const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Traders_categorySchema = new Schema({    
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: false
  },
  status: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: String,
  },
  updated_at: {
    type: String
  }
});

module.exports = mongoose.model('Traders_category', Traders_categorySchema)