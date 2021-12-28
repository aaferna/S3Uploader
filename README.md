s3Uploader es un servicio multiplataforma, pensado para escuchar distintos directorios a la vez y realizar la subida de contenidos a Amazon S3. 
De la misma forma, realizara el respawn de los directorios en cada reinicio en búsqueda de archivos nuevos para subir, con los cuales una vez en S3 los elimina del directorio que este y registrara ese movimiento en sus logs.

## Archivos de Configuracion

### config.json
En este se especificará las credenciales de acceso a S3 y el bucket donde deberá guardar los archivos a subir. Este Modulo funciona con el nombre del Bucket explicito o con su ARN de Access Point.

```json
{
    "awsKey": "AKIASZKEPFS4R6J3T4MM",
    "awsAccessKey": "gchZQDt7eNsFnIZsd69oL4ToJ38J5AlvsAW5NBdr",
    "awsBucket": "arn:aws:s3:sa-east-1:191806516409:accesspoint/bridgeston-s4-ap"
}
```
### watchdir.json
Este archivo nos ofrece configurar los directorios que se debe vigilar, etiquetas a asociar y el tipo de almacenamiento que queremos darle en S3 a este.


```json
[
    {
        "dir": "./demo",
        "tagging": "Directorio=files/demo&Otra Etiqueta=value2",
        "storageType": ""
    }
]
```
El `storageType` es el tipo de almacenamiento que quiere darle a los archivos de ese directorio en particular y dispone de las siguientes opciones pero de manera predeterminada, se establece en STANDARD

- STANDARD
- REDUCED_REDUNDANCY
- STANDARD_IA
- ONEZONE_IA
- INTELLIGENT_TIERING
- GLACIER
- DEEP_ARCHIVE
- OUTPOSTS
- GLACIER_IR

## Logs
Se encontraran en < Directorio de la App >/log donde se encontraran dos tipos de carpetas `error` y `upload`, donde se especificara en cada uno el movimiento de los registros que se concretan por día.

### Advertencia

- Por una cuestion de comportamiento desde el lado de Amazon con su SDK, todo archivo con caracteres extraños en su nombre debe ser tratado. Por tal, aquel que disponga de caracteres extraños se reemplazara con un "_".

### Release Notes

- 1.0 Version Inicial
