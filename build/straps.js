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

            _mask: function(anchor) {
                that.__attach('mask', anchor);
            }
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
            var that = this,
                mask = this.parent.attribute(target, 'mask');

            alert(mask);
        },
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
});


                /*

            // get mask 
            var jMask = this, old_value, regexMask;
        el = $(el);

        mask = typeof mask === "function" ? mask(el.val(), undefined, el,  options) : mask;

        var p = {
            getCaret: function () {
                try {
                    var sel,
                        pos = 0,
                        ctrl = el.get(0),
                        dSel = document.selection,
                        cSelStart = ctrl.selectionStart;

                    // IE Support
                    if (dSel && !~navigator.appVersion.indexOf("MSIE 10")) {
                        sel = dSel.createRange();
                        sel.moveStart('character', el.is("input") ? -el.val().length : -el.text().length);
                        pos = sel.text.length;
                    }
                    // Firefox support
                    else if (cSelStart || cSelStart === '0') {
                        pos = cSelStart;
                    }
                    
                    return pos;    
                } catch (e) {}
            },
            setCaret: function(pos) {
                try {
                    if (el.is(":focus")) {
                        var range, ctrl = el.get(0);

                        if (ctrl.setSelectionRange) {
                            ctrl.setSelectionRange(pos,pos);
                        } else if (ctrl.createTextRange) {
                            range = ctrl.createTextRange();
                            range.collapse(true);
                            range.moveEnd('character', pos);
                            range.moveStart('character', pos);
                            range.select();
                        }
                    }
                } catch (e) {}
            },
            events: function() {
                el
                .on('keydown.mask', function() {
                    old_value = p.val();
                })
                .on('keyup.mask', p.behaviour)
                .on("paste.mask drop.mask", function() {
                    setTimeout(function() {
                        el.keydown().keyup();
                    }, 100);
                })
                .on("change.mask", function() {
                    el.data("changed", true);
                })
                .on("blur.mask", function(){
                    if (old_value !== el.val() && !el.data("changed")) {
                        el.trigger("change");
                    }
                    el.data("changed", false);
                })
                // clear the value if it not complete the mask
                .on("focusout.mask", function() {
                    if (options.clearIfNotMatch && !regexMask.test(p.val())) {
                       p.val('');
                   }
                });
            },
            getRegexMask: function() {
                var maskChunks = [], translation, pattern, optional, recursive, oRecursive, r;

                for (var i = 0; i < mask.length; i++) {
                    translation = jMask.translation[mask[i]];

                    if (translation) {
                        
                        pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, "");
                        optional = translation.optional;
                        recursive = translation.recursive;
                        
                        if (recursive) {
                            maskChunks.push(mask[i]);
                            oRecursive = {digit: mask[i], pattern: pattern};
                        } else {
                            maskChunks.push(!optional && !recursive ? pattern : (pattern + "?"));
                        }

                    } else {
                        maskChunks.push(mask[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
                    }
                }
                
                r = maskChunks.join("");
                
                if (oRecursive) {
                    r = r.replace(new RegExp("(" + oRecursive.digit + "(.*" + oRecursive.digit + ")?)"), "($1)?")
                         .replace(new RegExp(oRecursive.digit, "g"), oRecursive.pattern);
                }

                return new RegExp(r);
            },
            destroyEvents: function() {
                el.off(['keydown', 'keyup', 'paste', 'drop', 'change', 'blur', 'focusout', 'DOMNodeInserted', ''].join('.mask '))
                .removeData("changeCalled");
            },
            val: function(v) {
                var isInput = el.is('input');
                return arguments.length > 0 
                    ? (isInput ? el.val(v) : el.text(v)) 
                    : (isInput ? el.val() : el.text());
            },
            getMCharsBeforeCount: function(index, onCleanVal) {
                for (var count = 0, i = 0, maskL = mask.length; i < maskL && i < index; i++) {
                    if (!jMask.translation[mask.charAt(i)]) {
                        index = onCleanVal ? index + 1 : index;
                        count++;
                    }
                }
                return count;
            },
            caretPos: function (originalCaretPos, oldLength, newLength, maskDif) {
                var translation = jMask.translation[mask.charAt(Math.min(originalCaretPos - 1, mask.length - 1))];

                return !translation ? p.caretPos(originalCaretPos + 1, oldLength, newLength, maskDif)
                                    : Math.min(originalCaretPos + newLength - oldLength - maskDif, newLength);
            },
            behaviour: function(e) {
                e = e || window.event;
                var keyCode = e.keyCode || e.which;
                if ($.inArray(keyCode, jMask.byPassKeys) === -1) {

                    var caretPos = p.getCaret(),
                        currVal = p.val(),
                        currValL = currVal.length,
                        changeCaret = caretPos < currValL,
                        newVal = p.getMasked(),
                        newValL = newVal.length,
                        maskDif = p.getMCharsBeforeCount(newValL - 1) - p.getMCharsBeforeCount(currValL - 1);

                    if (newVal !== currVal) {
                        p.val(newVal);
                    }

                    // change caret but avoid CTRL+A
                    if (changeCaret && !(keyCode === 65 && e.ctrlKey)) {
                        // Avoid adjusting caret on backspace or delete
                        if (!(keyCode === 8 || keyCode === 46)) {
                            caretPos = p.caretPos(caretPos, currValL, newValL, maskDif);
                        }
                        p.setCaret(caretPos);
                    }

                    return p.callbacks(e);
                }
            },
            getMasked: function (skipMaskChars) {
                var buf = [],
                    value = p.val(),
                    m = 0, maskLen = mask.length,
                    v = 0, valLen = value.length,
                    offset = 1, addMethod = "push",
                    resetPos = -1,
                    lastMaskChar,
                    check;

                if (options.reverse) {
                    addMethod = "unshift";
                    offset = -1;
                    lastMaskChar = 0;
                    m = maskLen - 1;
                    v = valLen - 1;
                    check = function () {
                        return m > -1 && v > -1;
                    };
                } else {
                    lastMaskChar = maskLen - 1;
                    check = function () {
                        return m < maskLen && v < valLen;
                    };
                }

                while (check()) {
                    var maskDigit = mask.charAt(m),
                        valDigit = value.charAt(v),
                        translation = jMask.translation[maskDigit];

                    if (translation) {
                        if (valDigit.match(translation.pattern)) {
                            buf[addMethod](valDigit);
                             if (translation.recursive) {
                                if (resetPos === -1) {
                                    resetPos = m;
                                } else if (m === lastMaskChar) {
                                    m = resetPos - offset;
                                }

                                if (lastMaskChar === resetPos) {
                                    m -= offset;
                                }
                            }
                            m += offset;
                        } else if (translation.optional) {
                            m += offset;
                            v -= offset;
                        }
                        v += offset;
                    } else {
                        if (!skipMaskChars) {
                            buf[addMethod](maskDigit);
                        }
                        
                        if (valDigit === maskDigit) {
                            v += offset;
                        }

                        m += offset;
                    }
                }
                
                var lastMaskCharDigit = mask.charAt(lastMaskChar);
                if (maskLen === valLen + 1 && !jMask.translation[lastMaskCharDigit]) {
                    buf.push(lastMaskCharDigit);
                }
                
                return buf.join("");
            },
            callbacks: function (e) {
                var val = p.val(),
                    changed = val !== old_value;
                if (changed === true) {
                    if (typeof options.onChange === "function") {
                        options.onChange(val, e, el, options);
                    }
                }

                if (changed === true && typeof options.onKeyPress === "function") {
                    options.onKeyPress(val, e, el, options);
                }

                if (typeof options.onComplete === "function" && val.length === mask.length) {
                    options.onComplete(val, e, el, options);
                }
            }
        };


        // public methods
        jMask.mask = mask;
        jMask.options = options;
        jMask.remove = function() {
            var caret;
            p.destroyEvents();
            p.val(jMask.getCleanVal()).removeAttr('maxlength');
            
            caret = p.getCaret();
            p.setCaret(caret - p.getMCharsBeforeCount(caret));
            return el;
        };

        // get value without mask
        jMask.getCleanVal = function() {
           return p.getMasked(true);
        };

       jMask.init = function() {
            options = options || {};

            jMask.byPassKeys = [9, 16, 17, 18, 36, 37, 38, 39, 40, 91];
            jMask.translation = {
                '0': {pattern: /\d/},
                '9': {pattern: /\d/, optional: true},
                '#': {pattern: /\d/, recursive: true},
                'A': {pattern: /[a-zA-Z0-9]/},
                'S': {pattern: /[a-zA-Z]/}
            };

            jMask.translation = $.extend({}, jMask.translation, options.translation);
            jMask = $.extend(true, {}, jMask, options);

            regexMask = p.getRegexMask();

            if (options.maxlength !== false) {
                el.attr('maxlength', mask.length);
            }

            if (options.placeholder) {
                el.attr('placeholder' , options.placeholder);
            }
            
            el.attr('autocomplete', 'off');
            p.destroyEvents();
            p.events();
            
            var caret = p.getCaret();

            p.val(p.getMasked());
            p.setCaret(caret + p.getMCharsBeforeCount(caret, true));
            
        }();

    };




    }

    return __straps_instance_mask;
})();


   

  

    var watchers = {},
        live = 'DOMNodeInserted.mask',
        HTMLAttributes = function () {
            var input = $(this),
                options = {},
                prefix = "data-mask-";

            if (input.attr(prefix + 'reverse')) {
                options.reverse = true;
            }

            if (input.attr(prefix + 'maxlength') === 'false') {
                options.maxlength = false;
            }

            if (input.attr(prefix + 'clearifnotmatch')) {
                options.clearIfNotMatch = true;
            }

            input.mask(input.attr('data-mask'), options);
        };

    $.fn.mask = function(mask, options) {
        var selector = this.selector,
            maskFunction = function() {
                var maskObject = $(this).data('mask'),
                    stringify = JSON.stringify;

                if (typeof maskObject !== "object" || stringify(maskObject.options) !== stringify(options) || maskObject.mask !== mask) {
                    return $(this).data('mask', new Mask(this, mask, options));
                }
            };
        
        this.each(maskFunction);

        if (selector && !watchers[selector]) {
            // dynamically added elements.
            watchers[selector] = true;
            setTimeout(function(){
                $(document).on(live, selector, maskFunction);
            }, 500);
        }
    };

    $.fn.unmask = function() {
        try {
            return this.each(function() {
                $(this).data('mask').remove().removeData('mask');
            });
        } catch(e) {};
    };

    $.fn.cleanVal = function() {
        return this.data('mask').getCleanVal();
    };

    // looking for inputs with data-mask attribute
    $('*[data-mask]').each(HTMLAttributes);

    // dynamically added elements with data-mask html notation.
    $(document).on(live, '*[data-mask]', HTMLAttributes);

    */
