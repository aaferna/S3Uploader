const   { unlinkSync, createReadStream, stat } = require('fs'),
        AWS = require('aws-sdk'),
        { basename } = require("path"),
        { loggering } = require('loggering');


// -- Vigilante de Archivos
exports.ControllerFile = (file) => {
  let timer

    return new Promise((resolve, reject) => {
      try {
        let sizeInit = 0
        timer = setInterval(() =>{
            stat(file, (err, stats) =>{

              if(err){
                loggering('system', {file: file, msg: err}, logdir)
                timerClose() 
                reject(false) 
              }

              else {
                if (sizeInit === 0){ sizeInit = stats.mtimeMs } 
                else if (sizeInit === stats.mtimeMs){
                  timerClose()
                  resolve(true)
                } else { sizeInit = stats.mtimeMs }
              }

            })
        }, 5000);
      } catch(err) {
        timerClose() 
        if (devflg) console.log(`error en controllerfile ${err}`);
        loggering('system', err, logdir)
        reject(false) 
      }
      
      const timerClose = () =>{
        clearInterval(timer);
      }

    }).then(null, () => { 
      if (devflg) console.log({err: `el proceso de control se detuvo abruptamente para el archivo ${file}`});
      loggering('system', {err: `el proceso de control se detuvo abruptamente para el archivo ${file}`}, logdir) 
    });
  }

  // -- Upload de File
exports.awsUpload = (file, tagging = "", storageType) =>{
  
  let namewochst = basename(file).replace(/[&\/\\#,áóúéí+()$~%'":*?<>{}]/g, '_')

    return new Promise((resolve, reject) => {

      this.ControllerFile(file).then( (data) => {

        if (data){

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
              if (devflg) console.log({err: `el proceso de subida de archivos a S3 se detuvo abruptamente para el archivo ${file}`, msg: err});
              loggering('system', {err: `el proceso de subida de archivos a S3 se detuvo abruptamente para el archivo ${file}`, msg: err}), logdir
              reject()
            }

            else {
              if (devflg) console.log({
                    status: true,
                    filename: {
                      original: basename(file),
                      inbucket: namewochst
                    },
                    s3response: {
                      ServerSideEncryption: data.ServerSideEncryption ? data.ServerSideEncryption : "No se encuentra encriptado del lado de S3",
                      Location: data.Location,
                      Bucket: data.Bucket
                    }
                });

                try {
                  unlinkSync(file)
                } catch (error) {
                  if (devflg) console.log({err: `existe un error al eliminar el archivo ${file}`});
                  loggering('system', {err: `existe un error al eliminar el archivo ${file}`}, logdir) 
                }
                resolve( {
                  status: true,
                  filename: {
                    original: basename(file),
                    inbucket: namewochst
                  },
                  s3response: {
                    ServerSideEncryption: data.ServerSideEncryption ? data.ServerSideEncryption : "No se encuentra encriptado del lado de S3",
                    Location: data.Location,
                    Bucket: data.Bucket
                  }
              })
            }
        
          })

        }
          
      })
  
    }).then(null, () => { 
      if (devflg) console.log({err: `el proceso de control se detuvo abruptamente para el archivo ${file}`});
      loggering('system', {err: `el proceso de control se detuvo abruptamente para el archivo ${file}`}, logdir) 
    });

}