const nearAPI = require("near-api-js");
const fs = require("fs");
const {providers} = nearAPI;

const SnapshotFilename = "res/snapshot.json";
function saveJson(json, filename) {
    try {
      const data = JSON.stringify(json);
      fs.writeFileSync(filename, data);
    } catch (e) {
      console.error("Failed to save JSON:", filename, e);
    }
}
(()=>{
    var allProject = [];
    const provider =  new providers.JsonRpcProvider({url: "https://rpc.mainnet.near.org" });
    provider.query({
        request_type: "call_function",
        account_id: "registry.potlock.near",
        method_name: "get_projects",
        args_base64: (Buffer.from(JSON.stringify({}))).toString("base64"),
        finality: "optimistic",
    }).then((res)=>{
        const rs = (JSON.parse(Buffer.from(res.result).toString()));
        Object.values(rs).map((project)=>{
            //console.log("project",project.id)
            try{
                if(project.status === "Approved"){
                    
                    provider.query({
                        request_type: "call_function",
                        account_id: "social.near",
                        method_name: "get",
                        args_base64: (Buffer.from(JSON.stringify({"keys":[`${project.id}/profile/**`]}))).toString("base64"),
                        finality: "optimistic",
                    }).then((rs)=>{
                        const result = (JSON.parse(Buffer.from(rs.result).toString()));
                        //console.log("rsult",Object.keys(result))
                        
                        Object.keys(result).forEach((key)=>{
                            Object.values(result).forEach((value)=>{
                                const data = {
                                    accountId: project.id == key && key,
                                    data:value
                                }
                                allProject.push(data)
                               //console.log("data",allProject.push(data))
                               console.log("data",allProject.length > 1 && allProject)
                               allProject.length > 1 && saveJson(allProject,SnapshotFilename)
                            })
                        })
                    })
                    
                }
                
            }catch(err){
                console.log("err",err)
            }
        });
    })
    
})()
