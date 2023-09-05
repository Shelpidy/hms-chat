import { Router,Request,Response} from "express"
import { getResponseBody, responseStatus, responseStatusCode } from "../utils/utils"
import Status from "../models/Status"


const router = Router()
router.get("/user-status/proxy/:userId",async(req:Request,res:Response)=>{
    try{
        let {userId} = req.params;

        let status = await Status.findOne({where:{userId}})
        console.log({Status:status})

        if(!status){
            return res.status(responseStatusCode.OK).json(
                getResponseBody(responseStatus.SUCCESS,`Status with userId ${userId} does not exist`,{lastSeen:""})
            );
        }
        return res.status(responseStatusCode.OK).json({
            status: responseStatus.SUCCESS,
            data: status.dataValues,
        });

    }catch(err) {
        console.log(err);
        res.status(responseStatusCode.BAD_REQUEST).json(
            getResponseBody(responseStatus.ERROR,String(err))
        );
    }

})

export default router