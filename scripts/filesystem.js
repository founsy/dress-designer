/*!
 * Html5 fileSystem polymer webcomponent  
 */

'use strict';

var fileSystem = (function() {
    
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.URL = window.URL || window.webkitURL;
    
    var FILE_NOT_SUPPORTED = "FileNotSupported";
    
    /**
     * Private Variables
     **/
    var _fs = null;
    var _error = null;
    var _available = false;
    
    /**
     * Private functions
     **/
    
    function _errorHandler(error) {        
        switch (error.code) {        
        case error.FILE_NOT_SUPPORTED:
                _error = 'File API is not supported.';
                break;                        
        case error.QUOTA_EXCEEDED_ERR:
                _error = 'Quota ecceeded.';
                break;
        case error.NOT_FOUND_ERR:
                _error = 'File not found.';
                break;
        case error.SECURITY_ERR:
                _error = 'Security issue.';
                break;
        case error.INVALID_MODIFICATION_ERR:
                _error = 'Invalid modification.';
                break;
        case error.INVALID_STATE_ERR:
                _error = 'Invalid state.';
                break;
        case error.NOT_READABLE_ERR:
                _error = 'File is not readable.';
                break; 
        case error.ABORT_ERR:
                _error = 'Can not read this file.';
                break;                        
        default:
                _error = 'Unknown error.';
                break;
        };
        //console.log('Error: ' + _error);
    } 
    
    /**
     * Public Functions
     **/
    return {
        
        /**
         * Getters
         **/
        get TYPE_CSV() { 
            return "text/csv"; 
        },        
        get TYPE_JPEG() { 
            return "image/jpeg"; 
        },
        get available() {
            return _available;
        },
        
        init: function(callback) {
            console.log("Initialize file system.");
            
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                console.log("The File APIs is fully supported :)");
            } else {
                _errorHandler(new Error(FILE_NOT_SUPPORTED)); 
                console.log(_error);
            }
            
            if(!window.requestFileSystem) {
                _available = false;
                throw new Error("File system is not available");
            }
            else {
                window.requestFileSystem(window.TEMPORARY, 50*1024*1024 /*5MB*/, function(fs){
                    console.log('Opened file system: ' + fs.name);
                    _fs = fs;
                    _available = true;
                    callback.call(this);
                }, _errorHandler);
            }            
        },
        
        /**
         * Get file by name
         * @param path The File path
         * @return The promise with the File object
         **/
        getFileByName: function(path, responder) {
            console.log('Get file: ' + path);
            
            return new Promise(function(resolve, reject) {
            
                function fileHandler(fileEntry) {                
                    fileEntry.file(function(file) {
                        resolve(file);
                    }, errorHandler);                
                }
                
                function errorHandler(error) {
                    _errorHandler(error);
                    reject(_error);
                }                
                
                _fs.root.getFile(path, {}, fileHandler, errorHandler);
            });            
        },
        
        /**
         * ReadFileAsText
         * @param file The File path
         * @return The promise with text data
         **/
		readTextFile: function(file) {
            console.log('Read file: ' + file);  
            
            return new Promise(function(resolve, reject) {
                
                var reader = new FileReader();
                
                reader.onloadend = function(event) {
                    resolve(event.target.result);
                }
                reader.onabort = function(event) {
                    reject(event);
                }
                reader.onerror = function(event) {
                    _errorHandler(event.target.error);
                    reject(_error);
                }
                
                reader.readAsText(file);
                
            });
            
            
        },
        
        /**
         * Write in a local file
         * @param filename Example: data.json
         * @param filecontent Example: a json string 
         * @param mimetype Example: "application/json"
         * @param callback
         * @return url or error
         **/
        writeFile: function(filename, filecontent, mimetype) {
            console.log('Write file: ' + filename);
            
            return new Promise(function(resolve, reject) {
                
                // create the blob
                var blob = new Blob([filecontent], {type: mimetype});
                console.log( Math.round((blob.size/1024/1024), 0) + " Mo." );

                console.log('Opened temporary file system: ' + _fs.name);
                _fs.root.getFile(filename, {create: true}, fileHandler, _errorHandler);

                function fileHandler(fileEntry) {
                    fileEntry.createWriter(writeHandler, _errorHandler);
                }

                function writeHandler(fileWriter) {
                    
                    // Now write the file
                    fileWriter.write(blob);
                    
                    fileWriter.onwriteend = function(event) {
                        var url  = window.URL.createObjectURL(blob);
                        console.log('Write completed at : ' + url);
                        resolve(url);
                    };

                    fileWriter.onerror = function(event) {
                        _errorHandler(event.target.error);
                        reject(_error);
                    };

                }
            });
        },
        
        /**
         * Write in a local file
         * @param path Example: data.json
         * @param responder
         * @return Array or error
         **/
        readDirectory: function() {
            
            console.log('Read Directory. ');
            
            var reader = _fs.root.createReader();
            var entries = [];
            
            // Call the reader.readEntries() until no more results are returned.
            var readEntries = function() {                
                reader.readEntries(function(results) {                    
                    
                    console.log(results);
                    
                }, _errorHandler);
            };
            
            // Start reading directories
            readEntries();
        }
        
    };
    
	return fileSystem;
}());
