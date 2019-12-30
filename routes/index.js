var express = require('express');
var router = express.Router();
const bodyParser 	= require('body-parser');
var nodemailer 		= require('nodemailer');
const session 		= require('express-session');
var flash    		= require('req-flash');
var md5				= require('md5');
var serialize 		= require('node-serialize');

var ip 				= require('ip');
var ejs 			= require('ejs');
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

const Admin = mongoose.model("Admin")
const Forgotpass = mongoose.model("Forgotpass")
const Users = mongoose.model("Users")
const Evotbonus = mongoose.model("Evotbonus")
const Emailtemplate = mongoose.model("Emailtemplate")
const Sendemail_list = mongoose.model("Sendemail_list")
const Advertising = mongoose.model("Advertising")
const Press_releases = mongoose.model("Press_releases")
const Token_send = mongoose.model("Token_send")
const Support = mongoose.model("Support")
const Support_chat = mongoose.model("Support_chat")
const Banner = mongoose.model("Banner")
const Blogs = mongoose.model("Blogs")
const Blog_category = mongoose.model("Blog_category")
const Blog_to_category = mongoose.model("Blog_to_category")
const Announcement = mongoose.model("Announcement")
const Announcement_category = mongoose.model("Announcement_category")
const User_coin_transaction = mongoose.model("User_coin_transaction")

const Traders_categoryModel = mongoose.model("Traders_category")
const ChannelModel = mongoose.model("Traders_Channel")

const whiteListModel = mongoose.model("Whitelist")
const profitModel = mongoose.model("Profit")

const userGroupModel = mongoose.model("User_group")
const Usersrole = mongoose.model("Usersrole")

const videoStatusModel = mongoose.model("Video_status")

const dappsModel = mongoose.model("Dapps")

const multer = require('multer');
var moment = require('moment');

// SET STORAGE
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads')
	},
	filename: function (req, file, cb) {
		var fileExtension = file.originalname.split('.');
		cb(null, `${file.fieldname}-${Date.now()}.${fileExtension[fileExtension.length - 1]}`);
	}
})
 
var upload = multer({ storage: storage })

router.get("/show", async (req, res) => {
	try{	
		// const admin_data = await Admin.update(
				// {email : 'admin@admin.com' },
				// {$set : {email: 'admin@evoai.network'}}
			// );
		// res.json(admin_data);
		//const resss = await Users.find({});		
		res.json('show');
	}
	catch(error){
		res.status(500)
	}
})

/* Login url */
router.get('/', function(req, res, next) {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId){				
		res.redirect('/dashboard');		
	}
	else{
		var notification_arr = {
			'type': req.flash('type'),
			'text_msg': req.flash('text_msg')
		}
		
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: ''});
	}
});

/* Login url */
router.get('/login', function(req, res, next) {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId){	
		req.flash('type', 'Warning');
		req.flash('text_msg', 'You are logged in!');
		res.redirect('/dashboard');		
	}
	else{
		var notification_arr = {
			'type': req.flash('type'),
			'text_msg': req.flash('text_msg')
		}		
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: ''});
	}
});

/* Login */
router.post('/login', async (req, res, next) => {
	var username = req.body.username;
	var password = md5(req.body.password);
	var redirecturl = req.body.redurl;
	if(username != '' && password != '')
	{
		var admin_details = await Admin.find({ $and : [ {"email": username }, {"password": password}]}, {"_id":1, "username":1, "email":1, "role":1})
		
		var logintime = new Date().getTime();
		if(admin_details.length > 0){
			req.session.emailId = admin_details[0].email;
			req.session.admin_name = admin_details[0].username;
			req.session.admin_id = admin_details[0]._id;	
			req.session.adminrole = admin_details[0].role;	
			
			const admin_data = await Admin.update(
				{_id : admin_details[0]._id },
				{$set : {login_time : logintime}}
			);
			
			if(redirecturl)
			{						
				req.flash('type', 'Success');
				req.flash('text_msg', 'Login success');				
				res.redirect('/'+redirecturl);						
			}
			else
			{
				req.flash('type', 'Success');
				req.flash('text_msg', 'Login success');
				res.redirect('/dashboard');										
			}
		}	
		else
		{
			var notification_arr = {
				'type': 'Error',
				'text_msg': 'Email and password are not match'
			}			
			res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: ''});
		}
	}
	else if(username == ''){
		var notification_arr = {
			'type': 'Error',
			'text_msg': 'Email field is require*'
		}
		
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: ''});
	}
	else if(password == ''){
		var notification_arr = {
			'type': 'Error',
			'text_msg': 'Password field is require*'
		}
		
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: ''});
	}
	else{
		res.redirect('/');	
	}		
});

/* forgot password */
router.get("/forgot_password", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		req.flash('type', 'Warning');
		req.flash('text_msg', 'You are logged in!');
		res.redirect("/dashboard");
	}
	else
	{
		var notification_arr = {
			'type': req.flash('type'),
			'text_msg': req.flash('text_msg')
		}		
		res.render('forgotpass', { title: 'Forgot password', menuId: 'Forgot password', msg: notification_arr, redirecturl: ''});		
	}
})

/* @router for forgot password */
router.post("/forgot_password", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{		
		req.flash('type', 'Warning');
		req.flash('text_msg', 'You are logged in!');
		res.redirect("/dashboard");
	}
	else
	{
		var adminemail = req.body.username;
		if(adminemail != '')
		{
			const post = await Admin.findOne({"email": adminemail});
			if(post != '')
			{
				var mailOptions = {
					from: webEmail,
					to: adminemail,
					subject: 'Forgot password',
					html: 	'<p>Dear <b>'+post.username+',</b></p>'+
							'<p>Someone (hopefully you) requested a password reset at '+clientUrl+'</p>'+
							'<p>To reset your password, please follow the following link: '+clientUrl+'/resetpw/'+post._id+'</p>'+
							'<p>thanks and regards,<br>Evoai team</p>'
				};

				sgMail.sendMultiple(mailOptions);
				
				const passdetails = new Forgotpass();
				passdetails.user_id = post._id;
				passdetails.email = adminemail;
				passdetails.to_time = new Date().getTime() + (15 * 60 * 1000);
				passdetails.created_at = moment().format("ll"); 
				passdetails.updated_at = moment().format("ll"); 
				
				await passdetails.save();
				req.flash('type', 'Success');
				req.flash('text_msg', 'Please check your email, got a link');
				res.redirect("/login");
			}
			else
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': 'Not record found'
				}
				res.render('forgotpass', { title: 'Forgot password', menuId: 'Forgot password', msg: notification_arr, redirecturl: ''});		
			}
		}
		else
		{
			var notification_arr = {
				'type': 'Error',
				'text_msg': 'Email field is require**'
			}
			res.render('forgotpass', { title: 'Forgot password', menuId: 'Forgot password', msg: notification_arr, redirecturl: ''});		
		}		
	}
})

/* resetpassword */
router.get("/resetpw/:postId", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		req.flash('type', 'Warning');
		req.flash('text_msg', 'You are logged in!');
		res.redirect("/dashboard");
	}
	else
	{
		var nowtime = new Date().getTime();
		const linkresult = await Forgotpass.findOne({ $and: [ {user_id: req.params.postId}, {to_time: {$gte: nowtime}} ]});
		if(linkresult != '')
		{
			try{
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}				
				res.render('resetpassword', { title: 'Reset password', menuId: 'Resetpassword', msg: notification_arr, redirecturl: '', adminId: req.params.postId});
			}
			catch(e)
			{
				res.status(500);
			}
		}
		else
		{
			var notification_arr = {
				'type': 'Error',
				'text_msg': 'Link has been expired**'
			}
			
			res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: ''});
		}
	}
})

/* Change passsword */
router.post("/resetpw/:postId", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		req.flash('type', 'Warning');
		req.flash('text_msg', 'You are logged in!');
		res.redirect("/dashboard");
	}
	else
	{
		try{
			const post = await Admin.update(
				{ _id : req.params.postId},
				{ $set : {password : md5(req.body.password)}}
			);
			req.flash('type', 'Success');
			req.flash('text_msg', 'Password reset successful');
			res.redirect('/login');
		}
		catch(e)
		{
			res.status(500);
		}
	}
})

/* Admin adminaccess */
router.get("/adminaccess", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{		
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{
			const admins_arr = await Admin.find({ $and : [
				{"email": {$ne : "admin@admin.com"}}, {"email": {$ne : emailId}} 
			]});
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('adminaccess_role', { title: 'Admin role', menuId: 'access_role', msg: notification_arr, adminname:admin_name, admins_list: admins_arr, adminpermition: adminpermition });					
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'adminaccess'});
	}
})

/* Sub admin register */
router.get("/register", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('admin_register', { title: 'Sub Admin Details', menuId: 'access_role', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });		
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'register'});
	}
})

/* Insert data of admin details */
router.post("/register", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			var pass = req.body.password;
			var conf_pass = req.body.conf_password;
			var username = req.body.username;
			var email = req.body.email;
			
			if(pass != '' && conf_pass != '' && username != '' && email != '')
			{
				const checkusername = await Admin.find({"username": username});
				if(checkusername.length > 0)
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'this username already exists'
					}
					res.render('admin_register', { title: 'Sub Admin Details', menuId: 'access_role', msg: notification_arr, adminname:admin_name, adminpermition:adminpermition });		
				}
				const checkemail = await Admin.find({"email": email});
				if(checkemail.length > 0)
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'this email already exists'
					}
					res.render('admin_register', { title: 'Sub Admin Details', menuId: 'access_role', msg: notification_arr, adminname:admin_name, adminpermition:adminpermition });		
				}
				if(pass == conf_pass)
				{
					try{
						const post = new Admin();
						post.username = req.body.username;
						post.email = req.body.email;
						post.password = md5(req.body.password);
						post.role = req.body.role;
						post.created_at = moment().format("ll"); 
						post.updated_at = moment().format("ll"); 
						
						await post.save();
						
						var mailOptions = {
							from: webEmail,
							to: email,
							subject: 'Account successfully created | On Evoai network',
							html: '<p>Dear <b>'+username+',</b></p><p>Your account successful added at Evoai network</p><p>Email: '+email+'<br>Password: '+pass+'</p><p>thanks and regards,<br>Evoai team</p>'
						};

						sgMail.sendMultiple(mailOptions);
						req.flash('type', 'Success');
						req.flash('text_msg', 'Details are stored successful');
						res.redirect("/adminaccess");
					}
					catch(error)
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': error
						}
						res.render('admin_register', { title: 'Sub Admin Details', menuId: 'access_role', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition});		
					}			
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Password and confirm password must be same!'
					}
					res.render('admin_register', { title: 'Sub Admin Details', menuId: 'access_role', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });		
				}			
			}
			else
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': 'Fill are all required field*'
				}
				res.render('admin_register', { title: 'Sub Admin Details', menuId: 'access_role', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });		
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'register'});
	}
})


/* Edit admin access role */
router.get("/editdetails/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{
				const post = await Admin.findOne({_id: req.params.postID});
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('editadminrole', { title: 'Admin role', menuId: 'access_role', msg: notification_arr, adminname:admin_name, editadmin_details: post, adminpermition: adminpermition });					
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Warning',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'adminaccess'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'adminaccess'});
	}
})

/* Update admin access role */
router.post("/editdetails/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{			
				await Admin.update(
					{ _id : req.params.postID},
					{ $set : {role : req.body.role}}
				);
				
				req.flash('type', 'Success');
				req.flash('text_msg', 'Update successful');
				res.redirect("/adminaccess");
			}
			catch(error)
			{
				const admins_arr = await Admin.find({ $and : [
					{"email": {$ne : "admin@admin.com"}}, {"email": {$ne : emailId}}
				]});
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('adminaccess_role', { title: 'Admin role', menuId: 'access_role', msg: notification_arr, adminname:admin_name, admins_list: admins_arr, adminpermition:adminpermition });		
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'adminaccess'});
	}
})

// Delete Schema responce
router.delete('/removeadmin/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Admin.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'adminaccess'});
	}
})

