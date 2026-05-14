const mongoose = require('mongoose');
const { 
    generateReturnObj,
    verifyIdFormat,
    mapCountObj
} = require('./utilities/general');

const {
    sendEmailTemplate,
    sendEmailWithResend
} = require('./utilities/emailSendingService');

const jobSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    applied_date: {
        type: Date, 
        default:Date.now
    },
    company_name: {
        type: String,
        required: true
    },
    company_reg_num: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    job_requirement: {
        type: String,
    },
    company_email: {
        type: String,
    },
    interview_date: {
        type: Date,
    },
    salary: {
        type: Number
    },
    status: {
        type: String,
        enum: ['user_rejected', 'company_rejected', 'submitted', 'responded', 'pending', 'interviewing'],
        default: 'pending'
    },
    remark: {
        type: String,
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

jobSchema.statics.getStatusList = async function(internalUse = false) {
    const statusList = [
        {
            label: 'Application submitted',
            value: 'submitted'
        },
        {
            label: 'Self rejected',
            value: 'user_rejected'
        },
        {
            label: 'Rejected by company',
            value: 'company_rejected'
        },
        {
            label: 'Company responded',
            value: 'responded'
        },
        {
            label: 'Pending',
            value: 'pending'
        },
        {
            label: 'Interview in progress',
            value: 'interviewing'
        },
    ];

    if (internalUse === true) {
        return statusList;
    } else {
        return generateReturnObj("Success", 0, statusList, "");
    }
}

jobSchema.statics.verifyStatusValue = async function(inputStatusVal) {
    const statusList = await this.getStatusList(true);

    if (statusList) {
        let verifiedStatus = false;

        for (const statusVal of statusList) {
            if (statusVal['value'] === inputStatusVal) {
                verifiedStatus = true;
                break;
            }
        }

        if (!verifiedStatus) {
            return generateReturnObj("Error", 1, "", "Invalid status value.");
        } else {
            return true;
        }
    } else {
        return generateReturnObj("Error", 2, "", "Unable to verify status value, please contact admin.");
    }
}

jobSchema.statics.getJobItem = async function(params) {
    const {
        jobID
    } = params;

    const verifiedJobID = verifyIdFormat(jobID);

    if (verifiedJobID['status'] && verifiedJobID['status'] == "error") {
        return verifiedJobID;
    }

    const jobItemRes = await this.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(verifiedJobID)
            }
        },
        {
            $project: {
                _id: 0,
                role: 1,
                company_name: 1,
                company_reg_num: 1,
                job_requirement: 1,
                location: 1,
                company_email: 1,
                status: 1,
                remark: 1,
                salary: 1,
                applied_date: {
                    $dateToString: {
                        format: "%Y-%m-%d %H:%M:%S",
                        date: "$applied_date"
                    }
                },
                interview_date: {
                    $dateToString: {
                        format: "%Y-%m-%d %H:%M:%S",
                        date: "$interview_date"
                    }
                },
                createdAt: {
                    $dateToString: {
                        format: "%Y-%m-%d %H:%M:%S",
                        date: "$createdAt"
                    }
                }
            }
        }
    ]);

    if (jobItemRes && jobItemRes.length > 0) {
        return generateReturnObj("Success", 0, jobItemRes[0], "");
    } else {
        return generateReturnObj("Error", 2, "", "Unable to retrieve job information.");
    }
}

