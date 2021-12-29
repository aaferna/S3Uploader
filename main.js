const   { awsUpload, awsDownload } = require('./modules/core'),
        { loggering } = require('loggering'),
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
global.devflg = false
if(process.argv[3] === "dev"){
    devflg = true
    deployPath = path.dirname(__filename);
    logdir =  path.join(deployPath, "/log/")
    config = path.join(deployPath, "/config.json")
    dirtowatch = path.join(deployPath, "/watchdir.json")
    CONFIGFile = require(config)
} else {
    if(process.argv[2] === "verbose") devflg = true ;
    deployPath = path.dirname(process.execPath),
    logdir =  path.join(deployPath, "/log/"),
    config = path.join(deployPath, "/config.json"),
    dirtowatch = path.join(deployPath, "/watchdir.json")
    CONFIGFile = require(config)
}

loggering('system', {msg: "Sistema Inicializado"} , logdir) ;
if (devflg) console.log(`Sistema Inicializado`);

require(dirtowatch).map(a=>{
    
    loggering('system', {msg: `Monitoreando el directorio ${a.dir}`} , logdir) ;
    if (devflg) console.log(`Monitoreando el directorio ${a.dir}`);

    const   watcher = chokidar.watch(a.dir, { ignored: /(^|[\/\\])\../, persistent: true })
    let     storetype 

    if(arrStore.includes(a.storageType)) storetype = a.storageType;
    else storetype = "STANDARD" ;
                
    watcher.on('add', path => {
        if (devflg) console.log(`Archivo ${path} identificado para subir`);
        
        loggering('upload', `Archivo ${path} identificado para subir`, logdir)
        awsUpload (path, a.tagging, storetype).then(data=>{
            if (devflg) console.log(data);
            loggering('upload', data, logdir)
        }).catch(err => {
            if (devflg && err.length !== 0) console.log(`Archivo ${path} borrado del directorio`);
            if(err.length !== 0) loggering('system', JSON.stringify(err), logdir) ;
        })

    })
    .on('unlink', path => {
        // if (devflg) console.log(`Archivo ${path} borrado del directorio`);
        // loggering('upload', `Archivo ${path} borrado del directorio`, logdir)
    });
})