/* Dashboard */
router.get('/dashboard', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const befote24_hours = new Date().getTime() - (12 * 60 * 60 * 1000);		// before 24 hours
		const last7_days 	 = new Date().getTime() - (7 * 12 * 60 * 60 * 1000);	// before 7 days
		
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		
		const active_adverts = await Advertising.find({"status": true});
		const total_adverts = active_adverts.length;
		
		const active_Press = await Press_releases.find({"status": true});
		const total_Press = active_Press.length;
		
		const active_Support_active = await Support.find({"status": false});
		const total_Support_active = active_Support_active.length;
				
		const active_Support = await Support.find({ $and : [
			{"status": true}, {updated_at: {$gte : befote24_hours}}
		]});
		const total_Support = active_Support.length;
		
		const active_Announcement = await Announcement.find({ $and : [
			{"status": true}, {updated_at: {$gte : befote24_hours}}
		]});
		const total_Announcement = active_Announcement.length;
		
		const active_Announcement7 = await Announcement.find({ $and : [
			{"status": true}, {updated_at: {$gte : last7_days}}
		]});
		const total_Announcement7days = active_Announcement7.length;
		
		const evotbonus_arr = await Evotbonus.findOne({});
		const evotbonus_total = evotbonus_arr.evot_value;
		
		/* Admin 24 hours before login */
		const adminlogin_arr = await Admin.find({login_time : {$gte : befote24_hours}});
		const admin24_total = adminlogin_arr.length;
				
		const active_Blogs = await Blogs.find({updated_at: {$gte : befote24_hours}});
		const total_Blogs = active_Blogs.length;		
		/* Last user login */
		const active_users = await Users.find({last_login: {$gte : befote24_hours}});
		const login_users = active_users.length;		
		
		const active_Blogs7 = await Blogs.find({updated_at: {$gte : last7_days}});
		const total_Blogs7days = active_Blogs7.length;		
				
		Admin.count(function(error, admin_cont){
			Users.count(function(error, user_cont){
								
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('index', { title: 'Dashboard', evotbonus_total: evotbonus_total, total_adverts: total_adverts, total_Press: total_Press, total_Support_active: total_Support_active, total_Support: total_Support, total_Blogs: total_Blogs, total_Blogs7days: total_Blogs7days, login_users: login_users, total_Announcement: total_Announcement, menuId: 'Dashboard', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition, admin_cont:admin_cont, user_cont: user_cont, admin24_total: admin24_total, total_Announcement7days: total_Announcement7days });					
			});
		});
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'dashboard'});
	}
});

/* User referral link */
router.get('/userReferral', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		
		if(adminpermition.includes('Admin'))
		{			
			const user_list = await Users.find({}, {"username" :1, "_id" :0, "email" :1, "user_referral_code" :1, "user_referenced_code" :1})
			const reference_user = await Users.find({}, {"username" :1, "_id" :0, "email" :1, "user_referral_code" :1, "user_referenced_code" :1})	
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}	
			res.render('userReferral', {title: "Referral Users", menuId: "userReferral", userList_arr: user_list, reference_user_arr: reference_user, msg: notification_arr, adminname:admin_name, adminpermition:adminpermition});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'userReferral'});
	}
})

/* Evot value and bonus */
router.get("/evotbonus", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const evotbonus_arr = await Evotbonus.findOne({});
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('evotbonus', { title: 'Evot Bonus Value', menuId: 'evotbonus', msg: notification_arr, adminname:admin_name, evotbonus_result: evotbonus_arr, adminpermition:adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'evotbonus'});
	}
})

/* Update evot value and bonus */
router.post("/evotbonus/:postId", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Evotbonus.findByIdAndUpdate({
				_id: req.params.postId
			}, req.body, {
				new: true,
				runValidators: true
			});
			req.flash('type', 'Success');
			req.flash('text_msg', 'Update successful');
			res.redirect('/evotbonus');
		}
		catch(e)
		{
			res.status(500);
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'evotbonus'});
	}
})


/***************************************************** User Account Management ****************************************************************/
/* List users */
router.get("/users/:page", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const resPerPage = 10; // results per page
		const page = req.params.page || 1; // Page 
		
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{
				const total_user = await Users.find({});
				const users_list = await Users.find({}).skip((resPerPage * page) - resPerPage).limit(resPerPage).sort({"updated_at": -1});
				const numOfUser = total_user.length;
				const pages = Math.ceil(numOfUser / resPerPage); 
				var notification_arr = {
						'type': req.flash('type'),
						'text_msg': req.flash('text_msg')
					}
				res.render('users', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, users_list: users_list, currentPage: page, pages: pages, adminpermition:adminpermition });			
			}
			catch(error)
			{
				throw new Error(err);
			}		
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
	}
})

/* User data json */
router.post("/userslist", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{				
		var findemail = req.body.id;
		if(findemail != '')
		{
			const users_result = await Users.find({ $or : [{ 'username': new RegExp(findemail, 'i') }, { 'email': new RegExp(findemail, 'i') }]}).sort({"created_on": -1});
			if(users_result.length > 0)
			{
				ejs.renderFile(process.cwd() + "/views/userslist.ejs", {users_list: users_result }, function (err, data) {
				if (err) {
						console.log(err);
					} else {
						
						res.json(data);
					}
				});									
			}
			else
			{
				res.json('');
			}
		}
		else
		{
			const users_result = await Users.find({}).limit(10).sort({"created_on": -1});
			ejs.renderFile(process.cwd() + "/views/userslist.ejs", {users_list: users_result }, function (err, data) {
			if (err) {
					console.log(err);
				} else {
					
					res.json(data);
				}
			});				
		}
		
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
	}
})

/* Users details */
router.get("/userDetails/:postId", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{
				const edituser_arr = await Users.findOne({_id: req.params.postId});
				const reference_userdetails = await Users.findOne({user_referral_code: edituser_arr.user_referenced_code});
				const referral_userlist = await Users.find({user_referenced_code: edituser_arr.user_referral_code});
				const evotbonus_arr = await Evotbonus.findOne({});
				const paidbonus_array = await Token_send.find({to_address: edituser_arr.eth_address}, {amount: 1}).sort({time: -1});
				const usergroup_arr = await userGroupModel.find({});
				
				var user_paidbonus = 0;
				if(paidbonus_array)
				{
					for(var e = 0; e < paidbonus_array.length; e++)
					{
						if(paidbonus_array[e].amount > 0)
						{
							user_paidbonus = parseFloat(user_paidbonus) + parseFloat(paidbonus_array[e].amount);							
						}
					}
				}				
				
				var userid_bonus = [];
				for(var z = 0; z < referral_userlist.length; z++)
				{			
					var userid_ = referral_userlist[z]._id;
					var usercoin = 0;
					var userbonus_ = 0;
					const coin_transaction_arr = await User_coin_transaction.find({user_id: referral_userlist[z]._id});
					for(var q = 0; q < coin_transaction_arr.length; q++)
					{
						usercoin = coin_transaction_arr[q].current_value;
						userbonus_ = parseFloat(userbonus_) + parseFloat(coin_transaction_arr[q].bonus_value);
					}					
					userid_bonus[z] = {userid_, usercoin, userbonus_};
				}
				
				if(edituser_arr != '')
				{
					var notification_arr = {
							'type': req.flash('type'),
							'text_msg': req.flash('text_msg')
						}
					res.render('userDetails', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, referral_userlist: referral_userlist, reference_userdetails: reference_userdetails, evotbonus_arr: evotbonus_arr, adminpermition:adminpermition, userid_bonus: userid_bonus, user_paidbonus: user_paidbonus, usergroup_arr: usergroup_arr});
				}
				else
				{
					const users_list = await Users.find({});
					var notification_arr = {
							'type': 'Error',
							'text_msg': 'User details not found'
						}
					res.render('users', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, users_list: users_list, adminpermition:adminpermition });
				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
	}	
})

/* add users */
router.get("/adduser", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			var form = '';
			res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition:adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'adduser'});
	}
})

/* Add User details */
router.post("/adduser", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			var reference_username = '';
			var pass = req.body.password;
			var conf_pass = req.body.conf_password;
			var username = req.body.username;
			var email = req.body.email;
			var eth_address = req.body.eth_address;
			var referrered_by = req.body.referrered_by;
			
			//fields value holder
			var form = {
				usernameholder: req.body.username,
				emailholder: req.body.email,
				eth_addressholder: req.body.eth_address,
				phoneholder: req.body.phone,
				referrered_byholder: req.body.referrered_by,
				passwordholder: req.body.password,
				conf_passwordholder: req.body.conf_password
			};
			
			if(pass != '' && conf_pass != '' && username != '' && email != '' && eth_address != '')
			{
				if(username)
				{
					var alpha = /^[a-zA-Z]*$/; 
					var validusername = alpha.test(username);
					if (validusername == false) {
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Username can use only letters without space'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
					}
					if (username.length > 25) {
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Username must be less than 25 letters'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
					}
					if (username.length < 3) {
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Username must be greater than 2 letters'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
					}
				}
				if(email)
				{
					var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					var results = re.test(email);
					if(results == false)
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Invalid email id'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
					}
				}
				if(pass != conf_pass)
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Password and confirm password are must be same'
					}
					res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
				}	
				if(pass)
				{
					var pass_spec = /[\@\#\$\%\^\&\*\(\)\_\+\!]/;
					var password_spec = pass_spec.test(pass);
					if(password_spec == false)
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Password at least one special character'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });					
					}
					var pass_lower = /[a-z]/;
					var password_lower = pass_lower.test(pass);
					if(password_lower == false)
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Password at least one lower case letter'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });					
					}
					var pass_upper = /[A-Z]/;
					var password_upper = pass_upper.test(pass);
					if(password_upper == false)
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Password at least one upper case letter'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });					
					}
					if(pass.length < 6)
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Password should be minimum 6 characters'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });					
					}
				}	
				const checkusername = await Users.find({"username": username});
				if(checkusername.length > 0)
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'This username already exists '
					}
					res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
				}
				const checkemail = await Users.find({"email": email});
				if(checkemail.length > 0)
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'This email already exists'
					}
					res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
				}
				if(referrered_by != '')
				{
					const checkreferrered_arr = await Users.find({"username": referrered_by});
					if(checkreferrered_arr.length > 0)
					{
						reference_username = checkreferrered_arr[0].user_referral_code;
					}
					else
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Referred user is not found'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
					}
				}			
				if(eth_address)
				{
					var valid = WAValidator.validate(eth_address, 'ETH');
					if(valid)
					{
						const checkre_eth_address = await Users.find({"eth_address": eth_address});
						if(checkre_eth_address.length > 0)
						{
							var notification_arr = {
								'type': 'Error',
								'text_msg': 'ETH address already exists*'
							}
							res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });		
						}
						else
						{
							try{
								const post = new Users();
								post.username = req.body.username;
								post.email = req.body.email;
								post.phone = req.body.phone;
								post.password = md5(req.body.password);
								post.transaction_approval = 0;
								post.ip_address = ip.address();
								post.user_referenced_code = reference_username;
								post.eth_address = eth_address;
								post.created_on = new Date();
								
								await post.save();
								
								var mailOptions = {
									from: webEmail,
									to: email,
									subject: 'Account successfully created | On Evoai network',
									html: '<p>Dear <b>'+username+',</b></p>'+
										'<p>Your account successful added at Evoai network</p><p>Email: '+email+'<br>Password: '+pass+'</p>'+
										'<p>thanks and regards,<br>Evoai team</p>'
								};

								sgMail.sendMultiple(mailOptions);
								req.flash('type', 'Success');
								req.flash('text_msg', 'User details stored successful!');
								res.redirect("/users");
							}
							catch(error)
							{
								var notification_arr = {
										'type': 'Error',
										'text_msg': error
									}
								res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
							}	
						}
					}
					else
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'ETH Address is not valid'
						}
						res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });		
					}
				}
			}
			else
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': 'Fill all require field**'
				}
				res.render('adduser', { title: 'Add User', menuId: 'users', msg: notification_arr, adminname:admin_name, form:form, adminpermition: adminpermition });
			}			
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'adduser'});
	}	
})

