// import { Resend } from 'resend';
const { Resend } = require('resend');
const { 
    generateReturnObj,
} = require('./general');

const resend = new Resend(process.env.EMAIL_API);

const sendEmailTemplate = async (subject = "", description = "", receiver = []) => {
	const paramData = {
		subject: subject,
		description: description,
		receiver: receiver
	};

	const requiredFieldArr = {
        subject: "Subject field cannot be empty.",
        description: "Description cannot be empty.",
        receiver: "Receiver cannot be empty."
    };

    for (let fieldKey in requiredFieldArr) {
        let tempData = paramData[fieldKey];

        if ((!tempData || tempData == "") || (fieldKey == "receiver" && tempData.length <= 0)) {
            return generateReturnObj("Error", 1, "", requiredFieldArr[fieldKey]);
        }
    }

    if (!Array.isArray(paramData['receiver']) && typeof paramData['receiver'] == "string") {
    	paramData['receiver'] = [paramData['receiver']];
    }

    return await sendEmailWithResend(paramData['receiver'], paramData['subject'], paramData['description']);
}

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
	sendEmailTemplate,
	sendEmailWithResend
};