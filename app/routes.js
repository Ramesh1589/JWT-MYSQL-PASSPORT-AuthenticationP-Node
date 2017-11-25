// app/routes.js
module.exports = function(app, passport,  SERVER_SECRET) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	
	var expressJwt = require('express-jwt');
	const jwt = require('jsonwebtoken');
	
	const authenticate = expressJwt({secret : SERVER_SECRET});

	app.post('/login',  function(req, res, next) {
		passport.authenticate('local-login', function(err, user, info) {
			if (err) { return next(err); }
			// stop if it fails
			if (!user) { return res.json({ message: 'Invalid Username of Password' }); }
	  
			req.logIn(user, function(err) {
			  // return if does not match
			  if (err) { return next(err); }
	  
			  // generate token if it succeeds
			  const db = {
				updateOrCreate: function(user, cb){
				  cb(null, user);
				}
			  };
			  db.updateOrCreate(req.user, function(err, user){
				if(err) {return next(err);}
				// store the updated information in req.user again
				req.user = {
				  id: user.username
				};
			  });
	           
			  // create token
			  const jwt = require('jsonwebtoken');
			  req.token = jwt.sign({id: req.user,}, SERVER_SECRET, {expiresIn: 120 });
	  
			  // lastly respond with json
			  return res.status(200).json({
				user: req.user,
				token: req.token
			  });
			});
		  })(req, res, next);
		});
	// process the login form
	// app.post('/login', passport.authenticate('local-login', {
    //         successRedirect : '/profile', // redirect to the secure profile section
    //         failureRedirect : '/login', // redirect back to the signup page if there is an error
    //         failureFlash : true // allow flash messages
	// 	}),
    //     function(req, res) {
    //         console.log("hello");

    //         if (req.body.remember) {
    //           req.session.cookie.maxAge = 1000 * 60 * 3;
    //         } else {
    //           req.session.cookie.expires = false;
    //         }
    //     res.redirect('/');
    // });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', authenticate, function(req, res) {
		// res.render('profile.ejs', {
		// 	user : req.user // get the user out of session and pass to template
		// });

		console.log("This is restricted route");
		res.send({user:req.user});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