/* Edit user details */
router.get("/edituser/:postId", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{
				const edituser_arr = await Users.findOne({_id: req.params.postId});
				if(edituser_arr != '')
				{
					var notification_arr = {
							'type': req.flash('type'),
							'text_msg': req.flash('text_msg')
						}
					res.render('edituser', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, adminpermition: adminpermition });
				}
				else
				{
					const users_list = await Users.find({});
					var notification_arr = {
							'type': 'Error',
							'text_msg': 'User details not found'
						}
					res.render('users', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, users_list: users_list, adminpermition: adminpermition });
				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
	}	
})


/* Update user details */
router.post("/edituser/:postId", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{
				const username = req.body.username;
				const email = req.body.email;
				const eth_address = req.body.eth_address;
				
				const edituser_arr = await Users.findOne({_id: req.params.postId});						
				if(username != '' && email != '' && eth_address != '')
				{
					const edituser_result = await Users.find({ $and : [
						{_id : {$ne : req.params.postId}}, {username : username}
					]});
					const edituser_email = await Users.find({ $and : [
						{_id : {$ne : req.params.postId}}, {email : email}
					]});
					
					if(edituser_result.length > 0)
					{
						var notification_arr = {
								'type': 'Error',
								'text_msg': 'This username already exists'
							}
						res.render('edituser', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, adminpermition: adminpermition });				
					}
					if(edituser_email.length > 0)
					{
						var notification_arr = {
								'type': 'Error',
								'text_msg': 'This email already exists'
							}
						res.render('edituser', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, adminpermition: adminpermition });				
					}
						
					var valid = WAValidator.validate(eth_address, 'ETH');
					if(valid)
					{
						if(username)
						{
							var alpha = /^[a-zA-Z]*$/; 
							var validusername = alpha.test(username);
							if (validusername == false) {
								var notification_arr = {
									'type': 'Error',
									'text_msg': 'Username can use only letters without space'
								}
								res.render('edituser', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, adminpermition: adminpermition });	
							}
							if (username.length > 25) {
								var notification_arr = {
									'type': 'Error',
									'text_msg': 'Username must be less than 25 letters'
								}
								res.render('edituser', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, adminpermition: adminpermition });				
							}
							if (username.length < 3) {
								var notification_arr = {
									'type': 'Error',
									'text_msg': 'Username must be greater than 2 letters'
								}
								res.render('edituser', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, adminpermition: adminpermition });				
							}
						}
						if(email)
						{
							var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
							var results = re.test(email);
							if(results == false)
							{
								var notification_arr = {
									'type': 'Error',
									'text_msg': 'Invalid email id'
								}
								res.render('edituser', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, adminpermition: adminpermition });				
							}
						}
						
						const post = await Users.findByIdAndUpdate({
							_id: req.params.postId
						}, req.body, {
							new: true,
							runValidators: true
						});
						req.flash('type', 'Success');
						req.flash('text_msg', 'Update successful');
						res.redirect("/users");				
					}
					else
					{
						var notification_arr = {
								'type': 'Error',
								'text_msg': 'ETH address are not valid'
							}
						res.render('edituser', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, adminpermition: adminpermition });				
					}					
				}
				else
				{
					var notification_arr = {
							'type': 'Error',
							'text_msg': 'All field are required'
						}
					res.render('edituser', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name, edituser_arr: edituser_arr, adminpermition: adminpermition });				
				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
	}	
})

/* Delete Schema responce */
router.delete('/removeuser/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Users.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'adminaccess'});
	}
})

/********************************** User Role Module *******************************************/
router.get('/userrole', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const role_list = await Usersrole.find({}).sort({"name": 0});
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('usersrole', {title: 'User Role', menuId: 'usersrole', msg: notification_arr, adminname: admin_name,  adminpermition: adminpermition, role_list: role_list});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'userrole'});
	}
});

/* get add user role */
router.get('/adduserrole', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('usersrole', {title: 'User Role', menuId: 'usersrole', msg: notification_arr, adminname: admin_name,  adminpermition: adminpermition});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'userrole'});
	}
});

/* Post add role  */
router.post('/adduserrole', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if (emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try {
				var name = req.body.name;
				if(name != '') {
					let userRoleDetails = new Usersrole({
						name : req.body.name,
						created_at : moment().format("ll"),
						status : true
			  		});
					await userRoleDetails.save();

					req.flash('type', 'Success');
					req.flash('text_msg', 'Role Created Successful');
					res.redirect('/userrole');	
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Role Name field is required'
					}
					res.render('usersrole', { title: 'User Role', menuId: 'usersrole', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition});
				}
			}
			catch(error) {
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'userrole'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'userrole'});
	}
});

/* edit role */
router.get("/edituserrole/:postID", async (req, res) => {
	var admin_name = req.session.admin_name;
	var emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const edit_role = await Usersrole.findOne({_id: req.params.postID});
			try {
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('editUserRole', { title: 'Edit User Role', menuId: 'usersrole', msg: notification_arr, adminname:admin_name, edit_role: edit_role, adminpermition: adminpermition });
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Warning',
					'text_msg': error
				}
				res.render('editUserRole', { title: 'Edit User Role', menuId: 'usersrole', msg: notification_arr, adminname:admin_name, edit_role: edit_role, adminpermition: adminpermition });
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'userrole'});
	}
});

router.post("/edituserrole/:postID", async (req, res) => {
	var admin_name = req.session.admin_name;
	var emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const edit_role = await Usersrole.findOne({_id: req.params.postID});
			try {
				var name = req.body.name;
				const post = await Usersrole.update({_id : req.params.postID},
					{$set : {name : name, status: req.body.status}
				});
				req.flash('type', 'Success');
				req.flash('text_msg', 'User role details update successful');
				res.redirect('/userrole');
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editUserRole', { title: 'Edit User Role', menuId: 'usersrole', msg: notification_arr, adminname:admin_name, edit_role: edit_role, adminpermition: adminpermition });
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'userrole'});	
	}
});

/* Delete Schema responce */
router.delete('/removeuserrole/:postId', async (req, res) => {
	var admin_name = req.session.admin_name;
	var emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{
			try {
				const post = await Usersrole.findByIdAndRemove({_id: req.params.postId}, function(err) {
					if(err){
						console.log(err);
						res.status.json({ err: err });
					}
					res.json({ success: true });
				});
			}
			catch(e)
			{
				res.send(500)
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'userrole'});
	}
});

/********************************** // End User Role Module *******************************************/

/* Rest API */
router.post("/valideth/:id", async (req, res) => {
	
	var valid = WAValidator.validate(req.params.id, 'ETH');
	if(valid)
		res.json({ success: true });
	else
		res.json({ success: false });
})

/***************************************************** Marketing **********************************************************/
/* Send email get */
router.get('/sendemail', async (req, res) => {	
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{		
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
	
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const useremail = await Users.find({}, {"email" :1, "_id" :0});
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('sendemail', { title: 'Email Manager', menuId: 'marketing', useremail_arr: useremail, msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'sendemail'});
	}
});

/* Send email post */
router.post('/sendemail', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			let toEmail   = req.body.email;
			let toSubject = req.body.subject;
			let toMessage = req.body.message;
					
			var notification_arr = {
				'type': 'Success',
				'text_msg': 'Email send successful'
			}
			const useremail = await Users.find({}, {"email" :1, "_id" :0});
			res.render('sendemail', { title: 'Email Manager', menuId: 'marketing', useremail_arr: useremail, msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'sendemail'});
	}
});

/* Email template */
router.get("/emailtemp", async (req, res) =>{
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			const template_result = await Emailtemplate.find({});
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('emailtemplate', { title: 'Email template', menuId: 'marketing', template_result: template_result, msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'emailtemp'});
	}
})

/* recipient lists */
router.get("/recipientlists", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			const recipient_lists = await Sendemail_list.find({});
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('recipientlists', { title: 'Recipient Lists', menuId: 'marketing', recipient_lists: recipient_lists, msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'recipientlists'});
	}
})

/* Create email */
router.get("/createemail", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		const usergroup_arr = await userGroupModel.find({});
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			const template_result = await Emailtemplate.find({});
			
			const useremail_arr = await Users.find({}).sort({"email" : 1});
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('createemail', { title: 'Recipient Lists', menuId: 'marketing', template_result: template_result, useremail_arr: useremail_arr, msg: notification_arr, adminname:admin_name, adminpermition: adminpermition, usergroup_arr: usergroup_arr });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'createemail'});
	}
})

/* update Groups_Email */
router.post("/updategroupsemail", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try
			{
				var updategroup = req.body.checked;
				const data_ = await userGroupModel.findOne({_id: req.body.id});
				var email_str = data_.email;
				
				if(updategroup == 1) {
					var id = req.body.id;
					
					email_str.push(req.body.email);
					const post = await userGroupModel.update({_id : req.body.id}, {$set : {email : email_str}})					
				}
				else {
					var email_ = req.body.email;
					var index = email_str.indexOf(email_);
					if (index > -1) {
						email_str.splice(index, 1);
					}	
					const post = await userGroupModel.update({_id : req.body.id}, {$set : {email : email_str}})
				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('users', { title: 'User Management', menuId: 'users', msg: notification_arr, adminname:admin_name });
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
	}
});

/* Search email */	
router.post("/searchemail/:id", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(admin_name)
	{
		var findemail = req.params.id;
		var resp = '';
		if(findemail == '')
		{
			const useremail_arr = await Users.find({}).sort({"email" : 1});
			if(result_arr.length > 0)
			{
				resp +='<option value="">--- Select email ---</option>';
				for(var i=0; i < result_arr.length; i++)
				{
					resp += '<option value="'+result_arr[i].email+'">'+result_arr[i].email+'</option>';
				}
			}
		}
		else
		{
			var result_arr = await Users.find({ 'email': new RegExp(findemail, 'i') }).sort({"email" : 1});
			if(result_arr.length > 0)
			{
				resp +='<option value="">--- Select email ---</option>';
				for(var i=0; i < result_arr.length; i++)
				{
					resp += '<option value="'+result_arr[i].email+'">'+result_arr[i].email+'</option>';
				}
			}			
		}
		res.json(resp);		
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'createemail'});
	}
})

/* Search email */	
router.post("/searchstring/:id", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(admin_name)
	{
		var findemail = req.params.id;
		var resp = '';
		if(findemail == '')
		{
			const useremail_arr = await Users.find({}).sort({"email" : 1});
			if(result_arr.length > 0)
			{
				resp +='<option value="">--- Select email ---</option>';
				for(var i=0; i < result_arr.length; i++)
				{
					resp += '<option value="'+result_arr[i].email+'">'+result_arr[i].email+'</option>';
				}
			}
		}
		else
		{
			var result_arr = await Users.find({'email': { '$regex': '(\s+'+findemail+'|^'+findemail+')', '$options': 'i' }}, {}).sort({"email" : 1});
			if(result_arr.length > 0)
			{
				resp +='<option value="">--- Select email ---</option>';
				for(var i=0; i < result_arr.length; i++)
				{
					resp += '<option value="'+result_arr[i].email+'">'+result_arr[i].email+'</option>';
				}
			}			
		}
		res.json(resp);		
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'recipientlists'});
	}
})

/* Post create email template */
router.post("/createemail", upload.single('temp_image'),async (req, res, next) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	const images = req.file;
	var temp_image = '';
	if(emailId)
	{
		try{						
			const post = new Sendemail_list();
			post.ip_address = ip.address();			
			post.user_id = req.body.email;			
			post.admin_id = req.session.admin_id;		
			post.subject = req.body.subject;			
			post.message = req.body.message;
			post.user_group = req.body.usergroup;				
			post.created_at = moment().format("ll"); 
			if(req.file)
			{
				post.image = images.filename;
				temp_image = '<img src="'+clientUrl+'/uploads/'+images.filename+'" width="100px" height="100px;">';
			}
			
			await post.save();
		
			var template_arr = await Emailtemplate.findOne({});
	
			await Emailtemplate.update(
				{ _id : template_arr._id},
				{ $set : {message : req.body.message}}
			);
			
			let toEmail   = req.body.email;
			let toSubject = req.body.subject;
			let textmsg   = req.body.message;
			
			ejs.renderFile(process.cwd() + "/views/evoaitemp.ejs", { message: textmsg, temp_image: temp_image }, function (err, data) {
				if (err) {
					console.log(err);
				} else {
					
					var mailOptions = {
						from: webEmail,
						to: toEmail,
						subject: toSubject,
						html: data
					};
					sgMail.sendMultiple(mailOptions);
				}
			});
			req.flash('type', 'Success');
			req.flash('text_msg', 'Emai send successful');
			res.redirect('/recipientlists');			
		}
		catch(error)
		{
			var notification_arr = {
				'type': 'Error',
				'text_msg': error
			}
			res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'createemail'});
		}				
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'createemail'});
	}
})

