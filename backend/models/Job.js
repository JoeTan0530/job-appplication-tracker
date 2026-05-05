const mongoose = require('mongoose');
const { 
    generateReturnObj,
    verifyAndFindByID,
    mapCountObj
} = require('./utilities/general');

const jobSchema = new mongoose.Schema({
    position: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    companyRegNum: {
        type: String,
        required: true
    },
    job_requirement: {
        type: String,
    },
    email: {
        type: String,
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

module.exports = mongoose.model('Job', jobSchema);