const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { 
    generateReturnObj 
} = require('./utilities/general');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'blocked', 'disabled'],
        default: 'active'
    },
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

userSchema.statics.registerUsers = async function(params) {
	const paramData = params;

	// Validate input params
	if (!paramData['name'] || paramData['name'] == "") {
		return generateReturnObj("Error", 1, "", "Please enter your name.");
	}

	if (!paramData['email'] || paramData['email'] == "") {
		return generateReturnObj("Error", 1, "", "Please enter your email.");
	}

	if (!paramData['password'] || paramData['password'] == "") {
		return generateReturnObj("Error", 1, "", "Password field cannot be empty.");
	}

	const checkEmailRes = await this.checkUserExistByEmail(paramData);

	if (checkEmailRes && checkEmailRes.length > 0) {
		return generateReturnObj("Error", 2, "", "Email already taken.");
	} 

	if (paramData['password'] != paramData['retypePassword']) {
		return generateReturnObj("Error", 2, "", "Password and confirm password must be the same");
	}

	// Generate salt
	const saltRounds = Number(process.env.PASSWORD_SALT);
    const salt = await bcrypt.genSalt(saltRounds);
    // Hash the password with the salt
    encryptedPassword = await bcrypt.hash(paramData['password'], salt);

	// Began setup data for DB entry
	const newUser = new this({
		name: paramData['name'],
		email: paramData['email'],
		password: encryptedPassword,
		status: "active"
	});

	// Save the document instance to DB
	await newUser.save();

	return generateReturnObj("Success", 0, "", "Successfully registered account, please use registered credentials to login.");
}

userSchema.statics.checkUserExistByEmail = function(params) {
	const inputVal = params;

	return this.find({email: inputVal['email']});
}

userSchema.statics.memberLogin = async function(params) {
	const paramData = params;

	if (!params['username'] || params['username'] == "") {
		return generateReturnObj("Error", 1, "", "Please input email address.");
	}

	if (!params['password'] || params['password'] == "") {
		return generateReturnObj("Error", 1, "", "Please input password.");
	}

	const userRes = await this.find({email: paramData['username']}, "_id name email password");

	if (userRes && userRes.length > 0) {
		const userData = userRes[0];

		const isPasswordValid = await userData.comparePassword(paramData['password']);
  
		if (isPasswordValid && !isPasswordValid['status']) {
			const sessionID = await userData.generateSessionId();

			const sessionData = {
				isLoginData: 1,
				sessionID: sessionID,
				clientID: userData['_id'],
				userInfo: {
					name: userData['name'],
					email: userData['email']	
				}
			};

		    return generateReturnObj("Success", 0, sessionData, "Successfully logged in.");
		} 
	}

	return generateReturnObj("Error", 2, "", "Invalid login credentials.");
}

userSchema.methods.generateSessionId = () => {
	const crypto = require('crypto');
	const timestamp = Date.now().toString(36);
	const random = crypto.randomBytes(16).toString('hex');
	return `${timestamp}_${random}`;
};

// Method to compare password
userSchema.methods.comparePassword = async function(inputPassword) {
	 try {
	    return await bcrypt.compare(inputPassword, this.password);
	} catch (error) {
	    throw generateReturnObj("Error", 2, "", "Password verification failed.");
	}
};

module.exports = mongoose.model('Users', userSchema);