/* Delete Schema responce */
router.delete('/removerecipient/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Sendemail_list.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'recipientlists'});
	}
})

/******************************************************** Advertising **************************************************************/
/* View adverts list */
router.get("/advertising", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			const advertising_result = await Advertising.find({});
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('advertising', { title: 'Advertising', menuId: 'advertising', advertising_result: advertising_result, msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'advertising'});
	}
})

/* Create advertising */
router.get("/addadvertise", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('addadvertise', { title: 'Add Advertising', menuId: 'advertising', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'advertising'});
	}
})

/* Insert advertising */
router.post("/addadvertise", upload.single('image'),async (req, res, next) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	const images = req.file;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);	
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			try{						
				const post = new Advertising();
				post.ip_address = ip.address();			
				post.admin_id = req.session.admin_id;		
				post.url = req.body.url;			
				post.position = req.body.position;			
				post.status = true;			
				//var days = req.body.duration;			
				//var newDate = new Date(Date.now()+days*24*60*60*1000);
				post.duration = req.body.duration;
				post.created_at = moment().format("ll"); 
				post.updated_at = moment().format("ll"); 
				if(req.file)
				{
					if(req.body.url != '' && req.body.position != '' && req.body.duration != '')
					{
						post.image = images.filename;
						await post.save();
					}
					else
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'URL and position and duration'
						}
						res.render('addadvertise', { title: 'Add Advertising', menuId: 'advertising', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
					}					
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Upload image'
					}
					res.render('addadvertise', { title: 'Add Advertising', menuId: 'advertising', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
				}
				// req.flash('type', 'Success');
				// req.flash('text_msg', 'Details are stored successful');
				// res.redirect('/advertising');			
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'advertising'});
			}				
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'advertising'});
	}
})

/* Edit Advertising details */
router.get("/editadvertise/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			try{
				const edit_advertising = await Advertising.findOne({_id: req.params.postID});
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('editadvertise', { title: 'Edit Advertising', menuId: 'advertising', msg: notification_arr, adminname:admin_name, edit_advertising: edit_advertising, adminpermition: adminpermition });					
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Warning',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'advertising'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'advertising'});
	}
})

/* Update advertising details */
router.post("/editadvertise/:postID", upload.single('image'), async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	const images = req.file;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			try{
				const edit_advertising = await Advertising.findOne({_id: req.params.postID}, {"image":1});
				var active_image = '';
				var url = req.body.url;
				var position = req.body.position;
				var duration = req.body.duration;
				var status = req.body.status;
				var updated_at = new Date();
				if(req.file)
				{
					active_image = images.filename;
				}
				else
				{
					active_image = edit_advertising.image;				
				}
				const post = await Advertising.update(
					{ _id : req.params.postID},
					{ $set : {image: active_image, url: url, position: position, duration: duration, status: status, updated_at: updated_at}}
				);
				req.flash('type', 'Success');
				req.flash('text_msg', 'Update details are successful');
				res.redirect('/advertising');			
			}
			catch(error)
			{
				const edit_advertising = await Advertising.findOne({_id: req.params.postID});
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editadvertise', { title: 'Edit Advertising', menuId: 'advertising', msg: notification_arr, adminname:admin_name, edit_advertising: edit_advertising, adminpermition: adminpermition });					
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'advertising'});
	}
})

/* Delete Schema responce */
router.delete('/removeadvertise/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Advertising.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'advertising'});
	}
})

/**************************************************** Press releases ********************************************************/
/* View press releases list */
router.get("/press_releases", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			const press_releases_result = await Press_releases.find({});
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('press_releases', { title: 'Press Releases', menuId: 'marketing', press_releases: press_releases_result, msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'press_releases'});
	}
})

/* Create press releases */
router.get("/addpress_releases", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('addpress_releases', { title: 'Add Press releases', menuId: 'marketing', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'press_releases'});
	}
})

/* Insert press_releases */
router.post("/addpress_releases", upload.single('image'),async (req, res, next) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	const images = req.file;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			try{						
				const post = new Press_releases();	
				post.admin_id = req.session.admin_id;					
				post.title = req.body.title;
				post.text = req.body.text;
				post.link_one = req.body.link_one;
				post.link_two = req.body.link_two;
				post.link_three = req.body.link_three;
				post.start_datetime = req.body.start_datetime;
				post.created_at = moment().format("ll");
				post.updated_at = moment().format("ll");
				if(req.file)
				{
					if(images.filename != '' || req.body.title != '' && req.body.text != '' && req.body.start_datetime != '')
					{
						post.image = images.filename;
						await post.save();
					}
					else
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'link or text or title are require*'
						}
						res.render('addpress_releases', { title: 'Add Press releases', menuId: 'marketing', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
					}					
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'image is required'
					}
					res.render('addpress_releases', { title: 'Add Press releases', menuId: 'marketing', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
				}
				// req.flash('type', 'Success');
				// req.flash('text_msg', 'Details are stored successful');
				// res.redirect('/press_releases');			
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'press_releases'});
			}				
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'press_releases'});
	}
})


/* Edit Press releases details */
router.get("/editpress_releases/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			try{
				const editpress_releases_arr = await Press_releases.findOne({_id: req.params.postID});
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('editpress_releases', { title: 'Edit Press releases', menuId: 'marketing', msg: notification_arr, adminname:admin_name, editpress_releases_arr: editpress_releases_arr, adminpermition: adminpermition });					
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Warning',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'press_releases'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'press_releases'});
	}
})

/* Update press releases details */
router.post("/editpress_releases/:postID", upload.single('image'), async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	const images = req.file;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{			
			try{
				const edit_advertising = await Press_releases.findOne({_id: req.params.postID}, {"image":1});
				var active_image = '';
				var title = req.body.title;
				var text = req.body.text;
				var link_one = req.body.link_one;
				var link_two = req.body.link_two;
				var link_three = req.body.link_three;
				var status = req.body.status;
				var start_datetime = req.body.start_datetime;
				var updated_at = moment().format("ll");
				if(images)
				{
					active_image = images.filename;
				}
				else
				{
					active_image = edit_advertising.image;				
				}
				const post = await Press_releases.update(
					{ _id : req.params.postID},
					{ $set : {image: active_image, title: title, text: text, link_one: link_one, link_two: link_two, link_three: link_three, status: status, updated_at: updated_at}}
				);
				req.flash('type', 'Success');
				req.flash('text_msg', 'Update successful');
				res.redirect('/press_releases');			
			}
			catch(error)
			{
				const edit_advertising = await Press_releases.findOne({_id: req.params.postID});
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editpress_releases', { title: 'Edit Press releases', menuId: 'marketing', msg: notification_arr, adminname:admin_name, editpress_releases_arr: edit_advertising, adminpermition: adminpermition });					
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'press_releases'});
	}
})

/* Delete Schema responce */
router.delete('/removepress_releases/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Press_releases.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'press_releases'});
	}
})

/***************************************************** Support *****************************************************/
router.get("/support", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Support'))
		{			
			const support_result = await Support.aggregate([{
				$lookup: {
					from: "users",
					localField: "user_id",
					foreignField: "_id",
					as: "ordered_product"
				}			
			}]).sort({"updated_at": -1});
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('support', { title: 'Support', menuId: 'support', msg: notification_arr, adminname:admin_name, support_result: support_result, adminpermition: adminpermition });					
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'support'});
	}
})

/* Support chat system */
router.get("/supportchat/:postId", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Support'))
		{			
			const supportChat_list = await Support_chat.find({"ticket": req.params.postId}).sort({"updated_at": 1});
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('support_chat', { title: 'Support', menuId: 'support', msg: notification_arr, adminname:admin_name, supportChat_list: supportChat_list, adminpermition: adminpermition });					
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'support'});
	}
})

/* support Chat live */
router.get("/supportChat_live/:postId", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const supportChat_list = await Support_chat.find({"ticket": req.params.postId}).sort({"updated_at": 1});
		ejs.renderFile(process.cwd() + "/views/supportchat_live.ejs", {supportChat_list: supportChat_list }, function (err, data) {
		if (err) {
				console.log(err);
			} else {
				
				res.send(data);
			}
		});		
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'support'});
	}
})

/* Support Reply */
router.post("/supportreply/:postId", async (req, res) => {
	//console.log('=> Body : ',req.body)
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;

	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		var message = req.body.message;
		var ticket = req.body.ticket;
		var from_id = req.body.to_id;
		var to_id = 0;
		var updated_at = new Date().getTime();

		const supportpost = new Support_chat();
			supportpost.ticket = ticket;
			supportpost.to_id = to_id;
			supportpost.from_id = from_id;
			supportpost.message = message;
			supportpost.message_by = 'Admin';
			supportpost.status = false;
			supportpost.updated_at = new Date().getTime();
			supportpost.created_at = moment().format('lll');
			if(message != '' && ticket != '' && from_id != '' && updated_at != '')
			{
				await supportpost.save();				
			}
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
		const supportChat_list = await Support_chat.find({"ticket": req.params.postId}).sort({"updated_at": 1});
		res.render('support_chat', { title: 'Support', menuId: 'support', msg: notification_arr, adminname:admin_name, supportChat_list: supportChat_list, adminpermition: adminpermition });					
		/*
		ejs.renderFile(process.cwd() + "/views/supportchat_live.ejs", {supportChat_list: supportChat_list }, function (err, data) {
		if (err) {
				console.log(err);
			} else {
				
				res.send(data);
			}
		});		
		*/
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'support'});
	}
});


/* send With Email  Support Reply */
router.post("/sendwithemail/:postId", async (req, res) => {
	// console.log('==> call sendwithemail');
	// console.log('-> body : ', req.body);
	var admin_name = req.session.admin_name;
	var emailId = req.session.emailId;
	var ticket = req.body.ticket;
	if(emailId)
	{
		var textmsg = req.body.message;
		var from_id = req.body.to_id;
		// console.log('-> from_id :', from_id);

		const user = await Users.findOne({_id : from_id})
		// console.log('-> Email : ', user.email)
		if(user !='' || user == undefined) {
			ejs.renderFile(process.cwd() + "/views/evoaisupporttemp.ejs", { message: textmsg }, function (err, data) {
				if (err) {
					console.log(err);
				}
				else {
					var mailOptions = {
						from: webEmail,
						to: user.email,
						subject: 'Support Mail',
						html: data
					};
					sgMail.sendMultiple(mailOptions);
				}
			});
			const supportChat_list = await Support_chat.find({"ticket": req.params.postId}).sort({"updated_at": 1});
			ejs.renderFile(process.cwd() + "/views/supportchat_live.ejs", {supportChat_list: supportChat_list }, function (err, data) {
				res.redirect("/supportchat/"+ticket);
			});		
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'support'});
	}
});

/* ticketClose */
router.post("/ticketClose/:postId", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		var nowtime_ = new Date().getTime();
		const post_Support = await Support.update(
			{ _id : req.params.postId},
			{ $set : {status : true, updated_at: nowtime_}}
		);
		
		const post_Support_chat = await Support_chat.update(
			{ ticket : req.params.postId},
			{ $set : {status : true}},
			{ multi:true}
		);
		
		res.json({ success: true });
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'support'});
	}
})

/* Delete Schema responce */
router.delete('/removesupport/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Support.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'support'});
	}
})

/******************************************************	Blog module	************************************************/
/* List of blogs */
router.get("/blogs", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			const blog_result = await Blogs.find({}).sort({"updated_at": -1});
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('blogs', { title: 'Blog', menuId: 'blogs', msg: notification_arr, adminname:admin_name, blog_result: blog_result, adminpermition: adminpermition });					
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'blogs'});
	}
})

/* Add blog */
router.get("/addblog", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			const category_result = await Blog_category.find({"status": true}).sort({"name": 1});
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('addblog', { title: 'Add Blog', menuId: 'blogs', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'blogs'});
	}
})

