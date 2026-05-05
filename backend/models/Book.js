const mongoose = require('mongoose');
const { 
    generateReturnObj,
    verifyAndFindByID,
    mapCountObj
} = require('./utilities/general');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    author: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['to_read', 'reading', 'completed'],
        default: 'to_read'
    },
    rating: {
        type: Number,
        required: true
    },
    client_id: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

bookSchema.statics.getBookList = async function(params) {
    const { 
        userID, 
        page = 1, 
        limit = 10, 
        status 
    } = params;

    const skip = (page - 1) * limit;

    let matchCondition = { client_id: userID };

    if (status && status != "") {
        matchCondition.status = status;
    }

    const bookListRes = await this.aggregate([
        { 
            $match: matchCondition
        },
        {
            $project: {
                _id: 0, // This is to tell MongoDB to ignore returning the special "_id" column as it will add to it by it's default.
                bookID: "$_id",
                title: 1, 
                status: 1,
                rating: 1,
                createdAt: {
                    $dateToString: {
                      format: "%Y-%m-%d %H:%M:%S", // 2024-03-17
                      date: "$createdAt"
                    }
                }
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
    ]);

    const booksCountRes = await this.getBooksCounts({userID: userID});
    const booksPaginationRes = await this.getPagination({listingCondition: matchCondition, page: page, limit: limit});

    if (bookListRes && bookListRes.length > 0) {
        let listingObj = {
            listing: bookListRes,
            pagination: booksPaginationRes
        }

        if (booksCountRes && booksCountRes['status'] == "ok" && booksCountRes['code'] == "0") {
            listingObj['counts'] = booksCountRes['data'];
        }

        return generateReturnObj("Success", 0, listingObj);
    } else {
        let errorData = (booksCountRes && booksCountRes['status'] == "ok" && booksCountRes['code'] == "0") ? {counts: booksCountRes['data']} : "";

        return generateReturnObj("Success", 0, {counts: booksCountRes['data']}, "No results found.");
    }
}

bookSchema.statics.getPagination = async function(params) {
    const { listingCondition, page, limit } = params;

    const paginationRes = await this.aggregate([
        {
            $match: listingCondition
        },
        {
            $facet: {
                totalRecord: [
                    { $count: "count" }
                ],
            }
        }
    ]);

    let paginationObj = {
        pageNumber: 1,
        numRecord: limit,
        totalRecord: 0,
        totalPage: 0
    }

    if (paginationRes) {
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

bookSchema.statics.getBooksCounts = async function(params) {
    const { userID } = params;

    const result = await this.aggregate([
        { 
            $match: { client_id: userID } 
        },
        {
            $facet: {
                total: [
                    { $count: "count" }
                ],
                reading: [
                    { 
                        $match: { status: "reading" } 
                    }, 
                    { 
                        $count: "count" 
                    }
                ],
                completed: [
                    { 
                        $match: { status: "completed" } 
                    }, 
                    { 
                        $count: "count" 
                    }
                ],
                to_read: [
                    { 
                        $match: { status: "to_read" } 
                    }, 
                    { 
                        $count: "count" 
                    }
                ]
            }
        }
    ]);

    if (result) {
        let countObj = mapCountObj(result);

        return generateReturnObj("Success", 0, countObj);
    } else {
        return generateReturnObj("Error", 1, "", "Unable to get data count.");
    }
}

bookSchema.statics.getBookItem = async function(params) {
    const { bookID, userID } = params;

    if (params) {
        if (bookID) {
            // Checked id format to be valid before doing anything else.
            const verifiedFormatID = verifyAndFindByID(bookID, "Invalid book ID format.");

            if (verifiedFormatID['status'] && verifiedFormatID['status'] == "Error") {
                return verifiedFormatID;
            }

            const bookItem = await this.aggregate([
                {
                    $match: { 
                        _id: new mongoose.Types.ObjectId(verifiedFormatID),
                    } 
                },
                {
                    $project: {
                        _id: 0,
                        bookID: "$_id",
                        title: 1,
                        author: 1,
                        status: 1,
                        rating: 1,
                        description: 1,
                        client_id: 1
                    }
                }
            ]);

            if (bookItem) {
                let verifyParam = {bookItem: bookItem, userID: userID};
                const verifyOwnerRes = await this.verifyBookOwner(verifyParam);

                if (verifyOwnerRes) {
                    return generateReturnObj("Success", 0, bookItem[0], "");
                }

                return generateReturnObj("Error", 1, "", "Invalid user, unable to retrived book data");
            } else {
                return generateReturnObj("Error", 1, "", "Unable to retrieve book item.");
            }

        } else {
            return generateReturnObj("Error", 1, "", "Invalid book ID.");
        }
    } else {
        return generateReturnObj("Error", 1, "", "Invalid params.");
    }
}

bookSchema.statics.verifyBookOwner = async function (params) {
    const { bookItem, userID, isID = 0 } = params;

    let verificationItem = Array.isArray(bookItem) ? bookItem[0] : bookItem;

    if (isID === 1) {
        const getBookItemRes = await this.findById(bookItem);

        verificationItem = getBookItemRes ? getBookItemRes : {};
    }

    if (verificationItem['client_id'] === userID) {
        return true;
    }

    return false;
}

bookSchema.statics.addBookItem = async function(params) {
    const paramData = params;

    const requiredFieldArr = {
        title: "Please enter title.",
        author: "Please enter author.",
        rating: "Please give a rating for this book.",
        userID: "Invalid user ID."
    };

    if (paramData) {
        // Validate input params
        for (let fieldKey in requiredFieldArr) {
            let tempData = paramData[fieldKey];

            if (!tempData || tempData == "") {
                return generateReturnObj("Error", fieldKey === "userID" ? 2 : 1, "", requiredFieldArr[fieldKey]);
            }
        }

        // Began setup data for DB entry
        const newBook = new this({
            title: paramData['title'],
            author: paramData['author'],
            description: paramData['description'],
            status: paramData['status'],
            rating: paramData['rating'],
            client_id: paramData['userID']
        });

        // Save the document instance to DB
        await newBook.save();

        return generateReturnObj("Success", 0, "", "Successfully added a book item.");
    } else {
        return generateReturnObj("Error", 1, "", "Invalid params.");
    }
}

bookSchema.statics.editBookItem = async function(params) {
    const paramData = params;

    const requiredFieldArr = {
        title: "Please enter title",
        author: "Please enter author",
    };

    if (paramData) {
        if (paramData['bookID']) {
            // Checked id format to be valid before doing anything else.
            const verifiedFormatID = verifyAndFindByID(paramData['bookID'], "Invalid book ID format.");

            if (verifiedFormatID['status'] && verifiedFormatID['status'] == "Error") {
                return verifiedFormatID;
            }

            // Get book document
            const book = await this.findById(verifiedFormatID);

            if (book) {
                // Validate input params
                for (let fieldKey in requiredFieldArr) {
                    let tempData = paramData[fieldKey];

                    if (!tempData || tempData == "") {
                        return generateReturnObj("Error", 1, "", requiredFieldArr[fieldKey]);
                    }
                }

                const statusList = this.getStatusList(true);

                if (statusList) {
                    let verifiedStatus = false;

                    for (const statusVal of statusList) {
                        if (statusVal['value'] === paramData['status']) {
                            verifiedStatus = true;
                            break;
                        }
                    }

                    if (!verifiedStatus) {
                        return generateReturnObj("Error", 1, "", "Invalid status.");
                    }
                }

                // Set new input into the document.
                book.title = paramData['title'];
                book.author = paramData['author'];
                book.description = paramData['description'];
                book.status = paramData['status'];
                book.rating = paramData['rating'];

                // Update the new values into the document
                await book.save();

                return generateReturnObj("Success", 0, "", "Successfully updated a book item.");
            } else {
                return generateReturnObj("Error", 1, "", "Unable to retrieve book item.");
            }

        } else {
            return generateReturnObj("Error", 1, "", "Invalid book ID.");
        }
    } else {
        return generateReturnObj("Error", 1, "", "Invalid params.");
    }
}

bookSchema.statics.getStatusList = function(internalUse = false) {
    const statusList = [
        {
            label: "To read",
            value: "to_read"
        },
        {
            label: "Reading",
            value: "reading"
        },
        {
            label: "Completed",
            value: "completed"
        },
    ];

    if (internalUse) {
        return statusList;
    } else {
        return generateReturnObj("Success", 0, statusList, "");
    }
}

bookSchema.statics.removeBookItem = async function(params) {
    const { bookID, userID } = params;

    if (params) {
        if (bookID) {
            // Checked id format to be valid before doing anything else.
            const verifiedFormatID = verifyAndFindByID(bookID, "Invalid book ID format.");

            if (verifiedFormatID['status'] && verifiedFormatID['status'] == "Error") {
                return verifiedFormatID;
            }

            let verifyOwnerParam = {bookItem: bookID, userID: userID, isID: 1}

            const verifyOwnerRes = await this.verifyBookOwner(verifyOwnerParam);
            if (verifyOwnerRes) {
                const deletedItem = await this.findByIdAndDelete(verifiedFormatID);

                if (deletedItem) {
                    return generateReturnObj("Success", 0, "", "Successfully deleted a book item.");
                } else {
                    return generateReturnObj("Error", 1, "", "Deletion failed, unable to delete book item.");
                }
            }

            return generateReturnObj("Error", 1, "", "Invalid user, unable to perform delete.");;
        }
    } else {
        return generateReturnObj("Error", 1, "", "Invalid params.");
    }
}

module.exports = mongoose.model('Books', bookSchema);