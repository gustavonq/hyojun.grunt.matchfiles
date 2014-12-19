module.exports = function(grunt) {
'use strict';
	grunt.initConfig({
		matchfiles: grunt.file.readJSON("matchfiles.json")
	});
	grunt.loadTasks('tasks');
};