/* Insert blog details */
router.post("/addblog", upload.single('feature_image'),async (req, res, next) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	const images = req.file;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			const category_result = await Blog_category.find({"status": true}).sort({"name": 1});
			try{						
				const post = new Blogs();
				post.author = req.session.admin_id;		
				post.title = req.body.title;			
				post.url_title = req.body.url_title;	
				post.status = req.body.status;	
				post.content = req.body.content;
				post.excerpt = req.body.excerpt;
				post.date_posted = moment().format("ll"); 
				post.created_at = moment().format("ll"); 
				post.updated_at = new Date().getTime();
				if(req.body.title != '' && req.body.url_title != '' && req.body.status != '' && req.body.content != '' && req.body.excerpt != '' )
				{
					var category_arr = req.body.category_name;
					if(category_arr.length > 0)
					{
						if(req.file)
						{
							post.feature_image = images.filename;
							await post.save();	
							var lastID = (post._id).toString();	
							if(lastID)
							{
								for(var ii = 0; ii < category_arr.length; ii++){
									const category_post = new Blog_to_category();
									category_post.blog_id = lastID;
									category_post.category_id = category_arr[ii];
									category_post.updated_at = new Date().getTime();
									await category_post.save();							
								}
								req.flash('type', 'Success');
								req.flash('text_msg', 'Blog details are stored successful');
								res.redirect('/blogs');		
							}
							else
							{
								var notification_arr = {
									'type': 'Error',
									'text_msg': 'Blogs details are not stored, please try again'
								}
								res.render('addblog', { title: 'Add blogs', menuId: 'blogs', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });
							}							
						}
						else
						{
							var notification_arr = {
								'type': 'Error',
								'text_msg': 'Image field is required'
							}
							res.render('addblog', { title: 'Add blogs', menuId: 'blogs', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });
						}
					}
					else
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Category field is required'
						}
						res.render('addblog', { title: 'Add blogs', menuId: 'blogs', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });
					}
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Fill all required field'
					}
					res.render('addblog', { title: 'Add blogs', menuId: 'blogs', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });
				}				
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'blogs'});
			}				
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'blogs'});
	}
})

/* Edit blog details */
router.get("/editblog/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			const edit_blogs = await Blogs.findOne({_id: req.params.postID});
			if(edit_blogs)
			{
				const selected_cate = await Blog_to_category.find({"blog_id": req.params.postID}, {"category_id": 1, "_id": 0});
				var selected_cat_arr = [];
				if(selected_cate)
				{
					for(var a=0; a < selected_cate.length; a++)
					{
						selected_cat_arr.push(selected_cate[a].category_id);
					}
				}
				const category_result = await Blog_category.find({"status": true}).sort({"name": 1});
				//res.send(category_result);
				try{
					var notification_arr = {
						'type': req.flash('type'),
						'text_msg': req.flash('text_msg')
					}
					res.render('editblog', { title: 'Edit blog', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_blogs: edit_blogs, selected_cat: selected_cat_arr, category_result: category_result, adminpermition: adminpermition });					
				}
				catch(error)
				{
					var notification_arr = {
						'type': 'Warning',
						'text_msg': error
					}
					res.render('editblog', { title: 'Edit blog', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_blogs: edit_blogs, selected_cat: selected_cat_arr, category_result: category_result, adminpermition: adminpermition });					
				}			
			}
			else{
				req.flash('type', 'Error');
				req.flash('text_msg', 'Blog details are not found');
				res.redirect('/blogs');		
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'blogs'});
	}
})

/* Update blog details */
router.post("/editblog/:postID", upload.single('feature_image'),async (req, res, next) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	const images = req.file;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			const edit_blogs = await Blogs.findOne({_id: req.params.postID});
			const selected_cat = await Blog_to_category.find({"blog_id": req.params.postID}, {"category_id": 1, "_id": 0});
			var selected_cat_arr = [];
			if(selected_cat)
			{
				for(var a=0; a < selected_cat.length; a++)
				{
					selected_cat_arr.push(selected_cat[a].category_id);
				}
			}
			const category_result = await Blog_category.find({"status": true}).sort({"name": 1});
			try{					
				var author = req.session.admin_id;		
				var title = req.body.title;			
				var url_title = req.body.url_title;	
				var status = req.body.status;	
				var content = req.body.content;
				var excerpt = req.body.excerpt;
				var updated_at = new Date().getTime();
				if(req.body.title != '' && req.body.url_title != '' && req.body.status != '' && req.body.content != '' && req.body.excerpt != '' )
				{
					var feature_image = images.filename;
					var category_arr = req.body.category_name;
					if(category_arr.length > 0)
					{
						if(req.file)
						{
							const post = await Blogs.update(
								{ _id : req.params.postID},
								{ $set : {author: author, feature_image: feature_image, title: title, url_title: url_title, status: status, content: content, excerpt: excerpt, updated_at: updated_at}}
							);
							
							if(req.params.postID)
							{
								await Blog_to_category.deleteMany({
									blog_id: req.params.postID						
								});						
								
								for(var ii = 0; ii < category_arr.length; ii++){
									const category_post = new Blog_to_category();
									category_post.blog_id = req.params.postID;
									category_post.category_id = category_arr[ii];
									category_post.updated_at = new Date().getTime();
									await category_post.save();							
								}
								req.flash('type', 'Success');
								req.flash('text_msg', 'Blog details are update successful');
								res.redirect('/blogs');		
							}
							else
							{												
								var notification_arr = {
									'type': 'Error',
									'text_msg': 'Blogs details are not update, please try again'
								}
								res.render('editblog', { title: 'Edit blog', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_blogs: edit_blogs, selected_cat: selected_cat_arr, category_result: category_result, adminpermition: adminpermition });					
							}							
						}
						else
						{												
							var notification_arr = {
								'type': 'Error',
								'text_msg': 'Image field is require*'
							}
							res.render('editblog', { title: 'Edit blog', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_blogs: edit_blogs, selected_cat: selected_cat_arr, category_result: category_result, adminpermition: adminpermition });					
						}							
					}
					else
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Category field is required'
						}
						res.render('editblog', { title: 'Edit blog', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_blogs: edit_blogs, selected_cat: selected_cat_arr, category_result: category_result, adminpermition: adminpermition });					
					}
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Fill all required field'
					}
					res.render('editblog', { title: 'Edit blog', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_blogs: edit_blogs, selected_cat: selected_cat_arr, category_result: category_result, adminpermition: adminpermition });	
				}				
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editblog', { title: 'Edit blog', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_blogs: edit_blogs, selected_cat: selected_cat_arr, category_result: category_result, adminpermition: adminpermition });	
			}				
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'blogs'});
	}
})

/* Delete Schema responce */
router.delete('/removeblog/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Blogs.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'category' });
	}
})
/*****************************************************	Banner list	*********************************************/
/* Banner details */
router.get("/banner", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const banner_result = await Banner.find({}).sort({"updated_at": -1});	
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('banner', { title: 'Banner', menuId: 'banner', msg: notification_arr, adminname:admin_name, banner_result: banner_result, adminpermition: adminpermition });					
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'banner'});
	}
})

/* Create Banner */
router.get("/addbanner", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('addbanner', { title: 'Add Banner', menuId: 'banner', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'addbanner'});
	}
})

/* addbanner details */
router.post("/addbanner", upload.single('image'),async (req, res, next) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	const images = req.file;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{						
				const post = new Banner();	
				if(!req.file)
				{
					req.flash('type', 'Error');
					req.flash('text_msg', 'Banner image is require');
				}
				else
				{
					if(images.filename != '')
					{
						post.image = images.filename;
						post.updated_at = new Date().getTime();
						await post.save();
					}
					else
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Upload image'
						}
						res.render('banner', { title: 'Add Banner', menuId: 'banner', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
					}					
					req.flash('type', 'Success');
					req.flash('text_msg', 'Details are stored successful');
				}
				res.redirect('/banner');			
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'banner'});
			}				
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'banner'});
	}
})

/* Edit banner details */
router.get("/editbanner/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{
				const edit_banner = await Banner.findOne({_id: req.params.postID});
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('editbanner', { title: 'Edit Banner', menuId: 'banner', msg: notification_arr, adminname:admin_name, edit_banner: edit_banner, adminpermition: adminpermition });					
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Warning',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'banner'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'banner'});
	}
})

/* Update banner details */
router.post("/editbanner/:postID", upload.single('image'), async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	const images = req.file;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{
				const edit_banner = await Banner.findOne({_id: req.params.postID}, {"image":1});
				var active_image = '';
				var status = req.body.status;
				var updated_at = new Date().getTime();
				if(req.file)
				{
					active_image = images.filename;
				}
				else
				{
					active_image = edit_banner.image;				
				}
				const post = await Banner.update(
					{ _id : req.params.postID},
					{ $set : {image: active_image, status: status, updated_at: updated_at}}
				);
				req.flash('type', 'Success');
				req.flash('text_msg', 'Update details are successful');
				res.redirect('/banner');			
			}
			catch(error)
			{
				const edit_banner = await Banner.findOne({_id: req.params.postID});
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editbanner', { title: 'Edit Banner', menuId: 'banner', msg: notification_arr, adminname:admin_name, edit_banner: edit_banner, adminpermition: adminpermition });					
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'banner'});
	}
})

/* Delete Schema responce */
router.delete('/removebanner/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Banner.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'banner' });
	}
})

/***********************************************	Category details	************************************************/
/* Category details */
router.get("/category", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			const category_result = await Blog_category.find({}).sort({"updated_at": -1});	
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('category', { title: 'Category', menuId: 'blogs', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });					
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'category'});
	}
})

/* Create category */
router.get("/addcategory", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('addcategory', { title: 'Add Category', menuId: 'blogs', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'addcategory'});
	}
})

/* post addcategory details */
router.post("/addcategory", async (req, res, next) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			try{						
				const cat_post = new Blog_category();
				var catname = req.body.catname;
				var url_name = req.body.url_name;
				var description = req.body.description;
				var status = true;
				var updated_at = new Date().getTime();
				if(catname != '' && url_name != '' && description != '' )
				{
					cat_post.name = catname;
					cat_post.url_name = url_name;
					cat_post.status = status;
					cat_post.description = description;
					cat_post.updated_at = updated_at;
					await cat_post.save();
					
					req.flash('type', 'Success');
					req.flash('text_msg', 'Category details are stored successful');
					res.redirect('/category');			
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Name field is required'
					}
					res.render('addcategory', { title: 'Add Category', menuId: 'blogs', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('addcategory', { title: 'Add Category', menuId: 'blogs', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
			}				
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'addcategory'});
	}
})

/* Edit category details */
router.get("/editcategory/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			const edit_category = await Blog_category.findOne({_id: req.params.postID});
			try{
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('editcategory', { title: 'Edit Category', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_category: edit_category, adminpermition: adminpermition });					
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Warning',
					'text_msg': error
				}
				res.render('editcategory', { title: 'Edit Category', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_category: edit_category, adminpermition: adminpermition });					
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'category'});
	}
})

/* Update category details */
router.post("/editcategory/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Blogger'))
		{			
			const edit_category = await Blog_category.findOne({_id: req.params.postID});
			try{
				var name = req.body.name;
				var url_name = req.body.url_name;
				var description = req.body.description;
				var status = req.body.status;
				var updated_at = new Date().getTime();
				
				await Blog_category.update(
					{ _id : req.params.postID},
					{ $set : {name: name, url_name: url_name, description: description, status: status, updated_at: updated_at}}
				);
				req.flash('type', 'Success');
				req.flash('text_msg', 'Category details update successful');
				res.redirect('/category');			
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editcategory', { title: 'Edit Category', menuId: 'blogs', msg: notification_arr, adminname:admin_name, edit_category: edit_category, adminpermition: adminpermition });					
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'category'});
	}
})

/* Delete Schema responce */
router.delete('/removecategory/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Blog_category.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'category' });
	}
})

/***********************************************************	Announcement category	****************************************************/
/* Category details */
router.get("/announ_category", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const category_result = await Announcement_category.find({}).sort({"name": 1});	
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('announ_category', { title: 'Category', menuId: 'announcement', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });					
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'announ_category'});
	}
})

/* Create category */
router.get("/addannounccategory", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('addannounccategory', { title: 'Add Category', menuId: 'announcement', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'addannounccategory'});
	}
})

