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
            'input, textarea': function(anchor) {
                //that.__attach('spam', anchor);
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

;/**
 * Straps - a modern approach for Affiliate Lead Marketing Landing Pages
 * Copyright (c) 2014 - All rights reserved
 * 
 * written by Andy Gulley (http://www.github.com/flyandi/straps/)
 * 
 * License: http://www.gnu.org/licenses/gpl.html GPL version 2 or higher
 */


/**
 * (__straps_instance_form) Object
 */
 
var __straps_instance_form = (function(){

    function __straps_instance_form(origin) {
        // settings
        this.parent = origin;

        // run construct
        this.__construct();
    }

    __straps_instance_form.prototype = {

        // (private)
        strapsform: false,

        // (constructor)
        __construct: function() {

        },

        // (attach)
        attach: function(target) {
            // initialize
            var that = this;

            // assign reference
            this.target = target;


            // check attributes
            this.parent.cycleAttributes(target, {
                autosize: ['true', function() {
                    // add class
                    that.__autosize();
                }]
            });

            // hook submit
            this.target.addEventListener("submit", function(event) {
                // run validation process
                if(!that.__submithandler()) {
                    event.preventDefault();
                }
            });

        },

        // (__submithandler)
        __submithandler: function() {
            // initialize
            var that = this, violations = 0;


            // get all input
            this.parent.find("input:not([type=submit]),select,textarea", this.target, function(input) {

                // get value of input
                var value = input.value;

        
                // check straps field
                that.parent.cycleAttributes(input, {
                    required: function(filter) {
                        if(!that.__filterstring(value, filter)) {
                            // reported rule violation
                            that.parent.classnames(input, 'straps-violation');
                            // count up
                            violations++;
                        }
                    }
                });


            });

            // validate
            alert(violations);

            return false;
        },




        // (__filterinput)
        __filterstring: function(s, filter, settings) {
            // initialize
            var that = this, result = false;

            // (true)
            switch(true) {

                case (/email/gi).test(filter):
                    result = (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(s);
                    break;

                // (zip)
                case (/zip/gi).test(filter): 
                    result = (/(^\d{5}$)|(^\d{5}-\d{4}$)/).test(s);
                    break;


                // (default) checks if the input is non empty
                case (/true|notempty/gi).test(filter): 
                    result = s || s === 0;  // 0 fix
                    break;

                // default filter
                default:
            } 

            // return filter result
            return result;  
        },

        // (__autosize)
        __autosize: function() {

            // get aspects
            var that = this, aspects = {
                width: this.target.clientWidth,
                ratioLabel: this.parent.attribute(this.target, 'ratio-label', 3) * 0.1,
                ratioInput: this.parent.attribute(this.target, 'ratio-input', 6) * 0.1,
            };

            // find fields
            this.parent.find("field", this.target, function(field) {

                // initial
                var label = that.parent.find("label", field, 0),
                    inputs = that.parent.find("input:not([type=submit]),select", field);


                // calculate
                var labelWidth = aspects.width * aspects.ratioLabel,
                    inputWidth = Math.round(((aspects.width * aspects.ratioInput) - ((inputs.length - 1) * 3)) / inputs.length);

                // assign
                if(label) {
                    label.style.width = labelWidth + "px";
                }

                // cycle inputs
                inputs.cycle(function(i, p) {
                    p.style.width = inputWidth + "px";
                });

            });

        },
    };

    return __straps_instance_form;
})();




/**
 * (register instance)
 */

Straps.register('form', {

    // (invoke)
    invoke: function(origin) {
        // create new instance
        return new __straps_instance_form(origin);
    },
});
;/**
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

/**
 * (__straps_instance_theme) Object
 */
 
var __straps_instance_theme = (function(){

    function __straps_instance_theme(origin) {
        // settings
        this.parent = origin;

        // run construct
        this.__construct();
    }

    __straps_instance_theme.prototype = {

        // (constructor)
        __construct: function() {

        },

        // (attach)
        attach: function(target) {
            // initialize
            var that = this;
        }
    };

    return __straps_instance_theme;
})();


/**
 * (register instance)
 */

Straps.register('theme', {

    // (hooks)
    hooks: ['theme'],

    // (invoke)
    invoke: function(origin) {
        // create new instance
        return new __straps_instance_theme(origin);
    },
});
