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
	var	rev = grunt.option("rev")||"HEAD";
	grunt.log.writeln(("Listing files on rev: " + rev).yellow);

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
			grunt.log.writeln("_____________________".grey);
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

		var url = blob.path;
		var cmd = null;
		var args = ["ls-files", url];


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
						"rev" : rev
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
			grunt.log.writeln("- matching: '" + (blob.match||"") + "'");
			if (file_list.length){
				grunt.log.writeln(("("+file_list.length+") " + blob.path).green);
			} else {
				grunt.log.writeln(("(0) " + blob.path).red);
			}
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

	var spawn = require("child_process").spawn;
	var md5sum;
	var queue =  [].concat(file_list), report = [];

	function get_cmd_for(cmd, blob){
		var bash;
		var	args;
		if (cmd === "git") {
			args = ["show", blob.rev + ":" + blob.path];
		} else{
			args = ["show", blob.rev + ":" + blob.path];
		}
		try {
			bash = spawn(cmd, args);
		} catch (err) {
			grunt.log.writeln(err);
			return null;
		}
		return bash;
	}

	function cat_file (item) {

		var cmd = get_cmd_for("git", item);
		var hash = "";

		if (!cmd){
			grunt.fail.fatal("Failed during command spawn.");
			return;
		}

		cmd.stdout.on("data", function(data){
			if (!data) {
				grunt.fail.fatal("stdout:: failed to list files on: '" + item.path + "'");
				return;
			}
			hash += decoder.write(data);
		});

		cmd.stderr.on("data", function (data) {
			grunt.log.writeln(("("+report.length+"/"+file_list.length+") " + item.path + " @stderr: " + trim(data.toString())).red );
				var blob = {
					file : item.path,
					md5 : "--------------------------------"
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
				grunt.log.writeln("("+report.length+"/"+file_list.length+") "+ item.path);
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
