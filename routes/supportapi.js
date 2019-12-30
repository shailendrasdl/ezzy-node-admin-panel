var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
const session = require('express-session');
var flash     = require('req-flash');
var md5 = require('md5');
var serialize = require('node-serialize');

var cors = require('cors');

var ip = require('ip');

router.use(session({ 
	secret: 'somerandonstuffs',
	resave: false,
	saveUninitialized: false,
	cookie: { expires: 6000000 }
}));

router.use(flash());

var webEmail = process.env.WEBEmail;
const sgMail = require('@sendgrid/mail');
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	
const clientUrl = process.env.clientUrl;

const mongoose = require("mongoose");

var WAValidator = require('wallet-address-validator');

const Users = mongoose.model("Users")
const Support = mongoose.model("Support")
const Support_chat = mongoose.model("Support_chat")
const Banner = mongoose.model("Banner")
const User_coin_transaction = mongoose.model("User_coin_transaction")

const traders_influencers = mongoose.model("Traders_Channel")

const multer = require('multer');
var moment = require('moment');

const dappsModel = mongoose.model("Dapps")

const videoStatusModel = mongoose.model("Video_status")
const ChannelModel = mongoose.model("Traders_Channel")

/* Post support tocken */
router.post('/create_token', async function(req, res, next) {
	var subject = req.body.subject;
	var email = req.body.email;
	var message = req.body.message;
	var user_name = req.body.user_id;
		
	const user_details = await Users.findOne({"username": user_name}, {"_id": 1});
	var user_id = (user_details._id).toString();
	
	const supportpost = new Support();
		supportpost.user_id = user_id;
		supportpost.subject = subject;
		supportpost.email = email;
		supportpost.message = message;
		supportpost.status = false;
		supportpost.updated_at = new Date().getTime();
		if(message != '' && user_id != '' && subject != '' && email != '')
		{
			try{
				await supportpost.save();	
			}
			catch(error)
			{
				res.json({ result: error });
			}	
		}
		else
		{
			res.json({ result: false });
		}
	var lastID = (supportpost._id).toString();	
	if(lastID)
	{
		const supportpost_chat = new Support_chat();
			supportpost_chat.ticket = lastID;
			supportpost_chat.to_id = user_id;
			supportpost_chat.from_id = 0;
			supportpost_chat.message = message;
			supportpost_chat.message_by = 'User';
			supportpost_chat.status = false;
			supportpost_chat.updated_at = new Date().getTime();
			supportpost_chat.created_at = moment().format('lll');
			if(message != '' && user_id != '')
			{
				try{
					await supportpost_chat.save();	
					res.json({ result: true });
				}
				catch(error)
				{
					res.json({ result: error });
				}	
			}
			else
			{
				res.json({ result: 'Some fields missing' });
			}		
	}	
});

/* Idivisual uesr details */
router.get("/userchatlist/:postId", async (req, res) => {
	
	var user_name = req.params.postId;		
	const user_details = await Users.findOne({"username": user_name}, {"_id": 1, "email":1, "username":1});
	var user_id = (user_details._id).toString();
	
	if(user_details)
	{
		const supportChat_list = await Support.find({"user_id": user_id}).sort({"updated_at": 1});	
		if(supportChat_list)
		{
			res.json({ user_details: user_details, supportChat_list: supportChat_list });									
		}
		else
		{
			res.json({ user_details: user_details, supportChat_list: 'No data found' });							
		}		
	}
	else
	{
		res.json({ user_details: 'Invalid user', supportChat_list: '' });		
	}
})

/* Support chat system */
router.get("/chatuser/:postId", async (req, res) => {
	const supportChat_list = await Support_chat.find({"ticket": req.params.postId}).sort({"updated_at": 1});
	if(supportChat_list)
	{
		res.json({ supportChat_list: supportChat_list });										
	}
	else
	{
		res.json({ supportChat_list: 'No data found' });								
	}
})

