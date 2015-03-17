var
		StringDecoder  = require('string_decoder').StringDecoder,
		decoder        = new StringDecoder("utf8"),
		forEach        = require("mout/array/forEach"),
		map            = require("mout/array/map"),
		compact        = require("mout/array/compact"),
		unique         = require("mout/array/unique"),
		trim           = require("mout/string/trim"),
		crypto         = require('crypto') ;

exports.list_files = function (config, done, grunt) {
"use strict";

	var spawn = require("child_process").spawn;
	var path_to_list = [], file_list = [];

	if (config.inspect) {
		forEach(config.inspect, function(value){
			if (typeof value === "string"){
				value = {
					path : value
				};
			}
			path_to_list.push(value);
		});
	} else {
		path_to_list.push({path:"",match:""});
	}

	function notify_local_done () {
		if (!file_list || !!file_list && !file_list.length){
			grunt.fail.fatal("No file to check!");
			return;
		}
		done(file_list);
	}

	function inspect_next_path () {
		if (!!path_to_list && !path_to_list.length) {
			grunt.log.writeln((file_list.length + " files found matching the pattern.").grey);
			grunt.log.writeln();
			grunt.log.writeln("Checking md5 hash...".yellow);
			notify_local_done();
			return;
		}
		list_files(path_to_list.pop());
	}

	function list_files (blob) {

		if (!blob){
			grunt.fail.fatal("got invalid blob to inspect");
			return;
		}

		var url = blob.path,
			cmd = null,
			args = ["ls-files", url];

		grunt.log.writeln("Listing files under path:".yellow);

		try {
			cmd = spawn("git",args);
		} catch (err) {
			grunt.log.writeln(err);
			grunt.fail.fatal("Failed to running command: \n".red + "\ngit " + args.join(" "));
			return;
		}

		cmd.stdout.on("data", function(data){
			if (!data) {
				grunt.fail.fatal("stdout:: failed to list files one '" + url + "'");
				return;
			}
			var result = decoder.write(data).split("\n");
			result = map(result, function (value) {
				value = trim(value || "");
				if (!!value.match( blob.match || "" )) {
					var foo = {
						"path" : value,
						"rev" : grunt.option("rev")||"HEAD"
					};
					return foo;
				}
				return null;
			});
			result = compact(result);
			file_list = file_list.concat(result);
		});

		cmd.stderr.on("data", function (data) {
			grunt.log.writeln(data);
			grunt.fail.fatal("stderr:: failed to list files '" + url + "'");
			return;
		});

		cmd.on('close', function () {
			file_list = unique(file_list);
			var total = file_list.length ? ("("+file_list.length+") ").green : "(0) ".red
			grunt.log.writeln(total + "- " + url);
			inspect_next_path();
		});
	}

	inspect_next_path();

};

exports.check_md5 = function (file_list, done, grunt) {
"use strict";

	if (!file_list || !!file_list && !file_list.length){
		grunt.fail.fatal("No file to check!");
		return;
	}

	var spawn          = require("child_process").spawn, md5sum;
	var queue =  [].concat(file_list), report = [];

	function cat_file (item) {

		var cmd = null;
		var	args = ["show", item.rev + ":" + item.path];
		var hash = "";

		try {
			cmd = spawn("git", args);
		} catch (err) {
			grunt.log.writeln(err);
			grunt.fail.fatal("Failed to run git command");
			return;
		}

		cmd.stdout.on("data", function(data){
			if (!data) {
				grunt.fail.fatal("stdout:: failed to list files one '" + item.path + "'");
				return;
			}
			hash += decoder.write(data);
		});

		cmd.stderr.on("data", function (data) {
			grunt.log.writeln(data.toString().red);
				var blob = {
					file : item.path,
					md5 : undefined
				};
				report.push(blob);
			return;
		});

		cmd.on('close', function () {

			if (!!hash) {
				md5sum = crypto.createHash("md5");
				md5sum.update(hash);

				var blob = {
					file : item.path,
					md5 : md5sum.digest('hex')
				};

				report.push(blob);
				grunt.log.writeln("+ " + item.path + " ("+report.length+"/"+file_list.length+") ");
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
