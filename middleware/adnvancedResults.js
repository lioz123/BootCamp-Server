const {filterOne} = require('../utils/FilterQueries');
const advancedResults= (model, populate)=> async(req,res,next) =>{

    console.log(`get bootcamps was coloed query is:`.yellow,req.query);
    const reqQuery= {...req.query};
    // fileds to exculde
    const removeFields = ['select','sort','page','limit'];

    removeFields.forEach(param=>{delete reqQuery[param]});

    let queryStr= JSON.stringify(reqQuery);
     queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
    console.log(queryStr);

        let query= model.find(JSON.parse(queryStr));
        // page pugniation
        const page = parseInt(req.query.page,10) || 1;
        const limit = parseInt(req.query.limit,10) || 25;
        const startIndex = (page-1)*limit;
        const endIndex =(page)*limit;
        const total = await model.countDocuments();
        query.skip(startIndex).limit(limit);
        // filtering
          filterOne(query,req.query,'select');
          filterOne(query,req.query,'sort');

      //  filterAll(query,req.query,removeFields);
        if(populate){
            query.populate(populate);
        }

        const result = await query;
        if(!result){
            return next(new ErrorResonse("un registered id",404));
        }
        // pagination result
        const pagination = {};
        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }

        res.advancedResults={success:true,count:result.length,pagination,data:result};
        console.log(`advnaced results:`.yellow,res.advancedResults);
        next();
}

module.exports = advancedResults;