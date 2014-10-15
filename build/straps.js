/**
 * Straps Library
 * @version: v1.0.0
 * @author: Andy Gulley
 *
 * Created by Andy Gulley. Please report any bug at http://github.com/flyandi/straps
 *
 * Copyright (c) 2014 Andy Gulley http://github.com/flyandi
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
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

var jd = function(d) {alert(JSON.stringify(d));};    

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

    // (triggerEvent)
    triggerEvent: function(target, name, data) {
        // initialize
        var event;
        // assign
        data = data ? data : {};
        // create event
        if(window.CustomEvent) {
            event = new CustomEvent(name, {detail: data});
        } else {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent(name, true, true, data);
        }
        // dispatch
        target.dispatchEvent(event);
    },

    // (extend)
    extend: function(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
             if (arguments[i].hasOwnProperty(key))
                 out[key] = arguments[i][key];
            }
        }

        return out;
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

            _mask: function(anchor) {
                that.__attach('mask', anchor);
            },

            _theme: function(anchor) {
                that.__attach('theme', anchor);
            },
            
        }).cycle(function(tag, exec) {
            // prepare tag
            if(tag.substr(0, 1) == "_") {
                var d = [];
                STRAPS_ATTRIBUTES.forEach(function(b) {
                    d.push("[" + b + tag.substr(1) + "]");
                });
                tag = d.join(",");
            }

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


        // create instance
            var instance = module.invoke(this);
            
            // attach instance
            instance.attach(target);

        // try module
        try {
           

        } catch(e) {
            console.log(e);
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

;/**
 * Straps Library
 * @version: v1.0.0
 * @author: Andy Gulley
 *
 * Created by Andy Gulley. Please report any bug at http://github.com/flyandi/straps
 *
 * Copyright (c) 2014 Andy Gulley http://github.com/flyandi
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
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
        pattern: false,

        // (constructor)
        __construct: function() {
            // create security pattern
            var s = [], k = false, pattern = '';
            // full pattern
            while(s.length < 22) s.push(s.length);
            // random
            while(pattern.length < 11) {
                var r = Math.round(Math.random() * s.length);
                pattern += String.fromCharCode(65 + s[r]);
                s.splice(r, 1);
            }
            // assign
            this.pattern = pattern;
        },

        // (attach)
        attach: function(target) {
            // initialize
            var that = this;

            // assign reference
            this.target = target;
            this.tokens = {};

            // check attributes
            this.parent.cycleAttributes(target, {
                autosize: ['true', function() {
                    // add class
                    that.__autosize();
                }]
            });

            // hooks
            this.parent.find("input:not([type=submit]),select,textarea", this.target, function(input) {
                that.__naturalhook(input);
            });

            // hook submit
            this.target.addEventListener("submit", function(event) {
                // run validation process
                if(!that.__submithandler()) {
                    event.preventDefault();
                }
            });

            // create naturals
            this.naturals = {
                begin: new Date(),
                _keyticks: [],
                _mouseticks: [],
            };

            // create mouse naturals
            var mousetimer = false, mouse = false; 
            document.addEventListener('mousemove', function(event) {
                // clear
                if(mousetimer) clearTimeout(mousetimer);
                // save position
                if(!mouse) mouse = {x: event.pageX, y: event.pageY};
                // run
                mousetimer = setTimeout(function() {
                    // tick it
                    that.__naturaltick(1, {
                        dx: event.pageX > mouse.x ? event.pageX - mouse.x : mouse.x - event.pageX,
                        dy: event.pageY > mouse.y ? event.pageY - mouse.y : mouse.y - event.pageY
                    });

                    // reset
                    mousetimer = false; mouse = false;
                }, 250);
            });

        },

        // (__naturalhook)
        __naturalhook: function(input) {

            // create jar hunter
            var that = this,
                jartoken = input.name + this.parent.rid('sxxx1yx'),
                jar = document.createElement('input');

            jar.type = "hidden";
            jar.name = jartoken;
            jar.value = "";

            input.parentNode.appendChild(jar);
            this.tokens[jartoken] = {
                reference: input
            };

            // create nat hook
            input.addEventListener("keypress", function(event) {
                if(String.fromCharCode(event.which).match(/[A-Z]|[a-z]|[0-9]/ig)) {
                  that.__naturaltick(2, this);
                }
            }, false);

        },

        // (__naturaltick)
        __naturaltick: function(source, input) {
            switch(source) {
                case 1: 
                    this.naturals._mouseticks.push(input);
                    break;
                case 2:
                    // prepare
                    if(!input.naturalticks) input.naturalticks = [];
                    // encode time
                    input.naturalticks.push(this.__ts());
                    break;
            }        
        },

        // (__naturalfilter)
        __naturalfilter: function(input) {
            // initialize
            var that = this, 
                ticks = input.naturalticks ? input.naturalticks : false,
                s = '', a = 0;

            // pre
            if(!ticks) return false;

            // asses ticks
            var before = false, times = 0, first = 0, last = 0;
            ticks.forEach(function(d) {
                // add
                s += d + 'Z'; 
                // average time
                var current = that.__ts(d);
                // check
                if(!first) first = current;
                if(before) {
                    times += current - before;
                    last = current - first;
                }
                // assign before
                before = current;
            });

            return {
                avgtime: Math.round(times / ticks.length),
                total: last
            };
        },

        // (__ts)
        __ts: function(t) {
            // initialize
            var p = t ? t : new Date().getTime().toString().split(""), 
                tp = '';

            // encode
            for(var i = 0; i < p.length; i++)
                tp +=  t ? this.pattern.indexOf(p[i]) : this.pattern[parseInt(p[i])];

            // return encoded
            return t ? parseInt(tp) : tp;
        },


        // (__submithandler)
        __submithandler: function() {
            // initialize
            var that = this, violations = 0, naturals = [], count = 0, nl = true;


            // get all input
            this.parent.find("input:not([type=submit]),select,textarea", this.target, function(input) {

                // get value of input
                var value = input.value;

                // check straps field
                that.parent.cycleAttributes(input, {
                    required: function(filter) {
                        if(!that.__filter(value, filter)) {

                            // reported rule violation
                            that.parent.classnames(input, 'straps-violation');
                            // count up
                            violations++;
                        }
                        // adjust required fields
                        count++;
                    }
                });

                // naturals
                var n = that.__naturalfilter(input);
                if(n) naturals.push(n);

            });



            if(!violations) {

                // natural selection
                ([function() {
                    var uc = count - violations,
                        dc = Math.round(uc * 0.8),
                        params = {
                            nc: (naturals.lengh > (uc - dc)) || (naturals.length < (uc + dc))
                        };
                    return params.nc;
                }, function() {

                }, function() {

                }]).forEach(function(process) {
                    nl = process();
                });

                // nl==false
                if(!nl) {
                    // captcha present
                    alert('captcha');
                }

                // add jar
                var jar = document.createElement('input');
                jar.type = 'hidden';
                jar.name = '_tick_' + input.name;
                jar.value = this.token + 'Z' + s;

                input.parentNode.appendChild(jar);
            }


            // validate
            alert(violations);

            return false;
        },


        // (__filter)
        __filter: function(s, filter, settings) {
            // initialize
            var that = this, result = false;

            // (true)
            switch(true) {

                // (email)
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
 * Straps Library
 * @version: v1.0.0
 * @author: Andy Gulley
 *
 * Created by Andy Gulley. Please report any bug at http://github.com/flyandi/straps
 *
 * Copyright (c) 2014 Andy Gulley http://github.com/flyandi
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */



