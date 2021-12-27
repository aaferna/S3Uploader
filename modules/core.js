const   { unlinkSync, createReadStream, writeFileSync, statSync } = require('fs'),
        AWS = require('aws-sdk'),
        { basename } = require("path");


// -- Vigilante de Archivos
exports.ControllerFile = (file) => {

    return new Promise((resolve, reject) => {
      
      let sizeInit = 0,
          timer = setInterval(() =>{
          
            try{
  
              let stats = statSync(file)
  
              if (sizeInit === 0){ sizeInit = stats.mtimeMs } 
              else if (sizeInit === stats.mtimeMs){
                timerClose()
                resolve(true)
              } else { sizeInit = stats.mtimeMs }
            } catch(err) {
              reject(false) 
              timerClose() 
            }
            
          }, 5000);
  
  
      const timerClose = () =>{
        clearInterval(timer);
      }
      
    });
  }


  // -- Upload de File
exports.awsUpload = (file, tagging = "", storageType) =>{
  let namewochst = basename(file).replace(/[&\/\\#,áóúéí+()$~%.'":*?<>{}]/g, '_')

    return new Promise((resolve, reject) => {

      this.ControllerFile(file).then( () => {
       
        let s3 = new AWS.S3({
                accessKeyId: CONFIGFile.awsKey,
                secretAccessKey: CONFIGFile.awsAccessKey
            })

            s3res = s3.upload ({
                Bucket: CONFIGFile.awsBucket,
                Key: namewochst,
                StorageClass: storageType,
                Body: createReadStream(file),
                Tagging: "Filename="+basename(namewochst)+"&"+tagging,
                ContentType: 'application/octet-stream'

            }, (err, data) =>{

              if(err){
                reject({
                    status: false,
                    filename: {
                      original:basename(file),
                      path: file
                    },
                    data : err
                })
              }
              else {
                unlinkSync(file)
                resolve( {
                    status: true,
                    filename: {
                      original: basename(file),
                      inbucket: namewochst
                    },
                    s3response: {
                      ServerSideEncryption: data.ServerSideEncryption,
                      Location: data.Location,
                      Bucket: data.Bucket
                    }
                    
                })
              }
          
            })

          
      })
  
    });

}