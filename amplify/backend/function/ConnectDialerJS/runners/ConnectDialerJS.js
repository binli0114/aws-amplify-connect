
process.env.instance="2340bf9d-dd66-4012-ac40-88133523a749";
process.env.cFlowID="5744ec6a-6c7b-4eb5-bcff-ba08a2835978";
process.env.sourcePhoneNumber="+61370039616";
process.env.REGION="ap-southeast-2"
const {handler,callOutbound} = require("../src/index");
(async ()=>{
    const phoneNumbers=[
        {
            telephoneNumber:"+61431393060"
        }
    ]
    await callOutbound(phoneNumbers);
    console.log("done");
})()