/* post addannounccategory details */
router.post("/addannounccategory", async (req, res, next) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{						
				const post = new Announcement_category();
				var name = req.body.name;
				var status = true;
				var created_at = moment().format("ll"); 
				if(name != '')
				{
					post.name = name;
					post.status = status;
					post.created_at = created_at;
					await post.save();
					
					req.flash('type', 'Success');
					req.flash('text_msg', 'Category details are stored successful');
					res.redirect('/announ_category');			
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Name field is required'
					}
					res.render('addannounccategory', { title: 'Add Category', menuId: 'announcement', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('addannounccategory', { title: 'Add Category', menuId: 'announcement', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });
			}				
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'addannounccategory'});
	}
})

/* Edit category details */
router.get("/editannounccategory/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const edit_category = await Announcement_category.findOne({_id: req.params.postID});
			try{
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('editannounccategory', { title: 'Edit Category', menuId: 'announcement', msg: notification_arr, adminname:admin_name, edit_category: edit_category, adminpermition: adminpermition });					
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Warning',
					'text_msg': error
				}
				res.render('editannounccategory', { title: 'Edit Category', menuId: 'announcement', msg: notification_arr, adminname:admin_name, edit_category: edit_category, adminpermition: adminpermition });					
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'announ_category'});
	}
})

/* Update category details */
router.post("/editannounccategory/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const edit_category = await Announcement_category.findOne({_id: req.params.postID});
			try{
				var name = req.body.name;
				var status = req.body.status;
				
				const post = await Announcement_category.update(
					{ _id : req.params.postID},
					{ $set : {name: name, status: status}}
				);
				req.flash('type', 'Success');
				req.flash('text_msg', 'Category details update successful');
				res.redirect('/announ_category');			
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editannounccategory', { title: 'Edit Category', menuId: 'announcement', msg: notification_arr, adminname:admin_name, edit_category: edit_category, adminpermition: adminpermition });					
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'announ_category'});
	}
})

/* Delete Schema responce */
router.delete('/removeannounccategory/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Announcement_category.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'announ_category' });
	}
})

/***********************	Announcements 	****************/
/* Announcement details */
router.get("/announcement", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const announcement_result = await Announcement.find({}).sort({"name": 1});	
			var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('announcement', { title: 'Announcement', menuId: 'announcement', msg: notification_arr, adminname:admin_name, announcement_result: announcement_result, adminpermition: adminpermition });					
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'announcement'});
	}
})

/* Create announcement */
router.get("/addannouncement", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const category_result = await Announcement_category.find({"status": true}).sort({"name": 1});	
			var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
			res.render('addannouncement', { title: 'Add Announcement', menuId: 'announcement', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'addannouncement'});
	}
})

/* post addannouncement details */
router.post("/addannouncement", async (req, res, next) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const category_result = await Announcement_category.find({"status": true}).sort({"name": 1});	
			try{						
				const post = new Announcement();
				var title = req.body.title;
				var description = req.body.description;
				var category = req.body.category;
				var start_date = req.body.start_date;
				var end_date = req.body.end_date;
				var status = true;
				var created_at = moment().format("ll"); 
				var updated_at = new Date().getTime();
				if(title != '' && description !='' && category !='' && start_date !='' && end_date !='' )
				{
					post.title = title;
					post.description = description;
					post.category = category;
					post.start_date = start_date;
					post.end_date = end_date;
					post.status = status;
					post.created_at = created_at;
					post.updated_at = updated_at;
					await post.save();
					
					req.flash('type', 'Success');
					req.flash('text_msg', 'Announcement details are stored successful');
					res.redirect('/announcement');			
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'All field is required'
					}
					res.render('addannouncement', { title: 'Add Announcement', menuId: 'announcement', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });
				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('addannouncement', { title: 'Add Announcement', menuId: 'announcement', msg: notification_arr, adminname:admin_name, category_result: category_result, adminpermition: adminpermition });
			}				
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'addannouncement'});
	}
})

/* Edit announcement details */
router.get("/editannouncement/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const category_result = await Announcement_category.find({"status": true}).sort({"name": 1});	
			const edit_announcement = await Announcement.findOne({_id: req.params.postID});
			try{
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('editannouncement', { title: 'Edit Announcement', menuId: 'announcement', msg: notification_arr, adminname:admin_name, edit_announcement: edit_announcement, category_result: category_result, adminpermition: adminpermition });					
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Warning',
					'text_msg': error
				}
				res.render('editannouncement', { title: 'Edit Announcement', menuId: 'announcement', msg: notification_arr, adminname:admin_name, edit_announcement: edit_announcement, category_result: category_result, adminpermition: adminpermition });					
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'announcement'});
	}
})

/* Update announcement details */
router.post("/editannouncement/:postID", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			const category_result = await Announcement_category.find({"status": true}).sort({"name": 1});	
			const edit_announcement = await Announcement.findOne({_id: req.params.postID});
			try{
				var title = req.body.title;
				var description = req.body.description;
				var category = req.body.category;
				var start_date = req.body.start_date;
				var end_date = req.body.end_date;
				var status = req.body.status;
				var updated_at = new Date().getTime();
				if(title != '' && description !='' && category !='' && start_date !='' && end_date !='' )
				{
					const post = await Announcement.update(
						{ _id : req.params.postID},
						{ $set : {title: title, description: description, category: category, start_date: start_date, end_date: end_date, status: status, updated_at: updated_at}}
					);
					req.flash('type', 'Success');
					req.flash('text_msg', 'Announcement details update successful');
					res.redirect('/announcement');			
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Required all fields'
					}
					res.render('editannouncement', { title: 'Edit Announcement', menuId: 'announcement', msg: notification_arr, adminname:admin_name, edit_announcement: edit_announcement, category_result: category_result, adminpermition: adminpermition });					
				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editannouncement', { title: 'Edit Announcement', menuId: 'announcement', msg: notification_arr, adminname:admin_name, edit_announcement: edit_announcement, category_result: category_result, adminpermition: adminpermition });					
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'announcement'});
	}
})

/* Delete Schema responce */
router.delete('/removeannouncement/:postId', async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{
		try{
			const post = await Announcement.findByIdAndRemove({
				_id: req.params.postId
			},function(err){
				if(err){
					console.log(err);
					res.status.json({ err: err });
				}
				res.json({ success: true });
			});
		}
		catch(e)
		{
			res.send(500)
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'announcement' });
	}
})

/************************************************	Traders and infulienced with it's Chanel	************************************/
/* get traders_category function */
router.get('/traders_category', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if (emailId) 
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const tradCategory = await Traders_categoryModel.find({}).sort({"updated_at": -1});
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('traders_category', {title: 'Traders Category', menuId: 'traders', msg: notification_arr, adminname: admin_name, tradCategory:tradCategory, adminpermition: adminpermition});
		}
		else 
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
    } 
	else 
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
    	res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_category'});	
	}
});

/*Get  Add_Traders_Category Controller */
router.get('/add_traders_category', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
  	if(emailId) 
  	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('add_traders_category', {title:'Add Traders Category',  menuId:'traders', msg: notification_arr, adminname: admin_name, adminpermition: adminpermition});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
  	else 
  	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_category'});	
  	}
});


/*Post  Add_Traders_Category Controller */
router.post('/add_traders_category', upload.single('icon'), async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	const icons = req.file;
	const category =req.body.catname
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try
			{
				if(!req.file)
				{
					req.flash('type', 'Error');
					req.flash('text_msg', 'Icon are not selected');
				}
				else
				{
					if(icons != '' && category != '')
					{
						let categoryDetails = new Traders_categoryModel({
							icon : icons.filename,
							name : category,
							status : true,
							created_at : moment().format("ll"),
							updated_at : new Date().getTime(),
						})
						await categoryDetails.save();

						req.flash('type', 'Success');
						req.flash('text_msg', 'Traders Category details are stored successful');
						res.redirect('/traders_category');
					}
					else 
					{
						var notification_arr = {
							'type': 'Error',
							'text_msg': 'Both field is required'
						}
						res.render('add_traders_category', { title: 'Add Traders Category', menuId: 'traders', msg: notification_arr, adminname:admin_name});
					}
				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_category'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_category'});
	}
});

/* Get editTradersCategory controller Using ID */
router.get('/editTradersCategory/:postId', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const update_icon = await Traders_categoryModel.findOne({_id: req.params.postId});
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('edit_traders_category', {title: 'Traders Category', menuId: 'traders', msg: notification_arr, adminname: admin_name, update_icon:update_icon, adminpermition: adminpermition});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	} 
  	else 
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_category'});
	}
});

/*POST editTradersCategory controller Using ID */
router.post('/editTradersCategory/:postId', upload.single('icon'), async (req, res) => {
	let emailId = req.session.emailId;
  	let admin_name = req.session.admin_name;
  	const updatedIcon = req.file;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try
			{
				var active_icon = '';
				var status = req.body.status;
				var name = req.body.catname;
				var updated_at = new Date().getTime();
				if(updatedIcon!="" && updatedIcon!=null)
				{
				  	let active_icon = updatedIcon.filename;
					try
					{
						const post = await Traders_categoryModel.update({_id : req.params.postId}, 
						{ $set : { icon: active_icon, name: name, status: status, updated_at: updated_at }
						})
						req.flash('type', 'Success');
						req.flash('text_msg', 'Update details are successful');
						res.redirect('/traders_category');
					}
					catch(error)
					{
						var notification_arr = {
						'type': 'Error',
						'text_msg': error
						}
						res.render('edit_traders_category', { title: 'Edit Traders Category', menuId: 'traders', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition});
					} 
				}
				else 
				{
				  try {
						const post = await Traders_categoryModel.update({_id : req.params.postId},
						{ $set : { name: name, status: status, updated_at: updated_at }
						})
						req.flash('type', 'Success');
						req.flash('text_msg', 'Update details are successful');
						res.redirect('/traders_category');
				  	}
					catch (error) {
						var notification_arr = {
						'type': 'Error',
						'text_msg': error
						}
						res.render('edit_traders_category', { title: 'Edit Traders Category', menuId: 'traders', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition});
					}
				}
			}
			catch(error) {
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('edit_traders_category', { title: 'Edit Traders Category', menuId: 'traders', msg: notification_arr, adminname:admin_name });
			}
			
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	} 
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_category'});
	}
});


/* removeTradersCategory controller Using ID */
router.delete('/removeTradersCategory/:postId', async (req, res) => {
	let emailId = req.session.emailId;
  	let admin_name = req.session.admin_name;
  	if(emailId) 
  	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try {
				let deleteCategory = await Traders_categoryModel.findByIdAndRemove({_id: req.params.postId}, function(err) {
					if(err) {
						console.log(err);
						res.status.json({ err: err });
					}
					return res.json({ success: true });
				});
			}
			catch(error) {
				res.send(500)
			}
		}
		else 
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
  	else 
  	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_category'});
	}
});

// Get traders_channel Function
router.get('/traders_channel', async (req, res) => {
	let emailId = req.session.emailId;
  	let admin_name = req.session.admin_name;
  	if(emailId)
  	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			let channelDetails = await ChannelModel.find({}).sort({"updated_at": -1});
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('traders_channel', {title: 'Traders Channel', menuId: 'traders', msg: notification_arr, adminname: admin_name, channelDetails:channelDetails, adminpermition: adminpermition});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
  	else
  	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_channel'});	
  	}
});

/*Get Add_Channel Function */
router.get('/addchannel', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
  	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			let category = await Traders_categoryModel.find({});
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('addchannel', {title:'Add Channel',  menuId:'traders', msg: notification_arr, adminname: admin_name, category:category, adminpermition: adminpermition});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
   	}
  	else
	{
		var notification_arr = {
		'type': 'Warning',
		'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_channel'});
	}					
});

