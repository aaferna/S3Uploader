const   { awsUpload, awsDownload } = require('./modules/core'),
        { loggering } = require('loggering')
        chokidar = require('chokidar'),
        path = require('path'),
        arrStore = [
            "STANDARD",
            "REDUCED_REDUNDANCY",
            "STANDARD_IA",
            "ONEZONE_IA",
            "INTELLIGENT_TIERING",
            "GLACIER",
            "DEEP_ARCHIVE",
            "OUTPOSTS",
            "GLACIER_IR"
        ]

global.deployPath

if(process.argv[2] === "dev"){
    deployPath = path.dirname(__filename);
    logdir =  path.join(deployPath, "/log/")
    config = path.join(deployPath, "/config.json")
    dirtowatch = path.join(deployPath, "/watchdir.json")

} else {
    deployPath = path.dirname(process.execPath);
    logdir =  path.join(deployPath, "/log/")
    config = path.join(deployPath, "/config.json")
    dirtowatch = path.join(deployPath, "/watchdir.json")
}

global.CONFIGFile = require(config)

require(dirtowatch).map(a=>{

    const   watcher = chokidar.watch(a.dir, { ignored: /(^|[\/\\])\../, persistent: true })
    let     storetype 

    if(arrStore.includes(a.storageType)) storetype = a.storageType;
    else storetype = "STANDARD" ;
                
    watcher.on('add', path => {
        
        loggering('upload', `Archivo ${path} identificado para subir`, logdir)
            awsUpload (path, a.tagging, storetype).then(data=>{
                loggering('upload', data, logdir)
            }).catch(err => {
                loggering('error', JSON.stringify(err), logdir)
            })
    })
    .on('unlink', path => {
        loggering('upload', `Archivo ${path} borrado del directorio`, logdir)

    });
})