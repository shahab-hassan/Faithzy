const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/userModel');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/v1/auth/login/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  const { id, displayName, emails } = profile;
  try {
    let user = await User.findOne({ googleId: id });
    if (!user) {
      let username = displayName.split(" ").join("");
      while (await User.findOne({ username })) {
        username = username.concat(Math.ceil(Math.random() * 10000));
      }
      user = await User.create({ googleId: id, username, email: emails[0].value });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}
));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "/api/v1/auth/login/facebook/callback",
  profileFields: ["id", "displayName", "emails"]
},
async (accessToken, refreshToken, profile, done) => {
  const { id, displayName, emails } = profile;
  try {
    let user = await User.findOne({ facebookId: id });
    if (!user) {
      let username = displayName.split(" ").join("");
      while (await User.findOne({ username })) {
        username = username.concat(Math.ceil(Math.random() * 10000));
      }
      user = await User.create({ facebookId: id, username, email: emails[0].value });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
