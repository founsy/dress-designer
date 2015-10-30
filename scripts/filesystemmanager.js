/*!
 * Html5 LocalFileSystem polymer webcomponent  
 *
 * © AOÛT 2010 - MAI 2014 | Stéphane Labbé
 * Released under the MIT license
 * https://github.com/asicfr/polymerFileSystem/blob/master/LICENSE.txt
 */

'use strict';

var fileSystemManager = (function() {
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

	var data = {};
	data.fs = null;
	data.entries = [];
	data.initStatus = false;
	data.error = null;
	
	var onError = function(e) {
		var msg = '';
		switch (e.code) { // Warn : FileError deprecated
			case FileError.QUOTA_EXCEEDED_ERR:
				msg = 'QUOTA_EXCEEDED_ERR';
				break;
			case FileError.NOT_FOUND_ERR:
				msg = 'NOT_FOUND_ERR';
				break;
			case FileError.SECURITY_ERR:
				msg = 'SECURITY_ERR';
				break;
			case FileError.INVALID_MODIFICATION_ERR:
				msg = 'INVALID_MODIFICATION_ERR';
				break;
			case FileError.INVALID_STATE_ERR:
				msg = 'INVALID_STATE_ERR';
				break;
			default:
				msg = 'Unknown Error';
				break;
		};
		console.log('Error', e);
		data.error = msg;
	};

	var dateToString = function(date) {
		var curr_date = date.getDate();
		var curr_month = date.getMonth();
		curr_month++;
		var curr_year = date.getFullYear();
		var curr_hour = date.getHours();
		var curr_minutes = date.getMinutes();
		return (curr_date + "/" + curr_month + "/" + curr_year + " " + curr_hour + ":" + curr_minutes);
	};

	var toArray = function(list) {
		return Array.prototype.slice.call(list || [], 0);
	};

	// construtor
	var fileSystemManager = function(mycallBackFsmChangeState) {
		console.log("init file system ... please wait");
		data.mcallBackFsmChangeState = mycallBackFsmChangeState;
		if (window.requestFileSystem) {
			console.log("requestFileSystem");
			window.requestFileSystem(window.TEMPORARY, 10 * 1024 * 1024, 
				function(_fs) {
					console.log("capture fs");
					data.fs = _fs;
					data.initStatus = true;
					console.log("init file system complet");
					data.mcallBackFsmChangeState();
				}, onError);
		} else {
			console.log('file system not supported !!!');
			data.error = "file system not supported !";
		}
		console.log("end init file system");
	};

	// public functions
	fileSystemManager.prototype = {
		setCallBackAfterLoad : function(myCallBack) {
			console.log("setCallBackAfterLoad");
			data.loadCallBack = myCallBack;
		},
		isInit : function () {
			console.log("isInit : " + data.initStatus);
			return data.initStatus;
		},
		isFsOk : function () {
			return (data.fs !== null);
		},
		getError : function () {
			console.log("getError : " + data.error);
			return data.error;
		},
		loadFiles : function () {
			// Call the reader.readEntries() until no more results are returned.
			console.log("loadFiles");
			data.entries = [];
			if (data.fs !== null) {
				console.log("data.fs not null");
				var dirReader = data.fs.root.createReader();
				var readEntries = function() {
					console.log("start readEntries on data.fs");
					dirReader.readEntries(function(results) {
						if (!results.length) {
							console.log("readEntries empty");
							data.entries.sort();
							console.log("readEntries size : " + data.entries.length);
							data.loadCallBack(data.entries);
						} else {
							console.log("readEntries add " + results.length + " results");
							var myArray = toArray(results);
							var arrayLength = myArray.length;
							// add property fileURL, size and modificationTime to each file entry to let polymer use it in expression
							for (var i = 0; i < arrayLength; i++) {
								myArray[i].fileURL = myArray[i].toURL();
								myArray[i].getMetadata(function(metadata) { 
									console.log("getMetadata of " + this.name);
									this.fileSize = metadata.size;
									this.fileModificationTime = dateToString(metadata.lastModifiedDate);
								}.bind(myArray[i]), onError);
							}
							data.entries = data.entries.concat(myArray);
							console.log("launch readEntries again");
							readEntries();
						}
					}, onError);
				};
				readEntries();
			} else {
				console.log("fs null");
			}
			console.log("fin loadFiles");
		},
		removeFile : function (fileName) {
			console.log("remove file : " + fileName);

			// Too much bind to to, we prefere capturing current context
			var currentThis = this;
			data.fs.root.getFile(fileName, {create: false}, function(fileEntry) {
			    fileEntry.remove(function() {
			    	console.log('File removed.');
			    	console.log('refresh list.');
					currentThis.loadFiles();
			    }, onError);
			}, onError);
		},
		addFile : function (inputFile) {
			console.log("add file: " + inputFile);

			// Too much bind to to, we prefere capturing current context
			var currentThis = this;
			var files = inputFile.files;
			var myfile = files[0];
            console.log(myfile);
			if(!myfile) return;
			data.fs.root.getFile(
				myfile.name,
				{ create: true },
				function(fileEntry) {
					// create writer
					fileEntry.createWriter(function(writer) {
						writer.onerror = onError;
						
						// this will read the contents of the current file
						var myFileReader = new FileReader;
						myFileReader.onloadend = function() {
							// use blob to add file
							var bb = new Blob([myFileReader.result]);
							writer.write(bb);
						};
						myFileReader.onerror = onError;
						myFileReader.readAsArrayBuffer(myfile);

				    	console.log('refresh list.');
					    currentThis.loadFiles();
					}, onError);
				}, 
				onError
			);
		}
	};

	return fileSystemManager;
}());
