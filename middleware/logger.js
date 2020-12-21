
const logger = (req,res,next)=>{
    console.log(req.protocol+`://${req.get('host')}`);
    next();
};

module.exports = logger;