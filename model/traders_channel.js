const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Traders_channelSchema = new Schema({
  channel_name : {
    type: String,
  },
  channel_url : {
    type: String,
  },
  category : {
    type: String,
    required: false,
  },
  rank : {
    type: String,
  },
  description : {
    type: String,
  },
  thumbnails : {
    type: String,
  },
  subscriber : {
    type: String,
  },
  rating_review : {
    type: String,
  },
  
  channel_id : {
    type: String,
  },
  youtube_id : {
    type: String,
  },
  gems : {
    type: Number,
    default: 0
  },
  bricks : {
    type: Number,
    default: 0
  },
  trust : {
    type: String,
  },
  rating : {
    type: String,
  },
  icon : {
    type: String,
  },
  status: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: String,
  },
  updated_at: {
    type: String
  }
});

module.exports = mongoose.model('Traders_Channel', Traders_channelSchema)