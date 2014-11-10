grunt-matchfiles
==================

grunt task designed to list files on svn/git repo, grab the md5 hash and compare those into a list of remote hosts. Good for making sure that you versioned code is the same you have on remote hosts.

##usage

```js
grunt.initConfig({
	"matchfiles" : {
		"desktop": {
			"hosts" : ["http://static1.my-project.com","http://static2.my-project.com"],
			"svn" : {
				"url" : "http://my-svn-project.com/{{branch}}/desktop",
				"inspect" : [{
					"path" : "/assets/js-min",
					"match" : "\.js$"
				}]
			}
		},
		"mobile": {
			"hosts" : ["http://static3.my-project.com"],
			"svn" : {
				"url" : "http://my-svn-project.com/{{branch}}/mobile",
				"inspect" : [{
					"path" : "/assets/js-min",
					"match" : "\.js$"
				}]
			}
		}
	}
});
```

##config

The `matchfiles` is [multitask](http://gruntjs.com/api/grunt.task) so the first level of the config defines just the target that will be used.

Each target allows you to define the a svn or git repository.

###config.svn

Use this object when your project is being versioned by SVN.

```js
{
	"url" : "http://my-svn-project.com/{{branch}}/mobile",
	"inspect" : [{
		"path" : "/assets/js/dist/",
		"match" : "\.js$"
	},{
		"path" : "/assets/css-min",
		"match" : "\.css$"
	},...]
}
```

* `url` String

	The svn url. To avoid creating multiplus target because of branches, you can provite the branch you want to inspect by providing the argument `-b`, i.e.:

	`grunt matchfiles:desktop -b FOO`

	To set a specific revision you can provide this info by `-r` argument, i.e.:

	`grunt matchfiles:desktop -b FOO -r 123`

* `inspect` Array

	The file list to check the md5 hash will be defined by these targets.

	The object inside this array must follow the pattern:

	```js
	{
		"path" : "/assets/js/dist/",
		"match" : "\.js$"
	}
	```

	* `path` : the trailing path that will be applied on `url` to list (`svn ls`) the files.

	* `match`: a String that will be tested as regex on files, by this way you can define the sort/range of files you want to list.

###config.hosts

This is an Array of hosts you want to check if the files on "svn/git" are matching.

If you have a host `http://foo.com` and you are listing the files (svn or git) on `/assets/foo/*.js`, this means that we will try to find/checksum the files on `http://foo.com/assets/foo/*.js`