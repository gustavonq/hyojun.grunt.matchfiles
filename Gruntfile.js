/*
 * grunt-checkfile
 * https://github.com/hankpillow/grunt-matchfiles
 */
module.exports = function(grunt) {
'use strict';
	grunt.initConfig({
		matchfiles: grunt.file.readJSON("matchfiles.json")
	});
	grunt.loadTasks('task');
};