jobSchema.statics.getJobAppList = async function(params) {
    const {
        page = 1,
        limit = 10,
        status = "",
    } = params;

    const skip = (page - 1) * limit;

    let matchCondition = {};

    if (status && status != "") {
        matchCondition.status = status;
    }

    const jobListRes = await this.aggregate([
        {
            $match: matchCondition
        },
        {
            $project: {
                _id: 0, //This is to tell MongoDB to ignore returning the special "_id" column as it will add to it by it's default.
                jobID: "$_id",
                role: 1,
                applied_date: {
                    $dateToString: {
                        format: "%Y-%m-%d %H:%M:%S",
                        date: "$applied_date"
                    }
                },
                company_name: 1,
                company_reg_num: 1,
                job_requirement: 1,
                salary: 1,
                status: 1,
                createdAt: {
                    $dateToString: {
                        format: "%Y-%m-%d %H:%M:%S",
                        date: "$createdAt"
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        }
    ]);

    const jobsPaginationRes = await this.getPagination({listingCondition: matchCondition, page: page, limit: limit});

    if (jobListRes && jobListRes.length > 0) {

        let listingObj = {
            listing: jobListRes,
            pagination: jobsPaginationRes
        }

        return generateReturnObj("Success", 0, listingObj);

    } else {
        return generateReturnObj("Success", 0, "", "No Result Found");
    }
}

jobSchema.statics.getPagination = async function(params) {
    const {listingCondition, page, limit} = params;

    const paginationRes = await this.aggregate([
        {
            $match: listingCondition
        },
        {
            $facet: {
                totalRecord: [
                    {$count: "count"}
                ]
            }
        }
    ]);

    //Default pagination info.
    let paginationObj = {
        pageNumber: 1,
        numRecord: limit,
        totalRecord: 0,
        totalPage: 0
    }

    if (paginationRes && paginationRes[0]['totalRecord'] && paginationRes[0]['totalRecord'].length > 0) {
        const totalRecordData = paginationRes[0]['totalRecord'][0]['count'];

        paginationObj = {
            pageNumber: page,
            numRecord: limit,
            totalRecord: totalRecordData,
            totalPage: Math.ceil(totalRecordData / limit)
        };
    }

    return paginationObj;
}

jobSchema.statics.addJobApplication = async function(params) {
    const paramData = params;

    const requiredFieldArr = {
        role: "The role applied cannot be empty.",
        companyName: "The applied company name cannot be empty",
        companyRegNum: "The applied company registration number cannnot be empty",
    };

    if (paramData) {
        for (let fieldKey in requiredFieldArr) {
            let tempData = paramData[fieldKey];

            if (!tempData || tempData == "") {
                return generateReturnObj("Error", 1, "", requiredFieldArr[fieldKey]);
            }
        }

        const verifiedStatusRes = await this.verifyStatusValue(paramData['status']);

        if (verifiedStatusRes['status'] && verifiedStatusRes['status'] == "error") {
            return verifiedStatusRes;
        }

        const newJobItem = new this({
            role: paramData['role'],
            applied_date: paramData['appliedDate'],
            company_name: paramData['companyName'],
            company_reg_num: paramData['companyRegNum'],
            job_requirement: (paramData['jobRequirement'] && paramData['jobRequirement'] != "") ? paramData['jobRequirement'] : "No Information",
            location: (paramData['location'] && paramData['location'] != "") ? paramData['location'] : "No Information",
            company_email: (paramData['companyEmail'] && paramData['companyEmail'] != "") ? paramData['companyEmail'] : "No Information",
            interview_date: paramData['interviewDate'],
            salary: paramData['salary'] ? paramData['salary'] : 0,
            status: paramData['status'],
            remark: paramData['remark']
        });

        await newJobItem.save();

        return generateReturnObj("Success", 0, "", "Successfully added a new job application");
    } else {
        return generateReturnObj("Error", 2, "", "Invalid params.");
    }
}

jobSchema.statics.editJobApplication = async function(params) {
    const paramData = params;

    const requiredFieldArr = {
        role: "The role applied cannot be empty.",
        companyName: "The applied company name cannot be empty",
        companyRegNum: "The applied company registration number cannnot be empty",
        jobID: "Invalid job application ID.",
    };

    if (paramData) {
        if (paramData['jobID']) {
            // Validate Job ID
            const verifiedJobID = verifyIdFormat(paramData['jobID']);

            if (verifiedJobID['status'] && verifiedJobID['status'] == "error") {
                return verifiedJobID;
            }

            // Validate required input
            for (let fieldKey in requiredFieldArr) {
                let tempData = paramData[fieldKey];

                if (!tempData || tempData == "") {
                    return generateReturnObj("Error", 1, "", requiredFieldArr[fieldKey]);
                }
            }

            // Validate input status
            const verifiedStatusRes = await this.verifyStatusValue(paramData['status']);

            if (verifiedStatusRes['status'] && verifiedStatusRes['status'] == "error") {
                return verifiedStatusRes;
            }

            const job = await this.findById(verifiedJobID);

            if (job) {
                // Set new input into the document
                job.role = paramData['role'];
                job.applied_date = paramData['appliedDate'];
                job.company_name = paramData['companyName'];
                job.company_reg_num = paramData['companyRegNum'];
                job.job_requirement = (paramData['jobRequirement'] && paramData['jobRequirement'] != "") ? paramData['jobRequirement'] : "No information";
                job.location = (paramData['location'] && paramData['location'] != "") ? paramData['location'] : "No Information";
                job.company_email = (paramData['companyEmail'] && paramData['companyEmail'] != "") ? paramData['companyEmail'] : "No information";
                job.interview_date = paramData['interviewDate'];
                job.salary = paramData['salary'];
                job.status = paramData['status'];
                job.remark = paramData['remark'];

                await job.save();

                return generateReturnObj("Success", 0, "", "Successfully updated job application record.");
            } else {
                return generateReturnObj("Error", 1, "", "Unable to update job application record, please contact admin.");
            }

        } else {
            return generateReturnObj("Error", 1, "", "Invalid job application ID.");
        }
    } else {
        return generateReturnObj("Error", 1, "", "Invalid params.");
    }
}

jobSchema.statics.removeJobItem = async function(params) {
    const {
        jobID
    } = params;

    // Validate Job ID
    const verifiedJobID = verifyIdFormat(jobID);

    if (verifiedJobID['status'] && verifiedJobID['status'] == "error") {
        return verifiedJobID;
    }

    const deletedItemRes = await this.findByIdAndDelete(verifiedJobID);

    if (deletedItemRes) {
        return generateReturnObj("Success", 0, "", "Successfully deleted a job application record.");
    } else {
        return generateReturnObj("Error", 2, "", "Unable to remove job application record, please contact admin.")
    }
}

jobSchema.statics.sendNotifEmail = async function(params) {
    const { jobID } = params;

    if (!jobID || jobID == "") {
        return generateReturnObj("Error", 2, "", "Unable to retrieve job ID, please contact admin to continue.")
    }

    const jobItemRes = await this.getJobItem({jobID: jobID});

    if (jobItemRes['status'] && jobItemRes['status'] == "error") {
        return jobItemRes;
    }

    const jobData = jobItemRes['data'];

    const receiver = process.env.RECEIVER_EMAIL;
    const subject = `Interview reminder for at ${jobData['company_name']}.`;

    let interviewDate = "-";

    if (jobData['interview_date'] && typeof jobData['interview_date'] == "string") {
        let tempDate = jobData['interview_date'].split(' ')[0];
        let tempDateSub = tempDate.split('-');

        interviewDate = `${tempDateSub[tempDateSub.length - 1]}/${tempDateSub[1]}/${tempDateSub[0]}`;
    }

    const description = `
        <html>
            <div style="margin-bottom: 2px;">
                <p>Please be reminded you have an upcoming interview for:</p>
            </div>
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td style="width: 120px;">Role: </td>
                            <td><b>${jobData['role'] ? jobData['role'] : "-"}</b></td>
                        </tr>
                        <tr>
                            <td style="width: 120px;">Company Name: </td>
                            <td><b>${jobData['company_name'] ? jobData['company_name'] : "-"}</b></td>
                        </tr>
                        <tr>
                            <td style="width: 120px;">Interview date: </td>
                            <td><b>${interviewDate}</b></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </html>
    `;

    const sendEmailRes = await sendEmailTemplate(subject, description, receiver);

    return sendEmailRes;
}

module.exports = mongoose.model('Jobs', jobSchema);