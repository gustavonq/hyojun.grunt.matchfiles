grunt-matchfiles
==================

grunt task designed to list files on svn/git repo, grab the md5 hash and compare those into a list of remote hosts. Good for making sure that you versioned code is the same you have on remote hosts.

##usage

```js
grunt.initConfig({
	"matchfiles" : {
		"desktop": {
			"hosts" : ["http://static1.my-project.com","http://static2.my-project.com"],
			"git" : {
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

###config.[svn/git]

Use this object when your project is being versioned by SVN.

```js
{
	"inspect" : [{
		"path" : "/assets/js/dist/",
		"match" : "\.js$"
	},{
		"path" : "/assets/css-min",
		"match" : "\.css$"
	},
	...]
}
```

* `inspect` Array

	The file list to check the md5 hash will be defined by these targets.

	The object inside this array must follow the pattern:

	```js
	{
		"path" : "path-to-inpect",
		"match" : "regex to match files"
	}
	```

	* `path` : the trailing path that will be applied when listing files (`svn = svn ls`, `git = git ls-tree`) 

	* `match`: a String that will be tested as regex on files, by this way you can define the sort/range of files you want to list.

###config.hosts

This is an Array of hosts you want to check if the files on "svn/git" are matching.

If you have a host `http://foo.com` and you are listing the files (svn or git) on `/assets/foo/*.js`, this means that we will try to find/checksum the files on `http://foo.com/assets/foo/*.js`

> for urls we have wildcards called {{branch}} and {{rev}}, that will be filled with command line arguments:
	
```js
grunt matchfiles:git-target -rev SHA1 
//or
grunt matchfiles:svn-target -rev 123 -branch hot-fix
```


