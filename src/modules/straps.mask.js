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
});