/* Support Reply */
router.post("/replybyuser/:postId", async (req, res) => {
	var message = req.body.message;
	var ticket = req.body.ticket;
	var user_name = req.body.user_id;
	
	if(req.params.postId == ticket)
	{
		const user_details = await Users.findOne({"username": user_name}, {"_id": 1});
		var from_id = (user_details._id).toString();
		var updated_at = new Date().getTime();
		
		const supportpost = new Support_chat();
			supportpost.ticket = ticket;
			supportpost.to_id = from_id;
			supportpost.from_id = 0;
			supportpost.message = message;
			supportpost.message_by = 'User';
			supportpost.status = false;
			supportpost.updated_at = new Date().getTime();
			supportpost.created_at = moment().format('lll');
			if(message != '' && ticket != '' && updated_at != '')
			{
				await supportpost.save();						
			}
			
		const supportChat_list = await Support_chat.find({"ticket": req.params.postId}).sort({"updated_at": 1});
		if(supportChat_list)
		{
			res.json(supportChat_list);		
		}
		else
		{
			res.json('No data found');				
		}		
	}
	else
	{
			res.json('Ticket is invalid');						
	}
})

/* ticketClose */
router.post("/ticket_close/:postId", async (req, res) => {
	
	const post_Support = await Support.update(
		{ _id : req.params.postId},
		{ $set : {status : true}}
	);
	
	const post_Support_chat = await Support_chat.update(
		{ ticket : req.params.postId},
		{ $set : {status : true}},
		{ multi:true}
	);
	
	res.json({ success: true });	
})

/**
*	Get banner details
*/
router.get("/banner_result", async (req, res) => {
	const banner_result = await Banner.find({status: true}, {"image" :1, "_id" :0}).sort({"updated_at": -1});	
	if(banner_result)
	{
		res.json({ banner_result: banner_result });										
	}
	else
	{
		res.json({ banner_result: 'No data found' });								
	}
})

/* Get users bonus details */
router.get("/userbonus_list", async (req, res) => {
	
	const user_list = await Users.find({ $and : [
		{user_referenced_code: ''}
	]});
	
	if(user_list)
	{
		var userbonus_array = [];
		for(var a = 0; a < user_list.length; a++)
		{
			const referral_userlist = await Users.find({user_referenced_code: user_list[a].user_referral_code});
			
			var userid_ = user_list[a]._id;				
			var bonus_value_ = [];
			for(var z = 0; z < referral_userlist.length; z++)
			{			
				var userbonus_ = 0;
				const coin_transaction_arr = await User_coin_transaction.find({user_id: referral_userlist[z]._id});
				for(var q = 0; q < coin_transaction_arr.length; q++)
				{
					userbonus_ = parseFloat(userbonus_) + parseFloat(coin_transaction_arr[q].bonus_value);
				}					
				bonus_value_[z] = {userbonus_};
			}
			userbonus_array[a] = {userid_, bonus_value_};
		}
		res.send({ userbonus_list: userbonus_array });
	}
	else
	{
		res.json({userbonus_list: 'No data found'});
	}	
})

/* Traders and Influencers */
router.get("/tradersInfluencersList", async (req, res) => {
	
	const tradersInfluencers_result = await traders_influencers.find({"status": true}, {"status" :0, "_id" :0}).sort({"rank": 1});		
	if(tradersInfluencers_result)
	{
		res.json({ result_: tradersInfluencers_result });									
	}
	else
	{
		res.json({ result_: 'No data found' });							
	}
})

