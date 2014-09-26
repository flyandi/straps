/**
 * Straps - a modern approach for Affiliate Lead Marketing Landing Pages
 * Copyright (c) 2014 - All rights reserved
 * 
 * written by Andy Gulley (http://www.github.com/flyandi/straps/)
 * 
 * License: http://www.gnu.org/licenses/gpl.html GPL version 2 or higher
 */


/**
  * (DEBUG)
  */
var jd = function(s) {alert(JSON.stringify(s));};


/**
 * (constants)
 */


var
    // global
    LS_LIB_SELF = "straps.js",

    // Structs
    LS_TAGS = {
        div: 'div',
        form: 'form',
        css: 'link',
        link: 'link',
        script: 'script',
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
        // settings
        settings = settings ? settings : {};
        // cycle
        map.cycle(function(key, params) {
            // prepare key
            if(!settings.nostrap) key = 'straps-' + key;

            // get attribute
            var attribute = target.attributes[key];
    
            // validate
            if(attribute) {
                if(attribute.value.toLowerCase() == params[0].toLowerCase()) {
                    params[1]();
                }
            }
        });
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
            this.scriptPath = this.scriptTag.src.replace(LS_LIB_SELF, "");
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
        // try module
        try {
            // create instance
            var instance = module.invoke(this);
            
            // attach instance
            instance.attach(target);

        } catch(e) {
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
                if(typeof(cb) == "function") {
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
            case LS_TAGS.css:
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
        if(typeof(cb)=="function") element.onload = function() {
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
                fn(key, ref[key]);
            });
        };
    },

};


/** 
  * (boot)
  */
(function() {
    // load prototypes
    Straps.__prototypes();

    // load bootstrap
    document.addEventListener("DOMContentLoaded", function() {
       Straps.__load();
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
 * (constants)
 */

var LSFILTER_EMAIL = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


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

        },

        // (__autosize)
        __autosize: function() {

            // get aspects
            var aspects = {
                width: this.target.clientWidth
            };

            // find fields and just labels
            this.target.find("field").each(function() {
                // initial
                var label = $(this).find("label"),
                    inputs = $(this).find("input:not([type=submit]) ,select");

                // calculate
                var labelWidth = aspects.width * 0.3,
                    inputWidth = Math.round(((aspects.width * 0.6) - ((inputs.length - 1) * 3)) / inputs.length);


                // assign
                label.width(labelWidth);
                inputs.width(inputWidth);



            });

            // assign button
            this.target.find("input[type=submit],button").addClass("-straps-button");
            // assign primary button
            this.target.find("[straps-primary-submit]").addClass("-straps-button-primary");

        },
    };

    return __straps_instance_form;
})();


    /*


$(function(){
    //original field values
    var field_values = {
        'username': 'username',
        'password'  : 'password',
        'cpassword' : 'password',
        'firstname'  : 'first name',
        'lastname'  : 'last name',
        'email'  : 'email address'
    };

    $.each(field_values, function(name, value) {
        $("#"+name).inputfocus({value: value });
    });

    //reset progress bar
    $('#progress').css('width','0px');
    $('#progress_text').html('0% Complete');

    //first_step
    $('form').submit(function(){ return false; });
    // initialize
    var validatorEmail = 
  

    var validatorSections = function(sections) {

        $.each(sections, function(index, section) {    
            // prepare section
            var section = $.extend({}, {progress: false, progressText: false, nextbutton: '.next_btn', prevbutton: '.pre_btn'}, section);

            // validator
            $(section.target).find(section.nextbutton).bind("click", function(ev) {
                // event handler
                ev.stopPropagation();

                // process errors 
                $(section.target).find("input:not([type=button]),textarea,select").removeClass("error valid").each(function() {
                    // get value
                    var value = $(this).val(), error = false;
                    // check field properties
                    switch(true) {

                        // (email validation)
                        case $(this).hasClass("validate-email") || $(this).attr("validate") == "email":
                            error = !validatorEmail.test(value);
                            break;

                        // (select)
                        case $(this).attr("tagName").toLowerCase() == "select":
                            error = value == "";
                            break;

                        // (default) string
                        default:
                            // optional exception test;
                            if($(this).attr("validate") != "optional") {
                                error = value.length < 4 || value == field_values[$(this).attr("id")];
                            }
                            break;
                    }

                    // process 
                    switch(error) {
                        case true: 
                            $(this).addClass("error").effect("shake", { times:3 }, 50);
                            break;
                        default:
                            $(this).addClass("valid");
                            break;
                    }
                });


                // analyse
                if($(section.target).find(".error").length == 0) {
                    // process to text
                    if(section.progress) {
                        $("#progress_text").html(section.progressText);
                        $("#progress").css("width", section.progress);
                    }

                    // switch page
                    $(section.target).slideUp();
                    $(section.target).next().slideDown();
                };

                // cap events
                return false;
            });

            // prev button
            $(section.target).find(section.prevbutton).bind("click", function(ev) {
                // event handler
                ev.stopPropagation();
                // cycle    
                $(section.target).slideUp();
                $(section.target).prev().slideDown();
            });
        });
    };


    // (bootstrap)
    validatorSections([
        {target: '#first', progress: 105, progressText: '50% Complete'},
        {target: '#second', progress: 210, progressText: '100% Complete'},
        {target: '#third'}
    ]);



});*/



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

        // (private)
        strapsform: false,

        // (constructor)
        __construct: function() {

        },

        // (attach)
        attach: function(target) {
            // initialize
            var that = this;

            // assign target
            this.target = $(target);

            // check attributes
            this.parent.cycleAttributes(target, {
                styles: ['true', function() {
                    // add class
                    that.target.addClass("-straps-form");
                    // assign
                    that.strapsform = true;
                }]
            });


/*
            // attach events
            $(target).bind({
                'submit': function() {
                    
                    return false;
                }
            });*/

            // apply strapsform
            if(this.strapsform) {
                this.__applystyles();
            }

        },

        // (__applystyles)
        __applystyles: function() {

            // get aspects
            var aspects = {
                width: this.target.width()
            };

            alert(aspects.width);

            // find fields and just labels
            this.target.find("field").each(function() {
                // initial
                var label = $(this).find("label"),
                    inputs = $(this).find("input:not([type=submit]) ,select");

                // calculate
                var labelWidth = aspects.width * 0.3,
                    inputWidth = Math.round(((aspects.width * 0.6) - ((inputs.length - 1) * 3)) / inputs.length);


                // assign
                label.width(labelWidth);
                inputs.width(inputWidth);



            });

            // assign button
            this.target.find("input[type=submit],button").addClass("-straps-button");
            // assign primary button
            this.target.find("[straps-primary-submit]").addClass("-straps-button-primary");

        },
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
