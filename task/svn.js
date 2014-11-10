exports.list_files = function (config, done, grunt) {
"use strict";
	//libs
	var spawn          = require("child_process").spawn,
		StringDecoder  = require('string_decoder').StringDecoder,
		decoder        = new StringDecoder("utf8"),
		forEach        = require("mout/array/forEach"),
		map            = require("mout/array/map"),
		compact        = require("mout/array/compact"),
		unique         = require("mout/array/unique"),
		trim           = require("mout/string/trim");

	//local stuff
	var urls_to_list = [],
		file_list = [];

	if (config.inspect) {
		forEach(config.inspect, function(value){
			if (typeof value === "string"){
				value = {
					path : value
				};
			}
			urls_to_list.push(value);
		});
	} else {
		urls_to_list.push({path:"",match:""});
	}

	function create_file_list () {
		if (!file_list || !!file_list && !file_list.length){
			grunt.fail.fatal("No file to check!");
			return;
		}
		done(file_list);
	}

	function pick_url () {
		if (!!urls_to_list && !urls_to_list.length) {
			grunt.log.writeln((file_list.length + " files found matching the pattern.").grey);
			grunt.log.writeln();
			grunt.log.writeln("Checking md5 hash...".yellow);
			create_file_list();
			return;
		}
		list_files(urls_to_list.pop());
	}

	function list_files (blob) {

		if (!blob){
			grunt.fail.fatal("got invalid blob to inspect");
			return;
		}

		var branch = grunt.option("branch") || grunt.option("b");
		if (!!branch){
			config.url = config.url.replace("{{branch}}", branch);
		}

		var url = (config.url + blob.path),
			svn = null,
			args = ["ls", url];

		grunt.log.writeln("Listing files under path:".yellow);
		grunt.log.writeln("+ " + url);

		try {
			svn = spawn("svn",args);
		} catch (err) {
			grunt.log.writeln(err);
			grunt.fail.fatal("Failed to run svn command");
			return;
		}

		svn.stdout.on("data", function(data){
			if (!data) {
				grunt.fail.fatal("stdout:: failed to list files one '" + url + "'");
				return;
			}
			var result = decoder.write(data).split("\n");
			result = map(result, function (value) {
				value = trim(value || "");
				if (!!value.match( blob.match || "" )) {
					var foo = {
						"path" : blob.path + "/" + value,
						"host" : config.url,
						"rev" : grunt.option("rev") || grunt.option("r")
					};
					foo.url = foo.host + foo.path + (!!foo.rev ? ("@"+foo.rev) : "");
					return foo;
				}
				return null;
			});
			result = compact(result);
			file_list = file_list.concat(result);
		});

		svn.stderr.on("data", function (data) {
			grunt.log.writeln(data);
			grunt.fail.fatal("stderr:: failed to list svn files at '" + config.url + "'");
			return;
		});

		svn.on('close', function () {
			file_list = unique(file_list);
			pick_url();
		});
	}

	pick_url();

};

exports.check_md5 = function (file_list, done, grunt) {
"use strict";

	if (!file_list || !!file_list && !file_list.length){
		grunt.fail.fatal("No file to check!");
		return;
	}

	//libs
	var spawn          = require("child_process").spawn,
		StringDecoder  = require('string_decoder').StringDecoder,
		decoder        = new StringDecoder("utf8"),
		forEach        = require("mout/array/forEach"),
		crypto         = require('crypto'),
		md5sum;

	var queue =  [].concat(file_list),
		report = [];

	function cat_file (item) {
		var svn = null,
			args = ["cat", item.url],
			hash = "";

		try {
			svn = spawn("svn",args);
		} catch (err) {
			grunt.log.writeln(err);
			grunt.fail.fatal("Failed to run svn command");
			return;
		}

		svn.stdout.on("data", function(data){
			if (!data) {
				grunt.fail.fatal("stdout:: failed to list files one '" + item.url + "'");
				return;
			}
			hash += decoder.write(data);
		});

		svn.stderr.on("data", function (data) {
			grunt.log.writeln(data);
			grunt.fail.fatal("stderr:: failed to list svn files at '" + item.url + "'");
			return;
		});

		svn.on('close', function () {
			if (!!hash) {
				md5sum = crypto.createHash("md5");
				md5sum.update(hash);
				var blob = {
					file : item.path,
					url : item.url,
					md5 : md5sum.digest('hex')
				};
				report.push(blob);
				grunt.log.writeln("+ " + item.url.replace(item.host,"") + " ("+report.length+"/"+file_list.length+") ");
			}
			hash = null;
			check_next_file();
		});
	}

	function check_next_file () {
		if (!queue.length){
			done(report);
			return;
		}
		cat_file(queue.shift());
	}

	check_next_file();
};