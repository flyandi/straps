/**
 * Straps - a modern approach for Affiliate Lead Marketing Landing Pages
 * Copyright (c) 2014 - All rights reserved
 * 
 * written by Andy Gulley (http://www.github.com/flyandi/straps/)
 * 
 * License: http://www.gnu.org/licenses/gpl.html GPL version 2 or higher
 */


/**
 * (constants)
 */


var
    // global
    STRAPS_LIB_SELF = "straps.js",
    STRAPS_LIB_DEBUG = true,

    // Structs
    STRAPS_ATTRIBUTES = ['s-', 'straps-'],

    STRAPS_TAGS = {
        div: 'div',
        form: 'form',
        css: 'link',
        link: 'link',
        script: 'script',
    },

    STRAPS_CLASS_OPERATION = {
        add: 0,
        remove: 1,
        replace: 2,
        toggle: 3
    };


/**
 * (Straps) main object
 */

var Straps = {

    // (private)
    modules: {},

    // (register)
    register: function(name, module) {
        // initialize
        var that = this;

        // avoid overwrite
        if(this.modules[name]) return false;

        // process module
        if(module.require) {
            module.require.forEach(function(lib) {
                // single
                if(lib.condition && lib.condition()) return false;
                // attach 
                that.__attachscript(lib.src);
            });
        }

        // assign
        this.modules[name] = module;
    },

    // (cycleAttributes)
    cycleAttributes: function(target, map, settings) {
        // init
        var that = this;
        // settings
        settings = settings ? settings : {};
        // cycle
        map.cycle(function(key, params) {
            // get value
            var value =  that.attribute(target, key, false, settings.nostrap);
        
            // validate
            if(value) {
                switch(true) {
                    case typeof params == "function":
                        params(value.value, value);
                        break;

                    case typeof params == "object" && typeof params[1] == "function":
                        if(value.value.toLowerCase() == params[0].toLowerCase()) {
                            params[1](value.value, value);
                        }
                        break;
                }
            }
        });
    },

    // (attribute)
    attribute: function(target, name, def, nostrap) {
        // create name
        if(!nostrap) STRAPS_ATTRIBUTES.forEach(function(s) {
            if(target.attributes[s+name]) {
                name = s + name;
            }
        });

        // check
        return target.attributes[name] ? target.attributes[name] : (def ? def : false);
    },

    // (find) 
    find: function(query, target, fn) {
        // check callback
        if(typeof target == "function") {
            fn = target;
            target = false;
        }
        // test target
        if(!target) target = document;
        // execute query
        var result = target.querySelectorAll(query);
        // run cycle
        switch(true) {
            case typeof fn == "function":
                result.cycle(function(i, r) {
                    if(r instanceof HTMLElement) {
                        fn(r);
                    }
                });
                break;

            case typeof fn == "number":
                result = result[fn] && result[fn] instanceof HTMLElement ? result[fn] : false;
                break;

            default:
                result = result.toElementList();
                break;
        } 
        // return result
        return result;
    },


    // (classnames)
    classnames: function(target, names, operation) {
        try {
            // init
            var onames = target.className.split(" ");
            // check names
            if(typeof names == "string") names = names.split(",");
            // cycle
            if(names instanceof Array) {
                // no replace
                switch(true) {
                    // replace
                    case operation = STRAPS_CLASS_OPERATION.replace:
                        onames = names;
                        break;

                    // add/remove
                    default:
                        names.forEach(function(name) {
                            switch(true) {
                                case operation == STRAPS_CLASS_OPERATION.remove: 
                                    var index = onames.indexOf(name);
                                    if(index != -1) onames.splice(index, 1);
                                    break;
                                default:
                                    if(onames.indexOf(name) == -1) onames.push(name);
                                    break;
                            }
                        });
                }
                // assign
                target.className = onames.join(" ");
            }
        } catch(e) {
           console.log(e);
        }
    },



    // (__load) 
    __load: function() {
        // initialize
        var that = this;

        // get awareness
        this.scriptTag = document.querySelector("script[src$='straps.js']");

        // verify
        if(this.scriptTag) {
            // get path
            this.scriptPath = this.scriptTag.src.replace(STRAPS_LIB_SELF, "");
            // map
            this.cycleAttributes(this.scriptTag, {
                autodetect: ['true', function() {
                    that.__autodetect();
                }],
            }, {nostrap: true});
        }
    },

    // (__autodetect)
    __autodetect: function() {
        // initialize
        var that = this;

        // autodetection
        ({
            form: function(anchor) {
                // attach to form
                that.__attach('form', anchor);
            },
        }).cycle(function(tag, exec) {
            // get tags
            var matches = document.querySelectorAll(tag);
            // validate
            if(matches) Array.prototype.slice.call(matches).forEach(function(anchor) {
                exec(anchor);
            });
        });
    },

    // (__attach)
    __attach: function(name, target) {
        // initialize

        var that = this,
            module = this.__requiremodule(name, function() {
                that.__attach(name, target);
            });

        // verify
        if(!module) return;

        // try module
        try {
            // create instance
            var instance = module.invoke(this);
            
            // attach instance
            instance.attach(target);

        } catch(e) {
            alert(e);
        }   
    },

    // (__requiremodule)
    __requiremodule: function(name, cb) {
        // verify module
        var that = this, module = this.modules[name] ? this.modules[name] : false;

        // lazy load
        if(!module && !arguments[2])  {
            // attach
            this.__attachscript(this.scriptPath + 'modules/straps.' + name + '.js', function() {
                // execute callback
                if(typeof cb == "function") {
                    cb();
                }
            });
            // exit
            return false;
        }
        // return module
        return module;
    },


    // (__attachscript)
    __attachscript: function(src, cb, tag) {
        var head = document.querySelector('head'),
            element = false;

        // switch tag type
        switch(tag) {
            case STRAPS_TAGS.css:
                element = document.createElement('link');
                element.href = src;
                element.rel = "stylesheet";
                break;
            default:
                element = document.createElement('script');
                element.type= 'text/javascript';
                element.src= src;
                break;
        }
        // event
        if(typeof cb == "function") element.onload = function() {
            cb();
        };
        // run
        head.appendChild(element);
    },

    // (__prototypes)
    __prototypes: function() {

        // object::cycle
        Object.prototype.cycle = function(fn) {
            var ref = this;
            Object.keys(this).forEach(function(key) {
                if(typeof fn == "function") {
                    try {
                        fn(key, ref[key]);
                    } catch(e) {
                        this.__report(e);
                    }
                }
            });
        };

        // object::toElementList
        Object.prototype.toElementList = function() {
            var list = [];
            this.cycle(function(index, o) {
                if(o instanceof HTMLElement) list.push(o);
            });
            return list;
        };

        // array::cycle
        Array.prototype.cycle = function(fn) {
            this.forEach(function(value, key) {
                if(typeof fn == "function") fn(key, value);
            });
        };

        // straps::rid
        Straps.rid = function(c) {
            return (c ? c : 'xxxysxx4xxxxxxxxxxx').replace(/[xy]/g, function(c){var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8); return v.toString(16);}).toUpperCase();
        };
    },

    // (__report)
    __report: function(e) {
        if(STRAPS_LIB_DEBUG) {
            console.log(e);
        }
    }

};


/** 
  * (boot)
  */
(function() {
    // load prototypes
    Straps.__prototypes();

    // load bootstrap
    window.addEventListener("load", function() {
        setTimeout(function() {
            Straps.__load();
        }, 1);
    }, false);
})();