/**********************************Start Dapps Module *******************************************/
/* dappSubmit services  methode post */
router.post('/dappsSubmit', async (req, res) => {
	if(req.body.dappName == undefined || req.body.dappName == null)
	{
		res.json({error_msg: "dappName cannot be blank"});
		return;
	}
	if(req.body.email == undefined || req.body.email == null)
	{
		res.json({error_msg: "email cannot be blank"});
		return;
	}
	if(req.body.website == undefined || req.body.website == null)
	{
		res.json({error_msg: "website cannot be blank"});
		return;
	}
	if(req.body.networkSelect == undefined || req.body.networkSelect == null)
	{
		res.json({error_msg:"networkSelect cannot be blank"});
	}
	// var dapps = {};
	let dappsDetails = new dappsModel({
		dappName : req.body.dappName,
		email : req.body.email,
		telegram : req.body.telegram,
		website : req.body.website,
		category : req.body.category,
		networkSelect : req.body.networkSelect,
		additionalLink : req.body.additionalLink,
		description : req.body.description,
		title : req.body.title,
		contractAddress : req.body.contractAddress,
		videoUrl : req.body.videoUrl,
		dappLogo : req.body.dappLogo,
		dappIcon : req.body.dappIcon,
		otherImage : req.body.otherImage,
		trxHistorySevenDays : req.body.trxHistorySevenDays,
		volume7DaysUsd : req.body.volume7DaysUsd,
		volume1DayUsd : req.body.volume1DayUsd,
		volumeChange1DayData : req.body.volumeChange1DayData,
		userChange1DayData : req.body.userChange1DayData,
		volumePercentageChange : req.body.volumePercentageChange,
		userPercentageChange : req.body.userPercentageChange,
		activeStatus : req.body.activeStatus,
		contractBalance : req.body.contractBalance,
		usersOneHours : req.body.usersOneHours,
		volumeOneHours : req.body.volumeOneHours,
		volumeSevenDays : req.body.volumeSevenDays,
		transOneHours : req.body.transOneHours,
		transSevenDays : req.body.transSevenDays,
		status : true,
		created_at : moment().format("ll"),
    	updated_at : new Date().getTime()
	});
	dappsDetails.save(function(error, created) {
		console.log('err : ', error);
		if(created) {
			res.json({success: true, msg:'dapps submit successfully.', created});
			return;
		}
		else
		{
			res.json({success: false, msg:'not submit'});
      		return;
		}
	})
});
/**********************************End Dapps Module *******************************************/

/*********** Start Youtube Notification API  *********************************************/

/* Get_notification_for_new_video */
router.post('/notification_for_new_video', async (req, res) => {
	if(req.body.channel_id == undefined || req.body.channel_id == null) {
		res.json({error_msg: "channel_id cannot be blank"});
		return;
	}
	if(req.body.youtube_id == undefined || req.body.youtube_id == null) {
		res.json({error_msg: "youtube_id cannot be blank"});
		return;
	}
	var old_video = req.body.youtube_id;
	var channel = await ChannelModel.findOne({channel_id: req.body.channel_id});
	var new_video = channel.youtube_id
	if(new_video!= old_video)
	{
		res.json({success: true, msg :'new videos are uploaded', new_video});
		return;
	}
	else
	{
		res.json({success: false,  msg :'new video not uploaded', old_video});
		return;
	}
});


