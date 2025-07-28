const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Refreshtoken = require('../models/refreshtoken'); // Ensure this is the corrected import

const getratetoken = async (user) => {
  const accesstoken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_Secret,
    { expiresIn: '60m' }
  );

  const refreshtoken = crypto.randomBytes(40).toString('hex');

  const expiresat = new Date();
  expiresat.setDate(expiresat.getDate() + 7);

  try {
    console.log("Checking Refreshtoken object:", Refreshtoken); // Add this line
    await Refreshtoken.create({
      token: refreshtoken,
      user: user._id,
      expireAt: expiresat,
    });

  } catch (err) {
    console.error("❌ Error saving refresh token:", err.message);
    throw err;
  }

  return {
    accesstoken,
    refreshtoken,
    expiresIn: 60 * 60, // optional
    refreshExpiresAt: expiresat.getTime() // optional
  };
};

module.exports = getratetoken;