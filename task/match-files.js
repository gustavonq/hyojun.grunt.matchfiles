/*
 * grunt-checkfile
 * https://github.com/hankpillow/grunt-checkfile
 */
module.exports = function(grunt) {
'use strict';

	var mixIn          = require("mout/object/mixIn"),
		spawn          = require("child_process").spawn,
		svn            = require("./svn"),
		remote            = require("./remote"),
		StringDecoder  = require('string_decoder').StringDecoder,
		decoder        = new StringDecoder("utf8"),
		forEach        = require("mout/array/forEach");

	grunt.registerMultiTask('matchfiles', 'Match files against svn/git and hosted files. -branch for branch name and -rev for revision', function() {	

		var config = mixIn({
			hosts : null,
			svn : null,
			git : null
		},this.data);

		if (!config.hosts){
			grunt.fail.fatal("No 'hosts' found.");
			return;
		}

		if (!config.svn && !config.git){
			grunt.fail.fatal("No 'svn' or 'git' found.");
			return;
		}

		var done = this.async();

		function svn_check_files (file_list) {
			svn.check_md5(file_list, check_server_files, grunt);
		}

		function check_server_files (value) {
			grunt.log.writeln(("\nMatching md5 across hosts (" + config.hosts.length + ")").yellow);
			remote.check({
				files : value,
				hosts : config.hosts
			}, done, grunt);
		}

		//better object inspection
		if (!!config.svn) {
			svn.list_files(config.svn, svn_check_files , grunt);
		}

	});
};