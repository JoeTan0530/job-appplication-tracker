// import { Resend } from 'resend';
const { Resend } = require('resend');
const { 
    generateReturnObj,
} = require('./general');

const resend = new Resend(process.env.EMAIL_API);

const sendEmailWithResend = async (receiver = [], emailSubject = "", emailHtml = "", sender = "Joe Tan <joetan@custom-dev.biz>") => {

	const { data, error } = await resend.emails.send({
		from: sender,
		to: receiver,
		subject: emailSubject,
		html: emailHtml
	});

	if (error) {
		return generateReturnObj("Error", 2, "","Failed to send email.");
	}

	return generateReturnObj("Success", 0, "", "Successfully sent email.");
}

module.exports = {
	sendEmailWithResend
};