
 const filterOne = (query,reqQuery,field)=>{
     console.log("filter one:",reqQuery,field);
    if(reqQuery[field]){
        const fields=reqQuery[field].split(',').join(' ');
        console.log(reqQuery[field]);
        query[field](fields);
        delete reqQuery[field];
    }
}

 const filterAll = (query,reqQuery,fields)=>{
    fields.forEach((parm)=>{
        filterOne(query,reqQuery,parm);
    });
}

module.exports={
    filterOne,filterAll
};
