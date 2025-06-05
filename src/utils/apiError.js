class ApiError extends Error {
    constructor(statusCode,message="Something Went Wrong",errors=[],statck=""){
            super(message),
            this.statusCode=statusCode,
            this.errors=errors,
            this.message=message,
            this.data=null,
            this.success=false
            if(statck){
                  this.statck = statck
            }else{
                Error.captureStackTrace(this,this.constructor)
            }
    }
}

export {ApiError}