/* gems_bricks API */
router.post('/gems_bricks', async (req, res) => {
	if(req.body.user_id == undefined || req.body.user_id == null) {
		res.json({error_msg: "user_id cannot be blank"});
		return;
	}
	
	if(req.body.youtube_id == undefined || req.body.youtube_id == null) {
		res.json({error_msg: "youtube_id cannot be blank"});
		return;
	}
	if(req.body.key == undefined || req.body.key == null) {
		res.json({error_msg: "key cannot be blank"});
		return;
	}
	if(req.body.count == undefined || req.body.count == null) {
		res.json({error_msg: "count cannot be blank"});
		return;
	}
	var userId = req.body.user_id;
	try
	{
		var youtubeId = req.body.youtube_id;
		var ChannelDetails = await ChannelModel.findOne({youtube_id: youtubeId});
		if(ChannelDetails)
		{
			var videoStatusDetails = await videoStatusModel.findOne({youtube_id: req.body.youtube_id})
			console.log('videoStatusDetails :', videoStatusDetails);

			if(videoStatusDetails.gems_count==0 && videoStatusDetails.bricks_count==0)
			{
				var key = req.body.key;
				if(key == 'gems')
				{
					var counts = Number(ChannelDetails.gems) + Number(1);
					var videoCount = Number(videoStatusDetails.gems_count) + Number(1);

					let postData = await ChannelModel.update({youtube_id: youtubeId}, {
						$set : { gems : counts, updated_at : new Date().getTime() }
					});
					
					let postDatas = await videoStatusModel.update({youtube_id: youtubeId},
						{ $set : { user_id: userId, gems_count : videoCount, gems_bricks_status : new Date().getTime() }
					});

					res.json({success: true, msg : 'gems successfully'});
					return;
				}
				else if(key == 'bricks')
				{
					var counts = Number(ChannelDetails.bricks) + Number(1);
					var videoCount = Number(videoStatusDetails.bricks_count) + Number(1);

					let postData = await ChannelModel.update({youtube_id: youtubeId}, {
						$set : { bricks : counts, updated_at : new Date().getTime() }	
					})

					let postDatas = await videoStatusModel.update({youtube_id: youtubeId},
						{ $set : { user_id: userId, bricks_count : videoCount, gems_bricks_status : new Date().getTime()}
					});

					res.json({success: true, msg : 'bricks successfully'});
					return;
				}
			}
			else
			{
				var key = req.body.key;
				if(key == 'gems')
				{
					if(videoStatusDetails.gems_count==0)
					{
						var likeCounts = Number(ChannelDetails.gems) + Number(1);
						var disLikeCounts = Number(ChannelDetails.bricks) - Number(1);

						var videoLikeCount = Number(videoStatusDetails.gems_count) + Number(1);
						var videoDisLikeCount = Number(videoStatusDetails.bricks_count) - Number(1);

						let postData = await ChannelModel.update({youtube_id: youtubeId},
							{ $set : {gems : likeCounts, bricks : disLikeCounts, updated_at : new Date().getTime()}
						});

						let postDatas = await videoStatusModel.update({youtube_id: youtubeId},
							{ $set : { user_id: userId, gems_count : videoLikeCount, bricks_count : videoDisLikeCount, gems_bricks_status : new Date().getTime()}
						});
						res.json({success: true, msg : 'gems like successfully'});
						return;
					}
					else
					{
						res.json({success: true, msg : "you have already gems" });
						return;
					}

				}
				else if(key == 'bricks')
				{
					if(videoStatusDetails.bricks_count==0)
					{
						var likeCounts = Number(ChannelDetails.gems) - Number(1);
						var disLikeCounts = Number(ChannelDetails.bricks) + Number(1);

						var videoLikeCount = Number(videoStatusDetails.gems_count) - Number(1);
						var videoDisLikeCount = Number(videoStatusDetails.bricks_count) + Number(1);

						let postData = await ChannelModel.update({youtube_id: youtubeId},
							{ $set : {gems : likeCounts, bricks : disLikeCounts, updated_at : new Date().getTime()}
						});

						let postDatas = await videoStatusModel.update({youtube_id: youtubeId},
							{ $set : { user_id: userId, gems_count : videoLikeCount, bricks_count : videoDisLikeCount, gems_bricks_status : new Date().getTime()}
						});
						res.json({success: true, msg : 'bricks dislike successfully'});
						return;
					}
					else
					{
						res.json({success: true, msg : "you have already bricks" });
						return;
					}
				}
			}
		}
		else
		{
			res.json({ success: false, error_msg:"youtube_id not found."});
			return;
		}
	}
	catch  (err) {
		console.log('error :', err);
		res.json({error_msg:"Something want wrong."});
		return;
	}
});


/* video status API */
router.post("/gemsBricksStatus", async (req, res) => {
	if(req.body.user_id == undefined || req.body.user_id == null) {
		res.json({error_msg: "user_id cannot be blank"});
		return;
	}
	const videoStatusData = await videoStatusModel.findOne({user_id : req.body.user_id});
	console.log(videoStatusData);
	if(videoStatusData)
	{
		res.json({ result_: videoStatusData });	
		return;
	}
	else
	{
		res.json({result_: false, msg:'user_id not found'});
		return;
	}
});