/*Post Add_Channel Function */
router.post('/addchannel', async(req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	let str =  req.body.categoryname;

	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try
			{
				var rank = req.body.rank;
				var gems = req.body.gems;
				var trust = req.body.trust;
				var bricks = req.body.bricks;
				var rating = req.body.rating;
				var channel_id = req.body.channel_Id;
				var youtube_id = req.body.youtube_id;
				var thumbnails = req.body.thumbnails;
				var subscriber = req.body.subscriber;
				var category = req.body.categoryname;
				var channelname = req.body.channelname;
				var channel_url = req.body.channel_url;
				var description = req.body.description;
				var rating_review = req.body.rating_review;
				
				if(channelname !='' && rank != '' && rating_review !='' && thumbnails != '' && subscriber != '' && gems != '' && bricks != '' && rating != '' && trust != '')
				{
					let channel_name = await ChannelModel.findOne({channel_name: req.body.channelname});
					if(channel_name==null || channel_name == undefined) {
						let channelDetails = new ChannelModel({
							rank : rank,
							gems : gems,
							trust : trust,
							status : true,
							bricks : bricks,
							rating : rating,
							channel_id :channel_id,
							youtube_id : youtube_id,
							thumbnails : thumbnails,
							subscriber : subscriber,
							description : description,
							channel_name : channelname,
							channel_url : channel_url,
							rating_review: rating_review,
							category : 	str.replace(' ', '_'),
							created_at : moment().format("ll"),
							updated_at : new Date().getTime(),
						})
						await channelDetails.save();

						let videoStatusDetails = new videoStatusModel({channel_id: req.body.channel_Id, youtube_id: req.body.youtube_id, status : true})
						await videoStatusDetails.save();

						req.flash('type', 'Success');
						req.flash('text_msg', 'Channel details are stored successful');
						res.redirect('/traders_channel');
					}
					else {
						const post = await ChannelModel.update({_id : channel_name._id},
							{ $set : {channelname: channelname, channel_id: channel_id, channel_url: channel_url, rating_review: rating_review, description : description, youtube_id: youtube_id, thumbnails: thumbnails, subscriber : subscriber, rank: rank, bricks: bricks, rating: rating, gems: gems, trust: trust, category: category}
						})
						
						let videoStatus = await videoStatusModel.findOne({channel_id: channel_id});
						const StatusDetaile = await videoStatusModel.update({_id: videoStatus._id},
							{ $set : {channel_id: req.body.channel_Id, youtube_id: youtube_id, status : true}
						})
						req.flash('type', 'Success');
						req.flash('text_msg', 'Update details are successful');
						res.redirect('/traders_channel');
					}
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'all fields are required'
					}
					res.render('addchannel', { title: 'Add Channel', menuId: 'traders', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition, category:category});
				}
			}
			catch (error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_channel'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_channel'});
	}
});

/* Edit channel details */
router.get('/editchannel/:postId', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
  	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const updateChannelDetail = await ChannelModel.findOne({_id: req.params.postId});
			let category = await Traders_categoryModel.find({});
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('editchannel', {title: 'Edit Channel', menuId: 'traders', msg: notification_arr, adminname: admin_name, updateChannelDetail:updateChannelDetail, category:category, adminpermition: adminpermition});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_channel'});
	}
});

/* Update Channel details */
router.post('/editchannel/:postId', async (req, res) => {
	let admin_name = req.session.admin_name;
	let emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try
			{
				let rank = req.body.rank;
				let gems = req.body.gems;
				let trust = req.body.trust;
				let bricks = req.body.bricks;
				let rating = req.body.rating;
				let category = req.body.categoryname;
				let thumbnails = req.body.thumbnails;
				let subscriber = req.body.subscriber;
				let description = req.body.description;
				let channel_name = req.body.channelname;
				let channel_url = req.body.channel_url;
				let rating_review = req.body.rating_review;
				let status = req.body.status;
				let updated_at = new Date().getTime();
				const post = await ChannelModel.update({_id : req.params.postId},
					{ $set : { channel_name: channel_name, rating_review: rating_review, channel_url: channel_url, thumbnails: thumbnails, subscriber: subscriber, rank: rank, bricks: bricks, rating: rating, gems: gems, trust: trust, category: category, description: description,  status: status, updated_at: updated_at} 
				})
				req.flash('type', 'Success');
				req.flash('text_msg', 'Update details are successful');
				res.redirect('/traders_channel');
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editchannel', { title: 'Edit Channel', menuId: 'traders', msg: notification_arr, adminname:admin_name });
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else {
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
    	res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_channel'});
	}
});

/* removeChannel controller Using ID */
router.delete('/removechannel/:postId', async (req, res) => {
	let emailId = req.session.emailId;
  	let admin_name = req.session.admin_name;
  	if(emailId)
  	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try
			{
				let deleteChannel = await ChannelModel.findByIdAndRemove({_id: req.params.postId}, function(err) {
				if(err) {
					console.log(err);
					res.status.json({ err: err });
				}
				return res.json({ success: true });
				});
			}
			catch(error){
				res.send(500)
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
  	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'traders_channel'});
	}
});

/************************************************ // End Traders and infulienced with it's Chanel	************************************/


/* 2019_09_30 Shailendra */
/******* Evabot Module **********************************************************************************************/

/* get evabot controller */
router.get('/evabot', async (req, res) => {
	let emailId    = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Evabot'))
		{
			request.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD', function(err, response, body) {
				if(!err && response.statusCode == 200) {
					var locals = JSON.parse(body);
					var notification_arr = {
						'type' : req.flash('type'),
						'text_msg': req.flash('text_msg')
					}
					res.render('evabot', {title:'Add White Lists',  menuId:'evabot', msg: notification_arr, adminname: admin_name, ethereumUSDPrice: locals.USD, adminpermition: adminpermition});
				}
			})
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login',{ title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'evabot'})
	}
});

/**************************************************//***********************************************************/
/********************************** User Groups Module *******************************************/
router.get('/user_groups', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const group_result = await userGroupModel.find({}).sort({"group_name": 1});
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('userGroups', {title: 'User Groups', menuId: 'userGroups', msg: notification_arr, adminname: admin_name,  adminpermition: adminpermition, group_result: group_result});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'user_groups'});
	}
});

/* get add_group */
router.get('/addgroup', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('userGroups', {title: 'User Groups', menuId: 'userGroups', msg: notification_arr, adminname: admin_name,  adminpermition: adminpermition});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'user_groups'});
	}
});

/* Post add_group  */
router.post('/addgroup', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if (emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try {
				var groupname = req.body.groupname;
				if(groupname != '') {
					let userGroupDetails = new userGroupModel({
						group_name : req.body.groupname,
						created_at : moment().format("ll"),
						updated_at : new Date().getTime(),
						status : true
			  		});
					await userGroupDetails.save();

					req.flash('type', 'Success');
					req.flash('text_msg', 'Group Create Successful');
					res.redirect('/user_groups');	
				}
				else
				{
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Group Name field is required'
					}
					res.render('userGroups', { title: 'User Groups', menuId: 'userGroups', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition});
				}
			}
			catch(error) {
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'user_groups'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'user_groups'});
	}
});

/* edit_group */
router.get("/editgroup/:postID", async (req, res) => {
	var admin_name = req.session.admin_name;
	var emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const edit_group = await userGroupModel.findOne({_id: req.params.postID});
			try {
				var notification_arr = {
					'type': req.flash('type'),
					'text_msg': req.flash('text_msg')
				}
				res.render('editUserGroups', { title: 'Edit User Groups', menuId: 'userGroups', msg: notification_arr, adminname:admin_name, edit_group: edit_group, adminpermition: adminpermition });
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Warning',
					'text_msg': error
				}
				res.render('editUserGroups', { title: 'Edit User Groups', menuId: 'userGroups', msg: notification_arr, adminname:admin_name, edit_group: edit_group, adminpermition: adminpermition });
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'user_groups'});
	}
});

router.post("/editgroup/:postID", async (req, res) => {
	var admin_name = req.session.admin_name;
	var emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const edit_group = await userGroupModel.findOne({_id: req.params.postID});
			try {
				var groupname = req.body.groupname;
				const post = await userGroupModel.update({_id : req.params.postID},
					{$set : {group_name : groupname}
				});
				req.flash('type', 'Success');
				req.flash('text_msg', 'User Group details update successful');
				res.redirect('/user_groups');
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('editUserGroups', { title: 'Edit User Groups', menuId: 'userGroups', msg: notification_arr, adminname:admin_name, edit_group: edit_group, adminpermition: adminpermition });
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'user_groups'});	
	}
});

/* Delete Schema responce */
router.delete('/removeusergroup/:postId', async (req, res) => {
	var admin_name = req.session.admin_name;
	var emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try {
				const post = await userGroupModel.findByIdAndRemove({_id: req.params.postId}, function(err) {
					if(err){
						console.log(err);
						res.status.json({ err: err });
					}
					res.json({ success: true });
				});
			}
			catch(e)
			{
				res.send(500)
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'user_groups'});
	}
});


var request = require('request');
/* Get white_lists controller */
router.get('/addwhitelist', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Evabot'))
		{
			request.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR', function(err, response, body) {
				if(!err && response.statusCode == 200) {
					var locals = JSON.parse(body);
					var notification_arr = {
						'type' : req.flash('type'),
						'text_msg': req.flash('text_msg')
					}
					res.render('evabot', {title:'Add White Lists',  menuId:'evabot', msg: notification_arr, adminname: admin_name, ethereumUSDPrice: locals.USD, adminpermition: adminpermition});
				}
			})
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login',{ title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'evabot'})
	}
});

router.post('/addwhitelist', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Evabot'))
		{
			var address = req.body.address
			if(!address) {
				var notification_arr = {
					'type': 'Error',
					'text_msg': 'Enter Wallet Address'
				}
				res.render('evabot', { title: 'Add White Lists', menuId: 'evabot', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition});
			}
			else
			{
				let whiteListDetails = new whiteListModel({
					status : true,
					address : address,
					created_at : moment().format("ll"),
					updated_at : new Date().getTime(),
				})
				await whiteListDetails.save();
				req.flash('type', 'Success');
				req.flash('text_msg', 'Register white lists successful');
				res.redirect('/evabot');
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login',{ title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'evabot'})
	}
});

// calculate profile function
router.post('/savetoDB', async (req, res) => {
	let emailId = req.session.emailId;
	let admin_name = req.session.admin_name;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Evabot'))
		{
			var ether_amount = req.body.ether_amount
			var total_invested_ether_bot = req.body.total_invested_ether_bot
			var evot_amount = req.body.evot_amount
			var total_invested_evot_bot = req.body.total_invested_evot_bot
			if(ether_amount == '' && total_invested_ether_bot == '' && evot_amount == '' && total_invested_evot_bot == '')
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': 'Fill are all required field*'
				}
				res.render('evabot', { title: 'Add White Lists', menuId: 'evabot', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition});
			}
			else
			{
				let ethereum_usd_price = req.body.ethereum_usd_price;
				let evot_usd_price = req.body.evot_usd_price;
				let eth_daily_profit = (ether_amount * ethereum_usd_price) / (total_invested_ether_bot * evot_usd_price);
				let evot_daily_profit = evot_amount / total_invested_evot_bot;
				let profit_on_graph = eth_daily_profit + evot_daily_profit;
				
				let profitDetails = new profitModel({
					ether_amount : ether_amount,
					total_invested_ether_bot : total_invested_ether_bot,
					evot_amount : evot_amount,
					total_invested_evot_bot : total_invested_evot_bot,
					ethereum_usd_price : ethereum_usd_price,
					evot_usd_price : evot_usd_price,
					eth_daily_profit : eth_daily_profit,
					evot_daily_profit : evot_daily_profit,
					profit_on_graph : profit_on_graph,
					status : true,
					created_at : moment().format("ll"),
					updated_at : new Date().getTime(),
				})
				await profitDetails.save();
				req.flash('type', 'Success');
				req.flash('text_msg', 'profit detail save successful');
				res.redirect('/evabot');
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login',{ title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'evabot'})
	}
});


router.post('/checkIfAllowedMe', async (req, res) => {
	// WhiteList.findOne({}, null, {sort: {date: -1}}, function(err, docs) { console.log(docs) });
	const {address} = req.body;
	whiteListModel.findOne({ address: address.toLowerCase()}).then(user => {
        if(user) {
            res.end('yes');
        } else {
            res.end('no');
        }
    });
});

// this will be used to get the proft to display on the graph from the client
router.post('/getProfit', async (req, res) => {
    // Profit.find({}, null, {sort: {date: -1}}, (err, docs) => { 
		profitModel.find({}, null, (err, result) => { 
        res.json(result);
    });
});

