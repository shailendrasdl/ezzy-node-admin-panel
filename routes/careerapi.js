const mongoose = require("mongoose");
let express = require('express');
let moment = require('moment');
let router = express.Router();

const Career = mongoose.model("career");

// career apply function 
router.post('/apply', async (req, res) => {
  if(req.body.role == undefined || req.body.role == null) {
    res.json({error_msg: "role cannot be blank"});
    return;
  }
  if(req.body.name == undefined || req.body.name == null) {
    res.json({error_msg: "name cannot be blank"});
    return;
  }
  if(req.body.username == undefined || req.body.username == null) {
    res.json({error_msg: "username cannot be blank"});
    return;
  }
  if(req.body.category == undefined || req.body.category == null) {
    res.json({error_msg: "category cannot be blank"});
    return;
  }
  if(req.body.description == undefined || req.body.description == null) {
    res.json({error_msg: "description cannot be blank"});
    return;
  }
  if(req.body.subs_drop_down == undefined || req.body.subs_drop_down == null) {
    res.json({error_msg: "subs_drop_down cannot be blank"});
    return;
  }
  if(req.body.facebook_link == undefined || req.body.facebook_link == null) {
    res.json({error_msg: "facebook_link cannot be blank"});
    return;
  }
  if(req.body.linkedIn_link == undefined || req.body.linkedIn_link == null) {
    res.json({error_msg: "linkedIn_link cannot be blank"});
    return;
  }
  if(req.body.twitter_link == undefined || req.body.twitter_link == null) {
    res.json({error_msg: "twitter_link cannot be blank"});
    return;
  }
  if(req.body.instagram_link == undefined || req.body.instagram_link == null) {
    res.json({error_msg: "instagram_link cannot be blank"});
    return;
  }
  if(req.body.languages == undefined || req.body.languages == null) {
    res.json({error_msg: "languages cannot be blank"});
    return;
  }
  if(req.body.url == undefined || req.body.url == null) {
    res.json({error_msg: "url cannot be blank"});
    return;
  };
  var facebook = req.body.facebook_link;
  var re = /\b(?:(?:https?|ftp):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i;
  if (!re.test(facebook)) {
    res.json({success: false, msg :'invalide facebook link'});
    return false;
  }
  var linkedIn =  req.body.linkedIn_link;
  if (!re.test(linkedIn)) { 
    res.json({success: false, msg : 'invalide linkedIn link'});
    return false;
  }
  var instagram =  req.body.instagram_link;
  if (!re.test(instagram)) { 
    res.json({success: false, msg : 'invalide instagram link'});
    return false;
  }
  var twitter =  req.body.twitter_link;
  if (!re.test(twitter)) { 
    res.json({success: false, msg : 'invalide twitter link'});
    return false;
  }
  let applyData = new Career({
    url : req.body.url,
    role : req.body.role, 
    name : req.body.name,
    exchange : req.body.exchange,
    username : req.body.username,
    category : req.body.category,
    languages : req.body.languages,
    description : req.body.description,
    twitter_link : twitter,
    facebook_link : facebook,
    linkedIn_link : linkedIn,
    instagram_link : instagram,
    subs_drop_down : req.body.subs_drop_down,
    created_at : moment().format("ll"),
    updated_at : moment().format("ll"),
  });
  applyData.save(function(error, created) {
    console.log(error);
    if(created){
      res.json({success: true, msg:'apply successfully.', created});
      return;
    }
    else{
      res.json({success: false, msg:'not apply'});
      return;
    }
  })
});

// Apply List Function
router.get('/applyList', async (req, res) => {
  let data = await Career.find({});
  if(data!= undefined && data.length>0) {
    res.json({success: true, msg : 'apply list', data});
    return;
  }
  res.json({success: false, msg : 'no details found.', data});
  return;
});

/**
*@ Edit details
**/
router.get("/editDetails/:postId", async (req, res) =>{
	if(req.params.postId == undefined || req.params.postId == null) {
		res.json({error_msg: "invalid access"});
		return;
	}
	else
	{
		let result = await Career.findOne({_id : req.params.postId});
		res.json({success: true, msg:'edit details', result});
		return;
	}
})

// edit Details function
router.post('/editDetails',  async (req, res) => {
  if(req.body.postId == undefined || req.body.postId == null) {
    res.json({error_msg: "postId cannot be blank"});
    return;
  }
  if(req.body.name == undefined || req.body.name == null) {
    res.json({error_msg: "name cannot be blank"});
    return;
  }
  if(req.body.role == undefined || req.body.role == null) {
    res.json({error_msg: "role cannot be blank"});
    return;
  }
  if(req.body.username == undefined || req.body.username == null) {
    res.json({error_msg: "username cannot be blank"});
    return;
  }
  if(req.body.category == undefined || req.body.category == null) {
    res.json({error_msg: "category cannot be blank"});
    return;
  }
  if(req.body.description == undefined || req.body.description == null) {
    res.json({error_msg: "description cannot be blank"});
    return;
  }
  if(req.body.experience == undefined || req.body.experience == null) {
    res.json({error_msg: "experience cannot be blank"});
    return;
  }
  if(req.body.subs_drop_down == undefined || req.body.subs_drop_down == null) {
    res.json({error_msg: "subs_drop_down cannot be blank"});
    return;
  }
  if(req.body.facebook_link == undefined || req.body.facebook_link == null) {
    res.json({error_msg: "facebook_link cannot be blank"});
    return;
  }
  if(req.body.linkedIn_link == undefined || req.body.linkedIn_link == null) {
    res.json({error_msg: "linkedIn_link cannot be blank"});
    return;
  }
  if(req.body.instagram_link == undefined || req.body.instagram_link == null) {
    res.json({error_msg: "instagram_link cannot be blank"});
    return;
  }
  if(req.body.twitter_link == undefined || req.body.twitter_link == null) {
    res.json({error_msg: "twitter_link cannot be blank"});
    return;
  }
  if(req.body.languages == undefined || req.body.languages == null) {
    res.json({error_msg: "languages cannot be blank"});
    return;
  }
  if(req.body.url == undefined || req.body.url == null) {
    res.json({error_msg: "url cannot be blank"});
    return;
  }
  let result = await Career.findOne({_id : req.body.postId});
  if(result) {
    var facebook =  req.body.facebook_link;
    var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    if (!re.test(facebook)) {
      res.json({success: false, msg : 'invalide facebook link'});
      return false;
    }
    var linkedIn =  req.body.linkedIn_link;
    if (!re.test(linkedIn)) { 
      res.json({success: false, msg : 'invalide linkedIn link'});
      return false;
    }
    var instagram =  req.body.instagram_link;
    if (!re.test(instagram)) { 
      res.json({success: false, msg : 'invalide instagram link'});
      return false;
    }
    var twitter =  req.body.twitter_link;
    if (!re.test(twitter)) { 
      res.json({success: false, msg : 'invalide twitter link'});
      return false;
    }
    let post = await Career.update({_id : req.body.postId},
      { $set : {
        name : req.body.name,
        role : req.body.role,
        username : req.body.username,
        category : req.body.category,
        description : req.body.description,
        experience : req.body.experience,
        subs_drop_down : req.body.subs_drop_down,
        facebook_link : facebook,
        linkedIn_link : linkedIn,
        instagram_link : instagram,
        twitter_link : twitter,
        languages : req.body.languages,
        url : req.body.url,
        updated_at : new Date().getTime()
      }
    });
    res.json({success: true, msg : 'edit details successfully'});
    return;
  }
  else {
    res.json({success: false, error_msg:"record not found."});
    return;
  }
});

// delete Details function
router.post('/deleteDetails', async (req, res) => {
  if(req.body.postId == undefined || req.body.postId == null) {
    res.json({error_msg: "invalid access"});
    return;
  }
  const result = await Career.findOne({_id : req.body.postId});
  if(result) {
    let pressReleases = await Career.findByIdAndRemove({_id: req.body.postId}, function(err, success) {
      if(err) {
        console.log(err);
        res.status.json({ err: err });
      }
      else {
        return res.json({ success: true, msg : 'deleted successfully' });
        return;
      }
    })
  }
  else {
    res.json({success: false, error_msg:"postId not found."});
    return;
  }
});

module.exports = router;