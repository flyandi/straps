/**
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