// this will be used to get the daily percentage for each bots
router.post('/getPercentage', async (req, res) => {
    profitModel.findOne({}, null, {sort: {date: -1}}, (err, docs) => { 
        res.json(docs);
    });
});

//count whitelist users
router.get('/countUsers', (req, res) => {
    whiteListModel.countDocuments(async function(err, c) {
		console.log('Count is :' + c);
        res.json(c);
    });
});

/**********************************Start Dapps Module *******************************************/
/* Get Dapps Schema */
router.get('/dapps', async (req, res) => {
	let admin_name = req.session.admin_name;
	let emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			const dapps = await  dappsModel.find({}); 
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('dapps', {title: 'Dapps', menuId: 'dapps', msg: notification_arr, adminname: admin_name, dapps: dapps, adminpermition: adminpermition});
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'user_groups'});
	}
})

/* Get add Dapps Schema */
router.get('/addDapps', async (req, res) => {
	let admin_name = req.session.admin_name;
	let emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			var notification_arr = {
				'type' : req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
			res.render('add_dapps', {title: 'Dapps', menuId: 'dapps', msg: notification_arr, adminname: admin_name, adminpermition: adminpermition});

		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'user_groups'});
	}
});

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

/* Users details */
router.get("/dappsDetails/:postId", async (req, res) => {
	let admin_name = req.session.admin_name;
	let emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try
			{
				const editdapps_arr = await dappsModel.findOne({_id: req.params.postId});
				if(editdapps_arr != '') {

					var notification_arr = {
						'type': req.flash('type'),
						'text_msg': req.flash('text_msg')
					}
					res.render('dappsDetails', { title: 'Dapps', menuId: 'dapps', msg: notification_arr, adminname: admin_name, editdapps_arr: editdapps_arr, adminpermition: adminpermition});
				}
				else
				{
					const dapps = await  dappsModel.find({});
					var notification_arr = {
						'type': 'Error',
						'text_msg': 'Dapps details not found'
					}
					res.render('dapps', { title: 'Dapps', menuId: 'dapps', msg: notification_arr, adminname:admin_name, dapps: dapps, adminpermition: adminpermition});

				}
			}
			catch(error)
			{
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'dapps'});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");

		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'dapps'});
	}
});

/* Delete Schema responce */
router.delete('/removeDapps/:postId', async (req, res) => {
	let admin_name = req.session.admin_name;
	let emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try
			{
				let deleteDapps = await dappsModel.findByIdAndRemove({_id : req.params.postId}, function(err) {
					if(err) {
						console.log(err);
						res.status.json({ err: err });
					}
					return res.json({ success: true });
				});
			}
			catch(error) {
				res.send(500)
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'dapps'});
	}
});


router.post("/changeStatus/:postID", async (req, res) => {
	var admin_name = req.session.admin_name;
	var emailId = req.session.emailId;
	if(emailId)
	{
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin') || adminpermition.includes('Marketer'))
		{
			try
			{
				var statusdata = req.body.status;
				console.log('active Status :', statusdata)
				const post = await dappsModel.update({_id : req.params.postID},
					{ $set : { activeStatus : statusdata}
				});
				req.flash('type', 'Success');
				req.flash('text_msg', 'Status details update successful');
				res.redirect('/dapps');
			}
			catch(error)
			{
				const dapps = await  dappsModel.find({});
				var notification_arr = {
					'type': 'Error',
					'text_msg': error
				}
				res.render('dapps', { title: 'Dapps', menuId: 'dapps', msg: notification_arr, adminname:admin_name, dapps: dapps, adminpermition: adminpermition});
			}
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'dapps'});
	}
})

/**********************************End Dapps Module *******************************************/

/*----------------------------------------------------------------------------------------------------------------*/

/************************************************	Token send	************************************/
/* Token send */
router.get("/token_send", async (req, res) => {
	var emailId = req.session.emailId;
	var admin_name = req.session.admin_name;
	if(emailId)
	{		
		const permission_result = await Admin.findOne({"email": emailId});
		const adminpermition    = JSON.stringify(permission_result.role);
		if(adminpermition.includes('Admin'))
		{			
			try{
				var notification_arr = {
						'type': req.flash('type'),
						'text_msg': req.flash('text_msg')
					}
				res.render('token_send', { title: 'Token send', menuId: 'token_send', msg: notification_arr, adminname:admin_name, adminpermition: adminpermition });			
			}
			catch(error)
			{
				throw new Error(err);
			}		
		}
		else
		{
			req.flash('type', 'Warning');
			req.flash('text_msg', 'Permission denied');
			res.redirect("/dashboard");
		}
	}
	else
	{
		var notification_arr = {
			'type': 'Warning',
			'text_msg': 'Your are not logged In!'
		}
		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'users'});
	}
})

/* Update user send token balance */
router.post("/tokenSendData", async (req, res) => {
	var token_address = req.body.token_address;
	var to_address = req.body.to_address;
	var amount = req.body.amount;
	var transaction_id = req.body.transaction_id;
	
	if(amount.length > 0)
	{
		/*
		for(var k=0; k < amount.length; k++)
		{
			const user_details = await Users.findOne({"eth_address": to_address[k]}, {"_id": 1, "user_token": 1});
			var new_user_token = '';
			if(user_details.user_token == '')
			{
				new_user_token = amount[k];
			}
			else
			{
				new_user_token = parseFloat(user_details.user_token) + parseFloat(amount[k]);
			}
			
			if(user_details)
			{
				const post = await Users.update(
					{ _id : user_details._id},
					{ $set : {user_token: new_user_token}}
				);
			}			
		}
		*/
		/* Store send token list */
		for(var l=0; l<to_address.length; l++)
		{
			try{
				const token_post = new Token_send();
				token_post.token_address	= token_address;
				token_post.to_address		= to_address[l];
				token_post.decimals			= 18;
				token_post.amount			= amount[l];
				token_post.transaction_id	= transaction_id;
				token_post.time 			= new Date().getTime();
				token_post.updated_at		= moment().format("ll"); 
				await token_post.save();
			}
			catch(error)
			{
				
			}				
		}
		/* end send token details */
		res.json(true);
	}
	
})
/*******************************************************   End token send	************************************************/

/**********************************		User coin transaction	****************************/
/**
*	User bonus and current coin store
*/
router.get("/coin_transaction", async (req, res) => {
	const userList = await Users.find({ $and : [{ eth_address: { $ne: null } }, { user_referenced_code: { $ne: null } }, { user_referenced_code: { $ne: 0 } }, { user_referenced_code: { $ne: '' } }]});	
	
	var emailId = req.session.emailId;
	var admin_name = "admin";
	try{
		var notification_arr = {
				'type': req.flash('type'),
				'text_msg': req.flash('text_msg')
			}
		res.render('coin_transaction', { title: 'Coin', menuId: 'coin', msg: notification_arr, adminname:admin_name, adminpermition: '', userList: userList });			
	}
	catch(error)
	{
		throw new Error(err);
	}
})

/**
| currentTransaction
*/
router.post("/current_transaction", async (req, res, next) => {
	const evotbonus_value = await Evotbonus.findOne({});
	var userID = 	req.body.user_id;			
	var current_value = req.body.current_value;
	var old_value = 0;
	var bonus_value = 0;	
	var userlast_transaction = await User_coin_transaction.findOne({user_id: userID});
	if(userlast_transaction)
	{
		if(userlast_transaction.old_value > 0)
		{
			old_value = userlast_transaction.old_value;
			var calculate_bonus = current_value - old_value;
			if(calculate_bonus > 0)
			{
				bonus_value = (calculate_bonus * evotbonus_value.bonus / 100);
			}
			else
			{
				bonus_value = 0;
			}
		}
		else
		{
			bonus_value = (current_value * evotbonus_value.bonus / 100);
		}		
	}
	else
	{
		bonus_value = (current_value * evotbonus_value.bonus / 100);
	}
	
	const user_referenced_res = await Users.findOne({_id: userID});
	
	const referral_userdetauls = await Users.findOne({user_referral_code: user_referenced_res.user_referenced_code});
	if(referral_userdetauls)
	{
		var user_bonus = 0;
		var old_bonus = referral_userdetauls.user_token;
		
		if(old_bonus == '' || old_bonus == 0 || old_bonus == null || old_bonus == "0")
		{
			user_bonus = (bonus_value).toString();
		}
		else
		{
			user_bonus = parseFloat(old_bonus) + parseFloat(bonus_value)
			user_bonus = (user_bonus).toString();
		}
		
		const bonus_post = await Users.update(
			{_id: referral_userdetauls._id},
			{ $set: {user_token: user_bonus}}
		);		
	}
	
	const post_transaction				= new User_coin_transaction();
	post_transaction.user_id 			= userID;			
	post_transaction.current_value 		= current_value;		
	post_transaction.old_value			= current_value;			
	post_transaction.bonus_value		= bonus_value;			
	post_transaction.paid_value			= 0;			
	post_transaction.referenced_code	= user_referenced_res.user_referenced_code;
	post_transaction.time				= new Date().getTime();			
	post_transaction.update_time		= new Date().getTime() + (12 * 60 * 60 * 1000);
	
	await post_transaction.save();
	res.json(post_transaction);
})

/**
*	User amount update
*/
router.get("/tokenPaidStatus", async (req, res) => {
	var sendtoken_details = await Token_send.find({});
	if(sendtoken_details)
	{
		for(var k = 0; k < sendtoken_details.length; k++)
		{
			var user_eth_address = sendtoken_details[k].to_address;
			user_eth_address = user_eth_address.trim();
			var user_details = await Users.findOne({eth_address: user_eth_address});
			if(user_details)
			{
				var user_r_code = user_details.user_referral_code;
					user_r_code = user_r_code.trim();
				try{
					var cointransaction_details = await User_coin_transaction.findOne({ $and : [ {referenced_code: user_r_code}, {paid_value: 0}]}).sort({time: -1});
					try{
						if(sendtoken_details[k].amount > 0)
						{
							const coin_trans = await User_coin_transaction.update(
								{ _id : cointransaction_details._id},
								{ $set : {paid_value : sendtoken_details[k].amount}}
							);
						}
					}
					catch(error1)
					{
						throw new Error(error1);
					}
				}
				catch(error)
				{
					throw new Error(error);
				}				
			}
		}
	}
	res.json('ok');
})

/**********************************	//End User coin transaction	****************************/

/* send With Email */
// router.post("/sendwithemail/:postId", async (req, res) => {
// 	var admin_name = req.session.admin_name;
// 	var emailId = req.session.emailId;
// 	if(emailId)
// 	{
// 		var textmsg = req.body.message;
// 		var ticket = req.body.ticket;
// 		var from_id = req.body.to_id;
// 		var to_id = 0;

// 		const user = await Users.findOne({_id : from_id})

// 			if(user !='' || user == undefined) {
// 				ejs.renderFile(process.cwd() + "/views/evoaisupporttemp.ejs", { message: textmsg }, function (err, data) {
// 					if (err) {
// 						console.log(err);
// 					}
// 					else {
						
// 						var mailOptions = {
// 							from: webEmail,
// 							to: user.email,
// 							subject: 'Support Mail',
// 							html: data
// 						};
// 						sgMail.sendMultiple(mailOptions);
// 					}
// 				});

// 				const supportChat_list = await Support_chat.find({"ticket": req.params.postId}).sort({"updated_at": 1});
// 				ejs.renderFile(process.cwd() + "/views/supportchat_live.ejs", {supportChat_list: supportChat_list }, function (err, data) {
// 					if (err) {
// 						console.log(err);
// 					} else {
						
// 						res.send(data);
// 					}
// 				});		
// 			}
// 	}
// 	else
// 	{
// 		var notification_arr = {
// 			'type': 'Warning',
// 			'text_msg': 'Your are not logged In!'
// 		}
// 		res.render('login', { title: 'Login', menuId: 'Login', msg: notification_arr, redirecturl: 'support'});
// 	}
// });


/* Logout */
router.get("/logout", async (req,res) => {
	
	req.session.destroy()
	req.flash('type', 'Success');
	req.flash('text_msg', 'Logged out!');
	res.redirect('/');

});

module.exports = router;