// router.get("/gemsBricksStatus", async (req, res) => {
// 	const videoStatusModel_result = await videoStatusModel.find({"status": true}, {"status" :0, "_id" :0});			
// 	if(videoStatusModel_result !='' || videoStatusModel_result.length>0)
// 	{
// 		res.json({ result_: videoStatusModel_result });									
// 	}
// 	else
// 	{
// 		res.json({ result_: 'No data found' });							
// 	}
// });


/* check_notification_for_user */
router.post('/check_notification_for_user', async (req, res) => {
	if(req.body.user_id == undefined || req.body.user_id == null) {
		res.json({error_msg: "user id cannot be blank"});
		return;
	}
	if(req.body.channel_id == undefined || req.body.channel_id == null) {
		res.json({error_msg: "channel id cannot be blank"});
		return;
	}
	if(req.body.youtube_id == undefined || req.body.youtube_id == null) {
		res.json({error_msg: "youtube id cannot be blank"});
		return;
	}
	
	try
	{
		const channel = await videoStatusModel.findOne({channel_id : req.body.channel_id});
		if(channel) {
			var new_youtube_id = channel.youtube_id
			if(new_youtube_id != req.body.youtube_id)
			{
				var user_arr = [];
				var user_arr = channel.users_id;
				
				user_arr.splice(req.body.user_id);
				user_arr.push(req.body.user_id);
				let post = await videoStatusModel.update({_id : channel._id},
					{ $set : {users_id : user_arr, updated_at : new Date().getTime()}
				})
				res.json({success: true, msg : 'notification checked successfully'});
				return;
			}
			else {
				var user_arr = [];
				var user_arr = channel.users_id;
				
				user_arr.push(req.body.user_id);
				let post = await videoStatusModel.update({_id : channel._id},
					{ $set : {users_id : user_arr, updated_at : new Date().getTime()}
				})
				res.json({success: true, msg : 'notification checked successfully'});
				return;
			}
		}
		else
		{
			res.json({error_msg:"channel id not found."});
    		return;
		}
	}
	catch (e) {
		res.json({error_msg:"Something want wrong."});
		return;
	}
});


/* ============================================================================================= */ 

/* update status for notifications */
router.post('/updateNotifications_old API', async (req, res) => {
	if(req.body.channel_id == undefined || req.body.channel_id == null) {
		res.json({error_msg: "channel_id cannot be blank"});
		return;
	}
	if(req.body.user_id == undefined || req.body.user_id == null) {
		res.json({error_msg: "user_id cannot be blank"});
		return;
	}
	try
	{	
		const result = await videoStatusModel.findOne({channel_id : req.body.channel_id});
		if(result) {
			var user_arr = [];
			var user_arr = result.user_id;
			
			user_arr.push(req.body.user_id);
			let post = await videoStatusModel.update({_id : result._id},
				{ $set : {user_id : user_arr, updated_at : new Date().getTime()}
			})
			res.json({success: true, msg : 'update successfully'});
			return;
		}
		else
		{
			res.json({error_msg:"channel_id not found."});
    		return;
		}
	}
	catch (e) {
		//res.send(500)
		res.json({error_msg:"Something want wrong."});
		return;
	}
});

/* -------Testing API -------- */ 
/* dropVideoStatus Schema */
router.get("/dropVideoStatus", async (req, res) => {
	videoStatusModel.remove({},function(err, removed){
		if (err) throw err;
		if (removed) console.log("Collection deleted");
	});
});

/* videoStatusList */
router.get("/videoStatusList", async (req, res) => {
	const videoStatusData = await videoStatusModel.find({});		
	if(videoStatusData)
	{
		res.json({ result_: videoStatusData });									
	}
	else
	{
		res.json({result_: 'No data found'});							
	}
});





/* -------End of Testing API -------- */ 

/********************* End Of Youtube Notification API  ******************************************/

module.exports = router;