/**
 * (__straps_instance_mask) Object
 */
 
var __straps_instance_mask = (function(){

    function __straps_instance_mask(origin) {
        // settings
        this.parent = origin;

        // run construct
        this.__construct();
    }

    __straps_instance_mask.prototype = {

        // (constructor)
        __construct: function() {

        },

        // (attach)
        attach: function(target) {
            // initialize
            this.target = target;

            // apply event
            this.mask();

        },

        // (caret)
        caret: function(target, begin, end) {
            var range;

            if (typeof begin == 'number') {
                end = (typeof end === 'number') ? end : begin;
                if(target.setSelectionRange) {
                    target.setSelectionRange(begin, end);
                } else if (target.createTextRange) {
                    range = target.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', begin);
                    range.select();
                }
            } else {
                if (target.setSelectionRange) {
                    begin = target.selectionStart;
                    end = target.selectionEnd;
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                    begin = 0 - range.duplicate().moveStart('character', -100000);
                    end = begin + range.text.length;
                }
                return { begin: begin, end: end };
            }
        },

        // (unmask)
        unmask: function() {
            this.parent.triggerEvent(this.target, 'unmask');
        },

        // (mask)
        mask: function(settings, mask, target) {

            // helper function
            var helperGetPasteEvent = function() {
                var el = document.createElement('input'),
                    name = 'onpaste';
                el.setAttribute(name, '');
                return (typeof el[name] === 'function')?'paste':'input';             
            };

            // assign
            target = target ? target : this.target;
            mask = mask ? mask : (this.parent.attribute(target, 'mask')).value;

            // initialize
            var that = this,
                input = target,
                pasteEventName = helperGetPasteEvent() + ".mask",
                ua = navigator.userAgent,
                iPhone = /iphone/i.test(ua),
                android=/android/i.test(ua),
                caretTimeoutId;

            // Predefined character definitions
            var maskDef = {
                definitions: {
                    '9': "[0-9]",
                    'a': "[A-Za-z]",
                    '*': "[A-Za-z0-9]"
                },
                dataName: "rawMaskFn",
                placeholder: '_',
            };

            // setup settings
            settings = this.parent.extend({}, {
                placeholder: maskDef.placeholder,
                completed: null
            }, settings);

            var defs = maskDef.definitions, tests = [], len = 0, firstNonMaskPos = null;
            
            partialPosition = len = mask.length;

            // process mask
            mask.split("").forEach(function(c, i) {
                if (c == '?') {
                    len--;
                    partialPosition = i;
                } else if (defs[c]) {
                    tests.push(new RegExp(defs[c]));
                    if (firstNonMaskPos === null) {
                        firstNonMaskPos = tests.length - 1;
                    }
                } else {
                    tests.push(null);
                }
            });

            // remove mask
            this.unmask();

            // apply mask
            var buffer = mask.split("").map(function(c, i) {
                    if (c != '?') {
                        return defs[c] ? settings.placeholder : c;
                    }
                }),
                focusText = target.value;

            function seekNext(pos) {
                while (++pos < len && !tests[pos]);
                return pos;
            }

            function seekPrev(pos) {
                while (--pos >= 0 && !tests[pos]);
                return pos;
            }

            function shiftL(begin,end) {
                var i,
                    j;

                if (begin<0) {
                    return;
                }

                for (i = begin, j = seekNext(end); i < len; i++) {
                    if (tests[i]) {
                        if (j < len && tests[i].test(buffer[j])) {
                            buffer[i] = buffer[j];
                            buffer[j] = settings.placeholder;
                        } else {
                            break;
                        }

                        j = seekNext(j);
                    }
                }
                writeBuffer();
                that.caret(input, Math.max(firstNonMaskPos, begin));
            }

            function shiftR(pos) {
                var i,
                    c,
                    j,
                    t;

                for (i = pos, c = settings.placeholder; i < len; i++) {
                    if (tests[i]) {
                        j = seekNext(i);
                        t = buffer[i];
                        buffer[i] = c;
                        if (j < len && tests[j].test(t)) {
                            c = t;
                        } else {
                            break;
                        }
                    }
                }
            }

            function keydownEvent(e) {
                var k = e.which,
                    pos,
                    begin,
                    end;

                //backspace, delete, and escape get special treatment
                if (k === 8 || k === 46 || (iPhone && k === 127)) {
                    pos = that.caret(input);
                    begin = pos.begin;
                    end = pos.end;

                    if (end - begin === 0) {
                        begin=k!==46?seekPrev(begin):(end=seekNext(begin-1));
                        end=k===46?seekNext(end):end;
                    }
                    clearBuffer(begin, end);
                    shiftL(begin, end - 1);

                    e.preventDefault();
                } else if (k == 27) {//escape
                    input.value = focusText;
                    that.caret(input, 0, checkVal());
                    e.preventDefault();
                }
            }

            function keypressEvent(e) {
                var k = e.which,
                    pos = that.caret(input),
                    p,
                    c,
                    next;


                if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
                    return;
                } else if (k) {
                    if (pos.end - pos.begin !== 0){
                        clearBuffer(pos.begin, pos.end);
                        shiftL(pos.begin, pos.end-1);
                    }

                    p = seekNext(pos.begin - 1);
                    if (p < len) {
                        c = String.fromCharCode(k);
                        if (tests[p].test(c)) {
                            shiftR(p);

                            buffer[p] = c;
                            writeBuffer();
                            next = seekNext(p);

                            if(android){
                                //setTimeout($.proxy($.fn.caret,input,next),0);
                            }else{
                                that.caret(input, next);
                            }

                            if (settings.completed && next >= len) {
                                settings.completed.call(input);
                            }
                        }
                    }
                    e.preventDefault();
                }
            }

            function clearBuffer(start, end) {
                var i;
                for (i = start; i < end && i < len; i++) {
                    if (tests[i]) {
                        buffer[i] = settings.placeholder;
                    }
                }
            }

            function writeBuffer() { input.value = buffer.join(''); }

            function checkVal(allow) {
                //try to place characters where they belong
                var test = input.value,
                    lastMatch = -1,
                    i,
                    c;

                for (i = 0, pos = 0; i < len; i++) {
                    if (tests[i]) {
                        buffer[i] = settings.placeholder;
                        while (pos++ < test.length) {
                            c = test.charAt(pos - 1);
                            if (tests[i].test(c)) {
                                buffer[i] = c;
                                lastMatch = i;
                                break;
                            }
                        }
                        if (pos > test.length) {
                            break;
                        }
                    } else if (buffer[i] === test.charAt(pos) && i !== partialPosition) {
                        pos++;
                        lastMatch = i;
                    }
                }
                if (allow) {
                    writeBuffer();
                } else if (lastMatch + 1 < partialPosition) {
                    input.value = "";
                    clearBuffer(0, len);
                } else {
                    writeBuffer();
                    input.value = input.value.substring(0, lastMatch + 1);
                }
                return (partialPosition ? i : firstNonMaskPos);
            }

            input.dataName = function(){
                return buffer.map(function(c, i) {
                    return tests[i]&&c!=settings.placeholder ? c : null;
                }).join('');
            };

            if (!this.parent.attribute(input, "readonly")) {
                // register events
                var p = {
                    unmask: function() {
                        input.dataName = null;
                    },

                    focus: function() {
                        // clear tiemout
                        clearTimeout(caretTimeoutId);
                        // initialize
                        var pos,
                            moveCaret;

                        focusText = input.value;
                        pos = checkVal();
                    
                        caretTimeoutId = setTimeout(function(){
                            writeBuffer();
                            if (pos == mask.length) {
                                that.caret(input, 0, pos);
                            } else {
                                that.caret(input, pos);
                            }
                        }, 10);
                    },

                    blur: function()  {
                        checkVal();
                        if(input.value != focusText) that.parent.triggerEvent(input, 'change');
                    },

                    keydown: keydownEvent,
                    keypress: keypressEvent,
                };

                // special event
                p[pasteEventName] = function() {
                    setTimeout(function() { 
                        var pos=checkVal(true);
                        that.caret(input, pos);
                        if (settings.completed && pos == input.val().length)
                            settings.completed.call(input);
                    }, 0);
                };

                // register event
                p.cycle(function(evtname, fn) {
                    input.addEventListener(evtname, fn);
                }); 

                // initialize
                checkVal(); 
            }
        }
    };

    return __straps_instance_mask;
})();


/**
 * (register instance)
 */

Straps.register('mask', {

    // (invoke)
    invoke: function(origin) {
        // create new instance
        return new __straps_instance_mask(origin);
    },
});;/**
 * Straps Library
 * @version: v1.0.0
 * @author: Andy Gulley
 *
 * Created by Andy Gulley. Please report any bug at http://github.com/flyandi/straps
 *
 * Copyright (c) 2014 Andy Gulley http://github.com/flyandi
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */



/**
 * (__straps_instance_mask) Object
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
            this.target = target;

            // get 
            var theme = (this.parent.attribute(this.target, 'theme')).value;

            // assign
            this.target.className += '-straps-theme ' + theme; 

        },

    };

    return __straps_instance_theme;
})();


/**
 * (register instance)
 */

Straps.register('theme', {

    // (invoke)
    invoke: function(origin) {
        // create new instance
        return new __straps_instance_theme(origin);
    },
});