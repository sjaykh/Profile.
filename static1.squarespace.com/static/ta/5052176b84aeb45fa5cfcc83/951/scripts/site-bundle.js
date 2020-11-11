/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(7);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/*
	
	    Squarespace Dynamic Data
	    ------------------------
	    On click, inject page content dynamically into an element.
	    Value in a[href] is used.
	
	    Params:
	
	    - wrapper: where to inject the fetched data
	    - target: elements to be used as an onclick triggers
	    - preCallback: function to be executed pre-load
	    - postCallback: function to be executed post-load
	    - useHashes: keep track of the current active page using # in URL's
	    - autoOpenHash: if the current URL includes a #, fetch that page on init
	    - injectEl: by default, all page data is injected into wrapper. Use this option
	      to specify which part of the loaded page is to be injected in wrapper.
	      Ex: '#content' or '#content, #thumbnails'
	    - minimumResolution: minimum browser width required for this plugin to work
	      Ex: 1025px ensures that default clicking behavior is maintained on mobiles and tablets
	    - scrollToWrapperPreLoad: scroll and focus on wrapper pre-load
	
	    Methods:
	    - simulateHash( hash ): simulate an onClick event by passing the
	      trigger's href value as hash
	
	 */
	
	var core = __webpack_require__(2);
	
	YUI.add( 'squarespace-dynamic-data', function( Y ) {
	
	  Y.namespace( 'Squarespace' );
	
	  Y.Squarespace.DynamicData = function( params ) {
	    var wrapper = ( params && params.wrapper ) || 'body',
	      preCallback = ( params && params.preCallback ) || null,
	      postCallback = ( params && params.postCallback ) || null,
	      useHashes = ( params && params.useHashes ) || false,
	      autoOpenHash = ( params && params.autoOpenHash ) || false,
	      injectEl = ( params && params.injectEl ) || null,
	      minimumResolution = ( params && params.minimumResolution ) || null,
	      scrollToWrapperPreLoad = ( params && params.scrollToWrapperPreLoad ) || false,
	      appendData = ( params && params.appendData ) || null,
	      classes = {
	        search: ( params && params.target ) || '.sqs-dynamic-data',
	        active: 'sqs-dynamic-data-active',
	        loading: 'sqs-dynamic-data-loading',
	        ready: 'sqs-dynamic-data-ready',
	        activeWrapper: 'data-dynamic-data-link',
	        appendWrapper: 'sqs-dynamic-data-wrapper'
	      };
	
	    // Core
	    function init() {
	      if ( !minimumResolution || window.innerWidth >= minimumResolution ) {
	        wrapper = Y.one( wrapper );
	
	        if ( wrapper ) {
	          Y.on( 'click', fetch, classes.search );
	          openCurrentHash();
	        }
	      }
	    }
	
	    // Simulate a click
	    this.simulateHash = function( hash ) {
	      if ( hash ) {
	        hash = hash.replace( '#', '' );
	        fetch( null, hash);
	      }
	    }
	
	    // Check if current URL contains a hash
	    function openCurrentHash() {
	      var hash = window.location.hash;
	
	      if ( autoOpenHash && hash ) {
	        hash = hash.replace( '#', '' );
	        hash = hash.endsWith('/') ? hash.substr(0, hash.length - 1) : hash;
	        fetch( null, hash);
	      }
	    }
	
	    // Call Fn
	    function callFn( fn ) {
	      if ( typeof fn === 'function') {
	        fn();
	      }
	    }
	
	    // Clean url
	    function cleanUrl( url ) {
	      return url.replace(/\//g,'');
	    }
	
	    // Fetch url - on click or forced
	    function fetch( e, simulate ) {
	
	      var trigger = ( simulate && Y.one( classes.search + '[href="' + simulate + '"]'  ) ) || ( e && e.currentTarget || null ),
	        url = ( simulate ) || ( trigger && trigger.getAttribute( 'href' ) ),
	        tempWrapper,
	        loadingWrapper;
	
	      if ( e ) {
	        e.preventDefault();
	      }
	
	      if ( useHashes ) {
	        window.location.hash = url;
	      }
	
	      // Only load items that have never been loaded
	      if ( ( trigger && !appendData && cleanUrl( url ) != wrapper.getAttribute( classes.activeWrapper ) ) ||
	           ( trigger && appendData && !wrapper.one( '[' + classes.activeWrapper + '=' + cleanUrl( url ) + ']' ) ) ) {
	
	        // Destroy current Squarespace blocks
	        core.Lifecycle.destroy();
	
	        wrapper.setAttribute( classes.activeWrapper, cleanUrl( url ) );
	
	        Y.all( '.' + classes.active ).removeClass( classes.active );
	        trigger.addClass( classes.active );
	        wrapper.removeClass( classes.ready );
	        wrapper.addClass( classes.loading );
	
	        // Scroll to top if required
	        if ( !simulate ) {
	          scrollToWrapper();
	        }
	
	        callFn( preCallback );
	
	        if ( appendData ) {
	          tempWrapper = Y.Node.create( '<div></div>' );
	          tempWrapper.addClass( classes.appendWrapper );
	          tempWrapper.setAttribute( classes.activeWrapper, cleanUrl( url ) );
	          tempWrapper.appendTo( wrapper );
	        }
	
	        loadingWrapper = tempWrapper ? tempWrapper : wrapper;
	
	        loadingWrapper.load( url, injectEl, function() {
	          loadReady( url );
	        });
	
	      } else {
	
	        wrapper.setAttribute( classes.activeWrapper, cleanUrl( url ) );
	
	        // [TMP-3033] When image blocks that have already been initialized are re-initialized,
	        // their style attributes (determining cropping) get blasted away.
	        // Ultimately we'll figure out a better way to manage initialization of blocks on dynamic pages
	        // but for now, save these styles so we can reapply later. -schai
	        Y.one('#projectPages').all('img[data-src].loaded').each(function(img){
	          img.setAttribute('saved-styles', img.getAttribute('style'));
	        });
	
	        if ( !simulate ) {
	          scrollToWrapper();
	        }
	
	      }
	
	    }
	
	    // SQS block related inits
	    function sqsBlocks(callback) {
	
	      // Initialize fetched Squarespace blocks
	      core.Lifecycle.init();
	      Squarespace.initializeCommerce(Y);
	      // Load Non-Block Images
	      wrapper.all('img[data-src]').each(function(el) {
	        if (!el.ancestor('.sqs-layout')) {
	          ImageLoader.load(el);
	        }
	      });
	
	      // [TMP-3033] When image blocks that have already been initialized are re-initialized,
	      // their style attributes (determining cropping) get blasted away.
	      // Ultimately we'll figure out a better way to manage initialization of blocks on dynamic pages
	      // but for now, save these styles so we can reapply later. -schai
	      Y.one('#projectPages').all('img[data-src].loaded').each(function(img){
	        if(img.getAttribute('saved-styles')) {
	          img.setAttribute('style', img.getAttribute('saved-styles'));
	        }
	      });
	      // Execute scripts
	      wrapper.all( 'script' ).each(function( n ) {
	        var newScript = document.createElement('script');
	        newScript.type = 'text/javascript';
	        if (n.getAttribute('src')) {
	          newScript.src = n.getAttribute('src');
	        } else {
	          newScript.innerHTML = n.get('innerHTML');
	        }
	
	        Y.one('head').append(newScript);
	      });
	
	      callFn( callback ); // wait for images to load?
	
	      // Used in squarespace-v6 to re-init things on dynamic page loads, like
	      // the BlockAnimationsInitializer.
	      Y.fire('template:dynamicPageReady', { framework: 'montauk' });
	    }
	
	    // Locate Wrapper
	    function scrollToWrapper() {
	      var scrollY, scrollAnim;
	
	      if ( scrollToWrapperPreLoad ) {
	        var scrollNodes = Y.UA.gecko ? 'html' : 'body';
	        scrollY = wrapper.getXY();
	        scrollY = scrollY[ 1 ];
	        scrollAnim = new Y.Anim({ node: Y.one( document.scrollingElement || scrollNodes ), to: { scroll: [ 0, scrollY ] }, duration: 0.2, easing: 'easeBoth' });
	        scrollAnim.run();
	      }
	    }
	
	    // Load ready
	    function loadReady( url ) {
	      sqsBlocks( postCallback );
	
	      wrapper.removeClass( classes.loading );
	      wrapper.addClass( classes.ready );
	    }
	
	    init();
	  }
	}, '1.0', { requires: [ 'node', 'node-load', 'squarespace-social-buttons' ] });


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _ImageLoader = __webpack_require__(3);
	
	var _ImageLoader2 = _interopRequireDefault(_ImageLoader);
	
	var _Lifecycle = __webpack_require__(4);
	
	var _Lifecycle2 = _interopRequireDefault(_Lifecycle);
	
	var _Tweak = __webpack_require__(5);
	
	var _Tweak2 = _interopRequireDefault(_Tweak);
	
	var _UserAccounts = __webpack_require__(6);
	
	var _UserAccounts2 = _interopRequireDefault(_UserAccounts);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * The public JavaScript API for Squarespace template developers.
	 * @namespace SQS
	 */
	/**
	 * @license
	 * Copyright 2016 Squarespace, INC.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *    http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	var SQS = {
	  ImageLoader: _ImageLoader2.default,
	  Lifecycle: _Lifecycle2.default,
	  Tweak: _Tweak2.default,
	  UserAccounts: _UserAccounts2.default
	};
	
	exports.default = SQS;
	module.exports = exports['default'];

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @license
	 * Copyright 2016 Squarespace, INC.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *    http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	/**
	 * ​Squarespace comes with a number of built-in facilities for managing images
	 * that are uploaded to our system. After uploading an image into a collection,
	 * Squarespace automatically creates multiple copies of the image with different 
	 * sizes. Our ImageLoader will then help render images properly when they are
	 * presented on a page, even on retina displays.
	 *
	 * ImageLoader can also be used to fit or fill an image inside ​a parent
	 * container, where it automatically determines which image size to use
	 * depending on the current dimensions of the container.
	 *
	 * WARNING:
	 * Currently, ImageLoader is present on all Squarespace sites under the global
	 * namespace ImageLoader, but this is an unsupported API and we recommend
	 * accessing this functionality through squarespace-core.
	 *
	 * @namespace ImageLoader
	 */
	var ImageLoader = {
	
	  /**
	   * Using the global ImageLoader namespace, calls ImageLoader.load on the
	   * given node with the given config options.
	   *
	   * @method load
	   * @param  {HTMLElement} img    Image node to be loaded
	   * @param  {Object} config      Config object
	   * @return {Boolean}            True if the image was loaded, false otherwise
	   */
	  load: function load(img, config) {
	    return window.ImageLoader.load(img, config);
	  }
	};
	
	/**
	 * @exports {Object} ImageLoader
	 */
	exports.default = ImageLoader;
	module.exports = exports["default"];

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @license
	 * Copyright 2016 Squarespace, INC.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *    http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	/**
	 * Squarespace provides default functionality for some content that users add
	 * in the CMS.
	 *
	 * If you are building a Developer Platform site that loads Squarespace content
	 * through an XHR or some other kind of AJAX, you can use the Lifecycle methods
	 * provided here to initialize and/or destroy this functionality.
	 *
	 * WARNING:
	 * The functionality called by Lifecycle is available on the global namespace
	 * window.Squarespace, but this is an unsupported API and it is highly
	 * recommended that you access it through squarespace-core.
	 *
	 * @namespace Lifecycle
	 */
	var Lifecycle = {
	
	  /**
	   * Squarespace.afterBodyLoad() trigger loads scripts and calls onInitialize,
	   * which individual modules' init functions are bound to. This should be
	   * called after new HTML content containing Squarespace default functionality
	   * is added to a page (for example, after AJAX loading a new page).
	   *
	   * @method init
	   */
	  init: function init() {
	    window.Squarespace.AFTER_BODY_LOADED = false;
	    window.Squarespace.afterBodyLoad();
	  },
	
	
	  /**
	   * Squarespace.globalDestroy calls onDestroy, triggering each module's
	   * destructor. This should be called prior to loading in new HTML content
	   * containing Squarespace default functionality.
	   *
	   * @method  destroy
	   */
	  destroy: function destroy() {
	    window.Squarespace.globalDestroy(Y);
	  }
	};
	
	/**
	 * @exports {Object} Lifecycle
	 */
	exports.default = Lifecycle;
	module.exports = exports["default"];

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @license
	 * Copyright 2016 Squarespace, INC.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *    http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	var isAuthenticated = Static.SQUARESPACE_CONTEXT.authenticatedAccount;
	
	/**
	 * @const {Object} tweaksToWatch
	 */
	var tweaksToWatch = {
	  all: {
	    callbacks: []
	  }
	};
	
	/**
	 * Tweaks allow a developer to isolate specific elements of the design and
	 * present options to the user in an easy-to-use interface. Tweaks are surfaced
	 * in the Squarespace interface through Style Editor (e.g.
	 * yoursite.squarespace.com/config/design/style). Using tweaks, a user can make
	 * presentational changes to their website without having to know or edit CSS code.
	 *
	 * Tweaks are typically used by the developers through LESS variables, mixins,
	 * and class names added to the <body> element.
	 *
	 * Sometimes, a developer may find it necessary to access the value of a tweak
	 * through Javascript, or to watch for changes in that tweak and update the DOM
	 * accordingly. The Tweak module of squarespace-core is meant to provide an
	 * official interface for doing so.
	 *
	 * @namespace Tweak
	 */
	var Tweak = {
	
	  /**
	   * Gets the value of one of the tweaks given its name.
	   *
	   * @method getValue
	   * @param {String} name      Name of the tweak
	   * @returns {String}         The value of the tweak
	   */
	  getValue: function getValue(name) {
	    if (!name || typeof name !== 'string') {
	      console.error('squarespace-core: Invalid tweak name ' + name);
	      return null;
	    }
	
	    return window.Static.SQUARESPACE_CONTEXT.tweakJSON[name] || window.Static.SQUARESPACE_CONTEXT.tweakJSON[name.replace('@', '').replace('.', '')];
	  },
	
	
	  /**
	   * Listen for changes on a tweak item. If one parameter is provided, the
	   * callback will be executed every time any tweak changes. If two parameters
	   * are provided and the first parameter is a String, the callback will be
	   * executed only when that particular tweak changes. If two parameters are
	   * provided and the first parameter is an Array of strings, the callback will
	   * be executed any time one of those tweaks changes.
	   *
	   * @method watch
	   * @param {String}          Optional: Name of the tweak
	   * @param {Array}           Optional: Array with multiple tweak names
	   * @param {Function}        Callback to call when watcher is triggered
	   */
	  watch: function watch() {
	    var _arguments = arguments;
	
	
	    if (!isAuthenticated) {
	      return;
	    }
	
	    if (arguments.length === 0) {
	      console.error('squarespace-core: ' + 'Tweak.watch must be called with at least one parameter');
	      return;
	    }
	
	    if (arguments.length === 1) {
	      // Only callback passed in, no tweak name string or tweaks array passed.
	      // Run callback for all tweaks.
	      if (typeof arguments[0] === 'function') {
	        tweaksToWatch.all.callbacks.push(arguments[0]);
	      }
	      return;
	    }
	
	    if (typeof arguments[0] === 'string' && typeof arguments[1] === 'function') {
	      // Specific tweak name passed in. Run callback when that tweak is changed.
	      var tweakName = arguments[0];
	      if (!tweaksToWatch[tweakName]) {
	        tweaksToWatch[tweakName] = {
	          callbacks: []
	        };
	      }
	      tweaksToWatch[tweakName].callbacks.push(arguments[1]);
	    } else if (arguments[0].constructor === Array && typeof arguments[1] === 'function') {
	      // Multiple tweak names passed in as array. Run callback when any one of
	      // those tweaks are changed.
	      arguments[0].forEach(function (tweakName) {
	        if (!tweaksToWatch[tweakName]) {
	          tweaksToWatch[tweakName] = {
	            callbacks: []
	          };
	        }
	        tweaksToWatch[tweakName].callbacks.push(_arguments[1]);
	      });
	    }
	  }
	};
	
	if (isAuthenticated && window.Y && window.Y.Global) {
	  // If Y.Global is present on the page, set up the tweak event listener.
	  window.Y.Global.on('tweak:change', function (e) {
	    var tweakName = e.getName();
	    var callbackSignature = {
	      name: tweakName,
	      value: e.config && e.config.value || e.value
	    };
	
	    if (tweaksToWatch[tweakName]) {
	      tweaksToWatch[tweakName].callbacks.forEach(function (callback) {
	        try {
	          callback(callbackSignature);
	        } catch (err) {
	          console.error(err);
	        }
	      });
	    }
	
	    if (tweaksToWatch.all.callbacks.length > 0) {
	      tweaksToWatch.all.callbacks.forEach(function (callback) {
	        try {
	          callback(callbackSignature);
	        } catch (err) {
	          console.error(err);
	        }
	      });
	    }
	  });
	}
	
	/**
	 * @exports {Object} Tweak
	 */
	exports.default = Tweak;
	module.exports = exports['default'];

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @license
	 * Copyright 2016 Squarespace, INC.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *    http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	var warningMessage = 'UserAccounts API not available';
	var ua = window.UserAccountApi;
	var warn = function warn() {
	  console.warn(warningMessage);
	};
	
	var isUserAuthenticated = ua ? ua.isUserAuthenticated : warn;
	var openAccountScreen = ua ? ua.openAccountScreen : warn;
	
	exports.default = { isUserAuthenticated: isUserAuthenticated, openAccountScreen: openAccountScreen };
	module.exports = exports['default'];

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var VideoBackgroundRenderer = __webpack_require__(8).VideoBackground;
	var GetVideoProps = __webpack_require__(8).getVideoProps;
	var UserAccounts = __webpack_require__(6);
	
	Y.use('node', 'squarespace-dynamic-data', 'history-hash', function(Y) {
	
	  Y.on('domready', function() {
	
	    // fix goofy zooming on orientation change
	    if (navigator.userAgent.match(/iPhone/i) && Y.one('body.mobile-style-available')) {
	      var fixedViewport = 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1',
	          zoomViewport = 'width=device-width, initial-scale=1',
	          viewport = Y.one('meta[name="viewport"]');
	      viewport.setAttribute('content', fixedViewport);
	      Y.one('body').on('touchstart', function(e) {
	        if (e.touches.length > 1) {
	          viewport.setAttribute('content', zoomViewport);
	        }
	      });
	    }
	    var videoBackgroundNodes = Array.prototype.slice.call(document.body.querySelectorAll('div.sqs-video-background'));
	    var videoBackgrounds = [];
	    window.vdbg = videoBackgrounds;
	    videoBackgroundNodes.forEach(function(item) {
	      var options = GetVideoProps(item);
	      options.useCustomFallbackImage = true;
	      var videoItem = new VideoBackgroundRenderer(options);
	      videoBackgrounds.push(
	        videoItem
	      );
	      var customFallbackImage = item.querySelector('.custom-fallback-image');
	      if (customFallbackImage) {
	        var dimensions = customFallbackImage.getAttribute('data-image-dimensions').split('x');
	        item.parentElement.style.paddingBottom = parseInt(dimensions[1], 10) * 100 / parseInt(dimensions[0], 10) + '%';
	      }
	      item.addEventListener('ready', function() {
	        var dimensions = this._findPlayerDimensions();
	        this.container.parentElement.style.paddingBottom = dimensions.height * 100 / dimensions.width + '%';
	        setTimeout(function() {
	          this.syncPlayer();
	        }.bind(this), 500);
	      }.bind(videoItem), true);
	    });
	
	    // Mobile Nav ///////////////////////////////////
	
	    Y.one('#mobileMenuLink a').on('click', function(e){
	      console.log(e);
	       // var mobileMenuHeight = parseInt(Y.one('#mobileNav .wrapper').get('offsetHeight'),10);
	       // if (Y.one('#mobileNav').hasClass('menu-open')) {
	       //   new Y.Anim({ node: Y.one('#mobileNav'), to: { height: 0 }, duration: 0.5, easing: 'easeBoth' }).run();
	       // } else {
	       //   new Y.Anim({ node: Y.one('#mobileNav'), to: { height: mobileMenuHeight }, duration: 0.5, easing: 'easeBoth' }).run();
	       // }
	
	       Y.one('#mobileNav').toggleClass('menu-open');
	
	       //iOS6 Safari fix...
	       // if(Y.one('#mobileNav').hasClass('menu-open') && Y.one('#mobileNav').get('offsetHeight') == 0){
	       //   new Y.Anim({ node: Y.one('#mobileNav'), to: { height: mobileMenuHeight }, duration: 0.5, easing: 'easeBoth' }).run();
	       // }
	    });
	
	    body = Y.one('body');
	    bodyWidth = parseInt(body.getComputedStyle('width'),10);
	
	    // center align dropdown menus (when design is centered)
	    if(Y.one('body').hasClass('layout-style-center')) {
	      Y.all('#topNav .subnav').each( function(n){
	        n.setStyle('marginLeft', -(parseInt(n.getComputedStyle('width'),10)/2) + 'px' );
	      });
	    }
	
	    // vertically align page title/description
	    if (Y.one('.page-image .wrapper')) {
	      var vertAlign = function() {
	        Y.one('.page-image .wrapper').setStyles({
	          marginTop: -1 * parseInt(Y.one('.page-image .wrapper').getComputedStyle('height'),10)/2 + 'px',
	          opacity: 1
	        });
	      };
	      vertAlign();
	      Y.one('window').on('resize', vertAlign);
	    }
	
	    Y.one('#page').setStyle('opacity', 1);
	
	    // PROJECT PAGES
	    if (Y.one('.collection-type-template-page #projectPages, .collection-type-index #projectPages')) {
	
	      thumbLoader();
	
	      // thumbnail click events
	      thumbClickHandler();
	
	      // hash based page loading
	      pageLoader();
	      Y.on('hashchange', pageLoader);
	
	
	      // project pagination
	      Y.one('#projectNav').delegate('click', function(e) {
	        var project = Y.one('#projectPages .active-project').previous('.project');
	        if (project) {
	          scrollToTop();
	          window.location.hash = project.getAttribute('data-url');
	        } else {
	          e.currentTarget.addClass('disabled');
	        }
	      }, '.prev-project');
	
	      Y.one('#projectNav').delegate('click', function(e) {
	        var project = Y.one('#projectPages .active-project').next('.project');
	        if (project) {
	          scrollToTop();
	          window.location.hash = project.getAttribute('data-url');
	        } else {
	          e.currentTarget.addClass('disabled');
	        }
	      }, '.next-project');
	
	    }
	
	
	    // GALLERY PAGES
	
	
	
	    var body, bodyWidth;
	
	    // SIDEBAR min-height set
	
	    function setPageHeight() {
	      var sidebarHeight;
	      if (Y.one('#sidebar')) {
	        sidebarHeight = Y.one('#sidebar').getComputedStyle('height');
	      }
	      if (sidebarHeight) {
	        Y.one('#page').setStyle('minHeight', sidebarHeight);
	      }
	    }
	
	    // run on page load
	    setPageHeight();
	    Y.later(1000, this, setPageHeight);
	
	
	    // run when sidebar width is tweaked
	    if (Y.Squarespace.Management) {
	      Y.Squarespace.Management.on('tweak', function(f){
	        if (f.getName() == 'blogSidebarWidth' ) {
	          setPageHeight();
	        }
	      });
	    }
	
	    // User Accounts
	    function setupUserAccounts() {
	
	      var initUserAccountLink = function(el) {
	        var signInLink = el.querySelector('.sign-in');
	        var myAccountLink = el.querySelector('.my-account');
	        var isUserAuthenticated = UserAccounts.isUserAuthenticated();
	        if (signInLink && isUserAuthenticated) {
	          el.querySelector('a').removeChild(signInLink);
	        } else if (myAccountLink && !isUserAuthenticated) {
	          el.querySelector('a').removeChild(myAccountLink);
	        }
	        el.classList.add('loaded');
	        el.addEventListener('click', function(e) {
	          e.preventDefault();
	          UserAccounts.openAccountScreen();
	        });
	      };
	
	      Array.prototype.slice.call(document.body.querySelectorAll('.user-account-link')).forEach(function(link) {
	        initUserAccountLink(link);
	      });
	    }
	
	    setupUserAccounts();
	
	  });
	
	  function cleanUrlForDynamicLoader(urlId) {
	    if (urlId[urlId.length - 1] === '/') {
	      urlId = urlId.slice(0, -1);
	    }
	
	    if (urlId[0] !== '/') {
	      urlId = `/${urlId}`;
	    }
	
	    return urlId;
	  }
	
	  // GLOBAL FUNCTIONS
	  var dynamicLoaders = {};
	
	  function pageLoader() {
	
	    if (window.location.hash && window.location.hash != '#') {
	      var urlId = window.location.hash.split('#')[1];
	
	      urlId = urlId.charAt(0) == '/' ? urlId : '/' + urlId;
	      urlId = urlId.charAt(urlId.length-1) == '/' ? urlId : urlId + '/';
	
	      var activePage = Y.one('#projectPages .project[data-url="'+urlId+'"]');
	
	      if (activePage) {
	        if (activePage.hasAttribute('data-type-protected') || !activePage.hasClass('page-project') && !activePage.hasClass('gallery-project')) {
	          // navigate away for anything other than pages/galleries
	          window.location.replace(urlId);
	          return;
	        }
	
	        if (activePage.hasClass('page-project') && !activePage.hasClass('sqs-dynamic-data-ready')) {
	          var dynamicLoaderKey = cleanUrlForDynamicLoader(urlId);
	          var loader = dynamicLoaders[dynamicLoaderKey];
	          if (loader) {
	            loader.simulateHash(dynamicLoaderKey);
	          }
	        }
	      }
	
	      // set active on projectPages
	      Y.one('#page').addClass('page-open');
	
	      resetAudioVideoBlocks();
	
	      // remove active class from all project pages/thumbs
	      Y.all('.active-project').each(function(project) {
	        project.removeClass('active-project');
	      });
	
	      activePage.addClass('active-project');
	
	      // set active thumb
	      var activeThumb = Y.one('#projectThumbs a.project[href="'+urlId+'/"]');
	      if (activeThumb) {
	        activeThumb.addClass('active-project');
	      }
	
	      // set active navigation
	      if (activePage.next('.project')) {
	        Y.one('#projectNav .next-project').removeClass('disabled');
	      } else {
	        Y.one('#projectNav .next-project').addClass('disabled');
	      }
	      if (activePage.previous('.project')) {
	        Y.one('#projectNav .prev-project').removeClass('disabled');
	      } else {
	        Y.one('#projectNav .prev-project').addClass('disabled');
	      }
	
	      scrollToTop(function() {
	        Y.all('#projectPages .active-project img.loading').each(function(img) {
	          // Load Non-Block Images
	          if (!img.ancestor('.sqs-layout')) {
	            ImageLoader.load(img, { load: true });
	          }
	        });
	
	        Y.all('#projectPages .active-project .sqs-video-wrapper').each(function(video) {
	          video.videoloader.load();
	        });
	      });
	
	    } else { // no url hash
	
	      // clear active on projectPages
	      Y.one('#page').removeClass('page-open');
	
	      resetAudioVideoBlocks();
	
	      // remove active class from all project pages/thumbs
	      Y.all('.active-project').removeClass('active-project');
	
	    }
	  }
	
	  function resetAudioVideoBlocks() {
	    // Audio/video blocks need to be forced reset
	    var preActive = Y.one('#projectPages .active-project');
	    if (preActive && preActive.one('.video-block, .code-block, .embed-block, .audio-block')){
	      Y.fire('audioPlayer:stopAll', {container: preActive });
	      preActive.empty(true).removeClass('sqs-dynamic-data-ready').removeAttribute('data-dynamic-data-link');
	    }
	
	    if (preActive && preActive.one('.sqs-video-wrapper')) {
	      preActive.all('.sqs-video-wrapper').each(function(elem) {
	        elem.videoloader.reload();
	      });
	    }
	  }
	
	  function thumbLoader() {
	    var projectThumbs = Y.all('#projectThumbs img[data-src]');
	
	    // lazy load on scroll
	    var loadThumbsOnScreen = function() {
	      projectThumbs.each(function(img) {
	        if (img.inRegion(Y.one(Y.config.win).get('region'))) {
	          ImageLoader.load(img, { load: true });
	        }
	      });
	    };
	    loadThumbsOnScreen();
	    Y.on('scroll', loadThumbsOnScreen, Y.config.win);
	
	    // also load/refresh on resize
	    Y.one('window').on('resize', function(e){
	      loadThumbsOnScreen();
	    });
	
	
	    // Proactively lazy load
	    var lazyImageLoader = Y.later(100, this, function() {
	      var bInProcess = projectThumbs.some(function(img) {
	        if (img.hasClass('loading')) { // something is loading... wait
	          return true;
	        } else if(!img.getAttribute('src')) { // start the loading
	          ImageLoader.load(img, { load: true });
	          return true;
	        }
	      });
	      if (!bInProcess) {
	        lazyImageLoader.cancel();
	      }
	    }, null, true);
	  }
	
	  function thumbClickHandler() {
	    Y.all('#projectThumbs a.project').each(Y.bind(function(elem) {
	      var href = elem.getAttribute('href');
	      // set dynamic loader for pages
	      if (Y.one('#projectPages [data-url="'+href+'/"]').hasClass('page-project')) {
	        dynamicLoaders[cleanUrlForDynamicLoader(href)] = new Y.Squarespace.DynamicData({
	            wrapper: '#projectPages [data-url="'+href+'/"]',
	            target: 'a.project[href="'+href+'"]',
	            injectEl: 'section > *',
	            autoOpenHash: true,
	            useHashes: true,
	            scrollToWrapperPreLoad: true
	        });
	      } else {
	        elem.on('click', function(e) {
	          e.halt();
	          window.location.hash = '#' + elem.getAttribute('href');
	        });
	      }
	    }, this));
	  }
	
	  function scrollToTop(callback) {
	    var scrollNodes = Y.UA.gecko || Y.UA.ie >= 10 ? 'html' : 'body',
	        scrollLocation = Math.round(Y.one('#page').getXY()[1]);
	    new Y.Anim({
	      node: Y.one(document.scrollingElement || scrollNodes),
	      to: { scroll: [0, scrollLocation] },
	      duration: 0.2,
	      easing: Y.Easing.easeBoth
	    }).run().on('end', function() {
	      // Bug - yui anim seems to stop if target style couldnt be reached in time
	      if (Y.one(scrollNodes).get('scrollTop') != scrollLocation) {
	        Y.one(scrollNodes).set('scrollTop', scrollLocation);
	      }
	
	      callback && callback();
	    });
	  }
	
	  function lazyOnResize(f,t) {
	    var timer;
	    Y.one('window').on('resize', function(e){
	      if (timer) { timer.cancel(); }
	      timer = Y.later(t, this, f);
	    });
	  }
	
	});


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	var VideoBackground = __webpack_require__(9).VideoBackground;
	var getVideoProps = __webpack_require__(26);
	
	module.exports = {
	  'VideoBackground': VideoBackground,
	  'getVideoProps': getVideoProps
	};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.videoAutoplayTest = exports.VideoFilterPropertyValues = exports.VideoBackground = undefined;
	
	__webpack_require__(10);
	
	var _index = __webpack_require__(11);
	
	exports.VideoBackground = _index.VideoBackground;
	exports.VideoFilterPropertyValues = _index.VideoFilterPropertyValues;
	exports.videoAutoplayTest = _index.videoAutoplayTest;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	/**
	 * Polyfill for CustomEvent
	 *
	 * For the public domain version of this code, see:
	 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
	 * Added: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent$revision/716095
	 */
	
	(function () {
	
	  if ( typeof window.CustomEvent === "function" ) return false;
	
	  function CustomEvent ( event, params ) {
	    params = params || { bubbles: false, cancelable: false, detail: undefined };
	    var evt = document.createEvent( 'CustomEvent' );
	    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
	    return evt;
	   }
	
	  CustomEvent.prototype = window.Event.prototype;
	
	  window.CustomEvent = CustomEvent;
	})();

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.videoAutoplayTest = exports.VideoFilterPropertyValues = exports.VideoBackground = undefined;
	
	var _VideoBackground = __webpack_require__(12);
	
	var _VideoBackground2 = _interopRequireDefault(_VideoBackground);
	
	var _filter = __webpack_require__(25);
	
	var _browserAutoplayTest = __webpack_require__(15);
	
	var _browserAutoplayTest2 = _interopRequireDefault(_browserAutoplayTest);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.VideoBackground = _VideoBackground2.default;
	exports.VideoFilterPropertyValues = _filter.filterProperties;
	exports.videoAutoplayTest = _browserAutoplayTest2.default;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _lodash = __webpack_require__(13);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _browserAutoplayTest = __webpack_require__(15);
	
	var _browserAutoplayTest2 = _interopRequireDefault(_browserAutoplayTest);
	
	var _vimeo = __webpack_require__(17);
	
	var _youtube = __webpack_require__(24);
	
	var _instance = __webpack_require__(19);
	
	var _filter = __webpack_require__(25);
	
	var _utils = __webpack_require__(18);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var videoSourceModules = {
	  vimeo: {
	    api: _vimeo.initializeVimeoAPI,
	    player: _vimeo.initializeVimeoPlayer
	  },
	  youtube: {
	    api: _youtube.initializeYouTubeAPI,
	    player: _youtube.initializeYouTubePlayer
	  }
	
	  /**
	   * A class which uses the YouTube or Vimeo APIs to initialize an IFRAME with an embedded player.
	   * Additional display options and functionality are configured through a set of properties,
	   * superceding default properties.
	   */
	};
	var VideoBackground = function () {
	  /**
	   * @param {Object} props - An optional object with configuation.
	   * @param {Object} windowContext - The parent window object (due to .sqs-site-frame).
	   */
	  function VideoBackground(props) {
	    var _this = this;
	
	    var windowContext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window;
	
	    _classCallCheck(this, VideoBackground);
	
	    this.windowContext = windowContext;
	    this.events = [];
	    this.browserCanAutoPlay = false;
	    this.videoCanAutoPlay = false;
	
	    this.setInstanceProperties(props);
	
	    // Test browser support for autoplay for video elements
	    (0, _browserAutoplayTest2.default)().then(function (value) {
	      _this.logger(value);
	      _this.browserCanAutoPlay = true;
	      _this.initializeVideoAPI();
	    }, function (reason) {
	      // If there is no browser support, go to fall back behavior
	      _this.logger(reason);
	      _this.browserCanAutoPlay = false;
	      _this.renderFallbackBehavior();
	    }).then(function () {
	      _this.setDisplayEffects();
	      _this.bindUI();
	
	      if (_this.DEBUG.enabled === true) {
	        window.vdbg = _this;
	      }
	    });
	  }
	
	  _createClass(VideoBackground, [{
	    key: 'destroy',
	    value: function destroy() {
	      if (this.events) {
	        this.events.forEach(function (evt) {
	          return evt.target.removeEventListener(evt.type, evt.handler, true);
	        });
	      }
	      this.events = null;
	
	      if (this.player && typeof this.player.destroy === 'function') {
	        this.player.iframe.classList.remove('ready');
	        clearTimeout(this.playTimeout);
	        this.playTimeout = null;
	        this.player.destroy();
	        this.player = {};
	      }
	
	      if (typeof this.timer === 'number') {
	        clearTimeout(this.timer);
	        this.timer = null;
	      }
	    }
	  }, {
	    key: 'bindUI',
	    value: function bindUI() {
	      var _this2 = this;
	
	      var resizeHandler = function resizeHandler() {
	        _this2.windowContext.requestAnimationFrame(function () {
	          _this2.scaleVideo();
	        });
	      };
	      this.events.push({
	        target: this.windowContext,
	        type: 'resize',
	        handler: resizeHandler
	      });
	      this.windowContext.addEventListener('resize', resizeHandler, true);
	    }
	
	    /**
	     * @method setInstanceProperties Merge configuration properties with defaults with some minimal validation.
	     * @param {Object} [props] Configuration options
	     * @return {undefined}
	     */
	
	  }, {
	    key: 'setInstanceProperties',
	    value: function setInstanceProperties() {
	      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	
	      props = (0, _lodash2.default)({}, _instance.DEFAULT_PROPERTY_VALUES, props);
	
	      if (props.container.nodeType === 1) {
	        this.container = props.container;
	      } else if (typeof props.container === 'string') {
	        this.container = document.querySelector(props.container);
	      }
	      if (!this.container) {
	        console.error('Container ' + props.container + ' not found');
	        return false;
	      }
	
	      this.videoSource = (0, _utils.getVideoSource)(props.url);
	      this.videoId = (0, _utils.getVideoID)(props.url, this.videoSource);
	      this.customFallbackImage = (0, _utils.validatedImage)(props.customFallbackImage);
	      this.filter = props.filter;
	      this.filterStrength = props.filterStrength;
	      this.fitMode = props.fitMode;
	      this.scaleFactor = props.scaleFactor;
	      this.playbackSpeed = parseFloat(props.playbackSpeed) < 0.5 ? 1 : parseFloat(props.playbackSpeed);
	      this.timeCode = {
	        start: (0, _utils.getStartTime)(props.url, this.videoSource) || props.timeCode.start,
	        end: props.timeCode.end
	      };
	      this.player = {};
	      this.DEBUG = props.DEBUG;
	    }
	
	    /**
	     * @method setFallbackImage Loads a custom fallback image if the player cannot autoplay.
	     * @return {undefined}
	     */
	
	  }, {
	    key: 'setFallbackImage',
	    value: function setFallbackImage() {
	      var customFallbackImage = this.customFallbackImage;
	      if (!customFallbackImage || this.browserCanAutoPlay && this.videoCanAutoPlay) {
	        return;
	      }
	      customFallbackImage.addEventListener('load', function () {
	        customFallbackImage.classList.add('loaded');
	      }, { once: true });
	      if (this.windowContext.ImageLoader) {
	        this.windowContext.ImageLoader.load(customFallbackImage, { load: true });
	        return;
	      }
	      // Forcing a load event on the image when ImageLoader is not present
	      customFallbackImage.src = customFallbackImage.src;
	    }
	
	    /**
	     * @method initializeVideoAPI Load the API for the appropriate source. This abstraction normalizes the
	     * interfaces for YouTube and Vimeo, and potentially other providers.
	     * @return {undefined}
	     */
	
	  }, {
	    key: 'initializeVideoAPI',
	    value: function initializeVideoAPI() {
	      var _this3 = this;
	
	      if (this.browserCanAutoPlay && this.videoSource && this.videoId) {
	        this.player.ready = false;
	
	        var sourceAPIFunction = videoSourceModules[this.videoSource].api;
	        var apiPromise = sourceAPIFunction(this.windowContext);
	        apiPromise.then(function (message) {
	          _this3.logger(message);
	          _this3.player.ready = false;
	          _this3.initializeVideoPlayer();
	        }).catch(function (message) {
	          _this3.renderFallbackBehavior();
	          document.body.classList.add('ready');
	          _this3.logger(message);
	        });
	      } else {
	        this.renderFallbackBehavior();
	        document.body.classList.add('ready');
	      }
	    }
	
	    /**
	     * @method initializeVideoPlayer Initialize the video player and register its callbacks.
	     * @return {undefined}
	     */
	
	  }, {
	    key: 'initializeVideoPlayer',
	    value: function initializeVideoPlayer() {
	      var _this4 = this;
	
	      if (this.player.ready) {
	        try {
	          this.player.destroy();
	        } catch (e) {
	          // nothing to destroy
	        }
	        this.player.ready = false;
	      }
	
	      var sourcePlayerFunction = videoSourceModules[this.videoSource].player;
	      var playerPromise = sourcePlayerFunction({
	        instance: this,
	        container: this.container,
	        win: this.windowContext,
	        videoId: this.videoId,
	        startTime: this.timeCode.start,
	        speed: this.playbackSpeed,
	        readyCallback: function readyCallback(player, data) {
	          _this4.player.iframe.classList.add('background-video');
	          _this4.videoAspectRatio = (0, _utils.findPlayerAspectRatio)(_this4.container, _this4.player, _this4.videoSource);
	          _this4.syncPlayer();
	          var readyEvent = new CustomEvent('ready');
	          _this4.container.dispatchEvent(readyEvent);
	        },
	        stateChangeCallback: function stateChangeCallback(state, data) {
	          switch (state) {
	            case 'buffering':
	              _this4.testVideoEmbedAutoplay();
	              break;
	            case 'playing':
	              if (_this4.playTimeout !== null || !_this4.videoCanAutoPlay) {
	                _this4.testVideoEmbedAutoplay(true);
	              }
	              break;
	          }
	          if (state) {
	            _this4.logger(state);
	          }
	          if (data) {
	            _this4.logger(data);
	          }
	        }
	      });
	
	      playerPromise.then(function (player) {
	        _this4.player = player;
	      }, function (reason) {
	        _this4.logger(reason);
	        _this4.testVideoEmbedAutoplay(false);
	      });
	    }
	
	    /**
	      * @method testVideoEmbedAutoplay Since we cannot inspect the video element inside the provider's IFRAME to
	      * check for `autoplay` and `playsinline` attributes, set a timeout that will
	      * tell this instance that the media cannot auto play. The timeout will be
	      * cleared via the media's playback API if it does begin playing.
	      * @param {boolean} [success] Call the method initially without this param to begin
	      *   the test. Call again as `true` to clear the timeout and prevent mobile fallback behavior.
	      * @return {undefined}
	      */
	
	  }, {
	    key: 'testVideoEmbedAutoplay',
	    value: function testVideoEmbedAutoplay() {
	      var _this5 = this;
	
	      var success = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
	
	      if (success === undefined) {
	        this.logger('test video autoplay: begin');
	        if (this.playTimeout) {
	          clearTimeout(this.playTimeout);
	          this.playTimeout = null;
	        }
	        this.playTimeout = setTimeout(function () {
	          _this5.testVideoEmbedAutoplay(false);
	        }, _instance.TIMEOUT);
	      }
	      if (success === true) {
	        clearTimeout(this.playTimeout);
	        this.logger('test video autoplay: success');
	        this.playTimeout = null;
	        this.videoCanAutoPlay = true;
	        this.player.ready = true;
	        this.player.iframe.classList.add('ready');
	        this.container.classList.remove('mobile');
	        return;
	      }
	      if (success === false) {
	        clearTimeout(this.playTimeout);
	        this.logger('test video autoplay: failure');
	        this.playTimeout = null;
	        this.videoCanAutoPlay = false;
	        this.renderFallbackBehavior();
	        return;
	      }
	    }
	
	    /**
	      * @method renderFallbackBehavior Initialize mobile fallback behavior
	      * @return {undefined}
	      */
	
	  }, {
	    key: 'renderFallbackBehavior',
	    value: function renderFallbackBehavior() {
	      this.setFallbackImage();
	      this.container.classList.add('mobile');
	      this.logger('added mobile');
	    }
	
	    /**
	      * @method syncPlayer Apply the purely visual effects.
	      * @return {undefined}
	      */
	
	  }, {
	    key: 'syncPlayer',
	    value: function syncPlayer() {
	      this.setDisplayEffects();
	      this.setSpeed();
	      this.scaleVideo();
	    }
	
	    /**
	     * @method scaleVideo The IFRAME will be the entire width and height of its container, but the video
	     * may be a completely different size and ratio. Scale up the IFRAME so the inner video
	     * behaves in the proper `fitMode`, with optional additional scaling to zoom in. Also allow
	     * ImageLoader to reload the custom fallback image, if appropriate.
	     * @param {Number} [scaleValue] A multipiler used to increase the scaled size of the media.
	     * @return {undefined}
	     */
	
	  }, {
	    key: 'scaleVideo',
	    value: function scaleVideo(scaleValue) {
	      this.setFallbackImage();
	
	      var playerIframe = this.player.iframe;
	      if (!playerIframe) {
	        return;
	      }
	
	      var scale = scaleValue || this.scaleFactor;
	
	      if (this.fitMode !== 'fill') {
	        playerIframe.style.width = '';
	        playerIframe.style.height = '';
	        return;
	      }
	
	      var containerWidth = playerIframe.parentNode.clientWidth;
	      var containerHeight = playerIframe.parentNode.clientHeight;
	      var containerRatio = containerWidth / containerHeight;
	      var pWidth = 0;
	      var pHeight = 0;
	      if (containerRatio > this.videoAspectRatio) {
	        // at the same width, the video is taller than the window
	        pWidth = containerWidth * scale;
	        pHeight = containerWidth * scale / this.videoAspectRatio;
	      } else if (this.videoAspectRatio > containerRatio) {
	        // at the same width, the video is shorter than the window
	        pWidth = containerHeight * scale * this.videoAspectRatio;
	        pHeight = containerHeight * scale;
	      } else {
	        // the window and video ratios match
	        pWidth = containerWidth * scale;
	        pHeight = containerHeight * scale;
	      }
	      playerIframe.style.width = pWidth + 'px';
	      playerIframe.style.height = pHeight + 'px';
	      playerIframe.style.left = 0 - (pWidth - containerWidth) / 2 + 'px';
	      playerIframe.style.top = 0 - (pHeight - containerHeight) / 2 + 'px';
	    }
	
	    /**
	     * @method setSpeed Play back speed options, based on the YouTube API options.
	     * @param {Number} [speedValue] Set the playback rate for YouTube videos.
	     * @return {undefined}
	     */
	
	  }, {
	    key: 'setSpeed',
	    value: function setSpeed(speedValue) {
	      this.playbackSpeed = parseFloat(this.playbackSpeed);
	      if (this.player.setPlaybackRate) {
	        this.player.setPlaybackRate(this.playbackSpeed);
	      }
	    }
	
	    /**
	     * @method setDisplayEffects All diplay related effects should be applied prior to the
	     * video loading to ensure the effects are visible on the fallback image, as well.
	     * @return {undefined}
	     */
	
	  }, {
	    key: 'setDisplayEffects',
	    value: function setDisplayEffects() {
	      // there were to be others here... now so lonely
	      this.setFilter();
	    }
	
	    /**
	     * @method setFilter Apply filter with values based on filterStrength.
	     * @return {undefined}
	     */
	
	  }, {
	    key: 'setFilter',
	    value: function setFilter() {
	      var containerStyle = this.container.style;
	      var filter = _filter.filterOptions[this.filter - 1];
	      var filterStyle = '';
	      if (filter !== 'none') {
	        filterStyle = this.getFilterStyle(filter, this.filterStrength);
	      }
	
	      // To prevent the blur effect from displaying the background at the edges as
	      // part of the blur the media elements need to be scaled slightly.
	      var isBlur = filter === 'blur';
	      containerStyle.webkitFilter = isBlur ? '' : filterStyle;
	      containerStyle.filter = isBlur ? '' : filterStyle;
	      this.container.classList.toggle('filter-blur', isBlur);
	
	      Array.prototype.slice.call(this.container.children).forEach(function (el) {
	        el.style.webkitFilter = !isBlur ? '' : filterStyle;
	        el.style.filter = !isBlur ? '' : filterStyle;
	      });
	    }
	
	    /**
	     * @method getFilterStyle Construct the style based on the filter, strength and `FILTER_PROPERTIES`.
	     * @param {String} [filter] A string from `FILTER_PROPERTIES`.
	     * @param {Number}[strength] A number from 0 to 100 to apply to the filter.
	     */
	
	  }, {
	    key: 'getFilterStyle',
	    value: function getFilterStyle(filter, strength) {
	      return filter + '(' + (_filter.filterProperties[filter].modifier(strength) + _filter.filterProperties[filter].unit) + ')';
	    }
	
	    /**
	     * @method logger A guarded console logger.
	     * @return {undefined}
	     */
	
	  }, {
	    key: 'logger',
	    value: function logger(msg) {
	      if (!this.DEBUG.enabled || !this.DEBUG.verbose) {
	        return;
	      }
	
	      this.windowContext.console.log(msg);
	    }
	  }]);
	
	  return VideoBackground;
	}();
	
	exports.default = VideoBackground;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {/**
	 * Lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 800,
	    HOT_SPAN = 16;
	
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    asyncTag = '[object AsyncFunction]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    nullTag = '[object Null]',
	    objectTag = '[object Object]',
	    proxyTag = '[object Proxy]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    undefinedTag = '[object Undefined]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
	
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
	
	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;
	
	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;
	
	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    // Use `util.types` for Node.js 10+.
	    var types = freeModule && freeModule.require && freeModule.require('util').types;
	
	    if (types) {
	      return types;
	    }
	
	    // Legacy `process.binding('util')` for Node.js < 10.
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());
	
	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
	
	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  switch (args.length) {
	    case 0: return func.call(thisArg);
	    case 1: return func.call(thisArg, args[0]);
	    case 2: return func.call(thisArg, args[0], args[1]);
	    case 3: return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}
	
	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);
	
	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}
	
	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}
	
	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	
	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}
	
	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;
	
	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined,
	    Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
	    getPrototype = overArg(Object.getPrototypeOf, Object),
	    objectCreate = Object.create,
	    propertyIsEnumerable = objectProto.propertyIsEnumerable,
	    splice = arrayProto.splice,
	    symToStringTag = Symbol ? Symbol.toStringTag : undefined;
	
	var defineProperty = (function() {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());
	
	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
	    nativeMax = Math.max,
	    nativeNow = Date.now;
	
	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map'),
	    nativeCreate = getNative(Object, 'create');
	
	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} proto The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	var baseCreate = (function() {
	  function object() {}
	  return function(proto) {
	    if (!isObject(proto)) {
	      return {};
	    }
	    if (objectCreate) {
	      return objectCreate(proto);
	    }
	    object.prototype = proto;
	    var result = new object;
	    object.prototype = undefined;
	    return result;
	  };
	}());
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	  this.size = 0;
	}
	
	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}
	
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}
	
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
	}
	
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}
	
	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	  this.size = 0;
	}
	
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}
	
	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  return index < 0 ? undefined : data[index][1];
	}
	
	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}
	
	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}
	
	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  var result = getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}
	
	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}
	
	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}
	
	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;
	
	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}
	
	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	
	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	}
	
	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	  this.size = 0;
	}
	
	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	      result = data['delete'](key);
	
	  this.size = data.size;
	  return result;
	}
	
	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}
	
	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}
	
	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var data = this.__data__;
	  if (data instanceof ListCache) {
	    var pairs = data.__data__;
	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new MapCache(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}
	
	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;
	
	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray(value),
	      isArg = !isArr && isArguments(value),
	      isBuff = !isArr && !isArg && isBuffer(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;
	
	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	/**
	 * This function is like `assignValue` except that it doesn't assign
	 * `undefined` values.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignMergeValue(object, key, value) {
	  if ((value !== undefined && !eq(object[key], value)) ||
	      (value === undefined && !(key in object))) {
	    baseAssignValue(object, key, value);
	  }
	}
	
	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue(object, key, value) {
	  var objValue = object[key];
	  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
	      (value === undefined && !(key in object))) {
	    baseAssignValue(object, key, value);
	  }
	}
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function baseAssignValue(object, key, value) {
	  if (key == '__proto__' && defineProperty) {
	    defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}
	
	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();
	
	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}
	
	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments(value) {
	  return isObjectLike(value) && baseGetTag(value) == argsTag;
	}
	
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}
	
	/**
	 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeysIn(object) {
	  if (!isObject(object)) {
	    return nativeKeysIn(object);
	  }
	  var isProto = isPrototype(object),
	      result = [];
	
	  for (var key in object) {
	    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	/**
	 * The base implementation of `_.merge` without support for multiple sources.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} [customizer] The function to customize merged values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */
	function baseMerge(object, source, srcIndex, customizer, stack) {
	  if (object === source) {
	    return;
	  }
	  baseFor(source, function(srcValue, key) {
	    stack || (stack = new Stack);
	    if (isObject(srcValue)) {
	      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
	    }
	    else {
	      var newValue = customizer
	        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
	        : undefined;
	
	      if (newValue === undefined) {
	        newValue = srcValue;
	      }
	      assignMergeValue(object, key, newValue);
	    }
	  }, keysIn);
	}
	
	/**
	 * A specialized version of `baseMerge` for arrays and objects which performs
	 * deep merges and tracks traversed objects enabling objects with circular
	 * references to be merged.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {string} key The key of the value to merge.
	 * @param {number} srcIndex The index of `source`.
	 * @param {Function} mergeFunc The function to merge values.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {Object} [stack] Tracks traversed source values and their merged
	 *  counterparts.
	 */
	function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
	  var objValue = safeGet(object, key),
	      srcValue = safeGet(source, key),
	      stacked = stack.get(srcValue);
	
	  if (stacked) {
	    assignMergeValue(object, key, stacked);
	    return;
	  }
	  var newValue = customizer
	    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
	    : undefined;
	
	  var isCommon = newValue === undefined;
	
	  if (isCommon) {
	    var isArr = isArray(srcValue),
	        isBuff = !isArr && isBuffer(srcValue),
	        isTyped = !isArr && !isBuff && isTypedArray(srcValue);
	
	    newValue = srcValue;
	    if (isArr || isBuff || isTyped) {
	      if (isArray(objValue)) {
	        newValue = objValue;
	      }
	      else if (isArrayLikeObject(objValue)) {
	        newValue = copyArray(objValue);
	      }
	      else if (isBuff) {
	        isCommon = false;
	        newValue = cloneBuffer(srcValue, true);
	      }
	      else if (isTyped) {
	        isCommon = false;
	        newValue = cloneTypedArray(srcValue, true);
	      }
	      else {
	        newValue = [];
	      }
	    }
	    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
	      newValue = objValue;
	      if (isArguments(objValue)) {
	        newValue = toPlainObject(objValue);
	      }
	      else if (!isObject(objValue) || isFunction(objValue)) {
	        newValue = initCloneObject(srcValue);
	      }
	    }
	    else {
	      isCommon = false;
	    }
	  }
	  if (isCommon) {
	    // Recursively merge objects and arrays (susceptible to call stack limits).
	    stack.set(srcValue, newValue);
	    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
	    stack['delete'](srcValue);
	  }
	  assignMergeValue(object, key, newValue);
	}
	
	/**
	 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 */
	function baseRest(func, start) {
	  return setToString(overRest(func, start, identity), func + '');
	}
	
	/**
	 * The base implementation of `setToString` without support for hot loop shorting.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetToString = !defineProperty ? identity : function(func, string) {
	  return defineProperty(func, 'toString', {
	    'configurable': true,
	    'enumerable': false,
	    'value': constant(string),
	    'writable': true
	  });
	};
	
	/**
	 * Creates a clone of  `buffer`.
	 *
	 * @private
	 * @param {Buffer} buffer The buffer to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Buffer} Returns the cloned buffer.
	 */
	function cloneBuffer(buffer, isDeep) {
	  if (isDeep) {
	    return buffer.slice();
	  }
	  var length = buffer.length,
	      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
	
	  buffer.copy(result);
	  return result;
	}
	
	/**
	 * Creates a clone of `arrayBuffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function cloneArrayBuffer(arrayBuffer) {
	  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
	  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
	  return result;
	}
	
	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */
	function cloneTypedArray(typedArray, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	}
	
	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray(source, array) {
	  var index = -1,
	      length = source.length;
	
	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}
	
	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property identifiers to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */
	function copyObject(source, props, object, customizer) {
	  var isNew = !object;
	  object || (object = {});
	
	  var index = -1,
	      length = props.length;
	
	  while (++index < length) {
	    var key = props[index];
	
	    var newValue = customizer
	      ? customizer(object[key], source[key], key, object, source)
	      : undefined;
	
	    if (newValue === undefined) {
	      newValue = source[key];
	    }
	    if (isNew) {
	      baseAssignValue(object, key, newValue);
	    } else {
	      assignValue(object, key, newValue);
	    }
	  }
	  return object;
	}
	
	/**
	 * Creates a function like `_.assign`.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return baseRest(function(object, sources) {
	    var index = -1,
	        length = sources.length,
	        customizer = length > 1 ? sources[length - 1] : undefined,
	        guard = length > 2 ? sources[2] : undefined;
	
	    customizer = (assigner.length > 3 && typeof customizer == 'function')
	      ? (length--, customizer)
	      : undefined;
	
	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }
	    object = Object(object);
	    while (++index < length) {
	      var source = sources[index];
	      if (source) {
	        assigner(object, source, index, customizer);
	      }
	    }
	    return object;
	  });
	}
	
	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;
	
	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	
	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}
	
	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];
	
	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}
	
	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}
	
	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  return (typeof object.constructor == 'function' && !isPrototype(object))
	    ? baseCreate(getPrototype(object))
	    : {};
	}
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	
	  return !!length &&
	    (type == 'number' ||
	      (type != 'symbol' && reIsUint.test(value))) &&
	        (value > -1 && value % 1 == 0 && value < length);
	}
	
	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	        ? (isArrayLike(object) && isIndex(index, object.length))
	        : (type == 'string' && index in object)
	      ) {
	    return eq(object[index], value);
	  }
	  return false;
	}
	
	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}
	
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}
	
	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;
	
	  return value === proto;
	}
	
	/**
	 * This function is like
	 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * except that it includes inherited enumerable properties.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function nativeKeysIn(object) {
	  var result = [];
	  if (object != null) {
	    for (var key in Object(object)) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}
	
	/**
	 * A specialized version of `baseRest` which transforms the rest array.
	 *
	 * @private
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @param {Function} transform The rest array transform.
	 * @returns {Function} Returns the new function.
	 */
	function overRest(func, start, transform) {
	  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);
	
	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    index = -1;
	    var otherArgs = Array(start + 1);
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = transform(array);
	    return apply(func, this, otherArgs);
	  };
	}
	
	/**
	 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function safeGet(object, key) {
	  if (key === 'constructor' && typeof object[key] === 'function') {
	    return;
	  }
	
	  if (key == '__proto__') {
	    return;
	  }
	
	  return object[key];
	}
	
	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var setToString = shortOut(baseSetToString);
	
	/**
	 * Creates a function that'll short out and invoke `identity` instead
	 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	 * milliseconds.
	 *
	 * @private
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new shortable function.
	 */
	function shortOut(func) {
	  var count = 0,
	      lastCalled = 0;
	
	  return function() {
	    var stamp = nativeNow(),
	        remaining = HOT_SPAN - (stamp - lastCalled);
	
	    lastCalled = stamp;
	    if (remaining > 0) {
	      if (++count >= HOT_COUNT) {
	        return arguments[0];
	      }
	    } else {
	      count = 0;
	    }
	    return func.apply(undefined, arguments);
	  };
	}
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}
	
	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}
	
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
	    !propertyIsEnumerable.call(value, 'callee');
	};
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;
	
	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}
	
	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}
	
	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  if (!isObject(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}
	
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
	    funcToString.call(Ctor) == objectCtorString;
	}
	
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
	
	/**
	 * Converts `value` to a plain object flattening inherited enumerable string
	 * keyed properties of `value` to own properties of the plain object.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {Object} Returns the converted plain object.
	 * @example
	 *
	 * function Foo() {
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.assign({ 'a': 1 }, new Foo);
	 * // => { 'a': 1, 'b': 2 }
	 *
	 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	 * // => { 'a': 1, 'b': 2, 'c': 3 }
	 */
	function toPlainObject(value) {
	  return copyObject(value, keysIn(value));
	}
	
	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
	}
	
	/**
	 * This method is like `_.assign` except that it recursively merges own and
	 * inherited enumerable string keyed properties of source objects into the
	 * destination object. Source properties that resolve to `undefined` are
	 * skipped if a destination value exists. Array and plain object properties
	 * are merged recursively. Other objects and value types are overridden by
	 * assignment. Source objects are applied from left to right. Subsequent
	 * sources overwrite property assignments of previous sources.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.5.0
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * var object = {
	 *   'a': [{ 'b': 2 }, { 'd': 4 }]
	 * };
	 *
	 * var other = {
	 *   'a': [{ 'c': 3 }, { 'e': 5 }]
	 * };
	 *
	 * _.merge(object, other);
	 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
	 */
	var merge = createAssigner(function(object, source, srcIndex) {
	  baseMerge(object, source, srcIndex);
	});
	
	/**
	 * Creates a function that returns `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {*} value The value to return from the new function.
	 * @returns {Function} Returns the new constant function.
	 * @example
	 *
	 * var objects = _.times(2, _.constant({ 'a': 1 }));
	 *
	 * console.log(objects);
	 * // => [{ 'a': 1 }, { 'a': 1 }]
	 *
	 * console.log(objects[0] === objects[1]);
	 * // => true
	 */
	function constant(value) {
	  return function() {
	    return value;
	  };
	}
	
	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}
	
	module.exports = merge;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(14)(module)))

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	The MIT License (MIT)
	Copyright (c) 2016
	Faruk Ates
	Paul Irish
	Alex Sexton
	Ryan Seddon
	Patrick Kettner
	Stu Cox
	Richard Herrera
	
	Permission is hereby granted, free of charge, to any person obtaining a copy of
	this software and associated documentation files (the "Software"), to deal in
	the Software without restriction, including without limitation the rights to
	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
	of the Software, and to permit persons to whom the Software is furnished to do
	so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/
	
	var DEBUG = false; // `reject`, `resolve`, or false
	
	var _require = __webpack_require__(16),
	    OggVideo = _require.OggVideo,
	    Mp4Video = _require.Mp4Video;
	
	/**
	 * @method VideoAutoplayTest Dynamically creates a video element to test browser support
	 *    for autoplay, given the proper browser vendor conditions are met.
	 * @return {Promise}
	 */
	
	
	var VideoAutoplayTest = function VideoAutoplayTest() {
	  return new Promise(function (resolve, reject) {
	    if (DEBUG === 'resolve') {
	      resolve('resolved for debugging');
	      return;
	    } else if (DEBUG === 'reject') {
	      reject('rejected for debugging');
	      return;
	    }
	
	    var elem = document.createElement('video');
	    elem.autoplay = true;
	    elem.setAttribute('autoplay', true);
	    elem.muted = true;
	    elem.setAttribute('muted', true);
	    elem.playsinline = true;
	    elem.setAttribute('playsinline', true);
	    elem.volume = 0;
	    elem.setAttribute('data-is-playing', 'false');
	    elem.setAttribute('style', 'width: 1px; height: 1px; position: fixed; top: 0; left: 0; z-index: 100;');
	    document.body.appendChild(elem);
	
	    var failsafeTimer = null;
	
	    var cleanUp = function cleanUp() {
	      if (failsafeTimer) {
	        clearTimeout(failsafeTimer);
	        failsafeTimer = null;
	      }
	
	      try {
	        document.body.removeChild(elem);
	      } catch (err) {
	        return;
	      }
	    };
	
	    try {
	      if (elem.canPlayType('video/ogg; codecs="theora"').match(/^(probably)|(maybe)/)) {
	        elem.src = OggVideo;
	      } else if (elem.canPlayType('video/mp4; codecs="avc1.42E01E"').match(/^(probably)|(maybe)/)) {
	        elem.src = Mp4Video;
	      } else {
	        cleanUp();
	        reject('no autoplay: element does not support mp4 or ogg format');
	        return;
	      }
	    } catch (err) {
	      cleanUp();
	      reject('no autoplay: ' + err);
	      return;
	    }
	
	    elem.addEventListener('play', function () {
	      elem.setAttribute('data-is-playing', 'true');
	      failsafeTimer = setTimeout(function () {
	        cleanUp();
	        reject('no autoplay: unsure');
	      }, 3000);
	    });
	
	    elem.addEventListener('canplay', function () {
	      if (elem.getAttribute('data-is-playing') === 'true') {
	        cleanUp();
	        resolve('autoplay supported');
	        return true;
	      }
	      cleanUp();
	      reject('no autoplay: browser does not support autoplay');
	      return false;
	    });
	
	    elem.load();
	    elem.play();
	  });
	};
	
	exports.default = VideoAutoplayTest;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var OggVideo = 'data:video/ogg;base64,T2dnUwACAAAAAAAAAABmnCATAAAAAHDEixYBKoB0aGVvcmEDAgEAAQABAAAQAAAQAAAAAAAFAAAAAQAAAAAAAAAAAGIAYE9nZ1MAAAAAAAAAAAAAZpwgEwEAAAACrA7TDlj///////////////+QgXRoZW9yYSsAAABYaXBoLk9yZyBsaWJ0aGVvcmEgMS4xIDIwMDkwODIyIChUaHVzbmVsZGEpAQAAABoAAABFTkNPREVSPWZmbXBlZzJ0aGVvcmEtMC4yOYJ0aGVvcmG+zSj3uc1rGLWpSUoQc5zmMYxSlKQhCDGMYhCEIQhAAAAAAAAAAAAAEW2uU2eSyPxWEvx4OVts5ir1aKtUKBMpJFoQ/nk5m41mUwl4slUpk4kkghkIfDwdjgajQYC8VioUCQRiIQh8PBwMhgLBQIg4FRba5TZ5LI/FYS/Hg5W2zmKvVoq1QoEykkWhD+eTmbjWZTCXiyVSmTiSSCGQh8PB2OBqNBgLxWKhQJBGIhCHw8HAyGAsFAiDgUCw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDAwPEhQUFQ0NDhESFRUUDg4PEhQVFRUOEBETFBUVFRARFBUVFRUVEhMUFRUVFRUUFRUVFRUVFRUVFRUVFRUVEAwLEBQZGxwNDQ4SFRwcGw4NEBQZHBwcDhATFhsdHRwRExkcHB4eHRQYGxwdHh4dGxwdHR4eHh4dHR0dHh4eHRALChAYKDM9DAwOExo6PDcODRAYKDlFOA4RFh0zV1A+EhYlOkRtZ00YIzdAUWhxXDFATldneXhlSFxfYnBkZ2MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEhIVGRoaGhoSFBYaGhoaGhUWGRoaGhoaGRoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhESFh8kJCQkEhQYIiQkJCQWGCEkJCQkJB8iJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQREhgvY2NjYxIVGkJjY2NjGBo4Y2NjY2MvQmNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRISEhUXGBkbEhIVFxgZGxwSFRcYGRscHRUXGBkbHB0dFxgZGxwdHR0YGRscHR0dHhkbHB0dHR4eGxwdHR0eHh4REREUFxocIBERFBcaHCAiERQXGhwgIiUUFxocICIlJRcaHCAiJSUlGhwgIiUlJSkcICIlJSUpKiAiJSUlKSoqEBAQFBgcICgQEBQYHCAoMBAUGBwgKDBAFBgcICgwQEAYHCAoMEBAQBwgKDBAQEBgICgwQEBAYIAoMEBAQGCAgAfF5cdH1e3Ow/L66wGmYnfIUbwdUTe3LMRbqON8B+5RJEvcGxkvrVUjTMrsXYhAnIwe0dTJfOYbWrDYyqUrz7dw/JO4hpmV2LsQQvkUeGq1BsZLx+cu5iV0e0eScJ91VIQYrmqfdVSK7GgjOU0oPaPOu5IcDK1mNvnD+K8LwS87f8Jx2mHtHnUkTGAurWZlNQa74ZLSFH9oF6FPGxzLsjQO5Qe0edcpttd7BXBSqMCL4k/4tFrHIPuEQ7m1/uIWkbDMWVoDdOSuRQ9286kvVUlQjzOE6VrNguN4oRXYGkgcnih7t13/9kxvLYKQezwLTrO44sVmMPgMqORo1E0sm1/9SludkcWHwfJwTSybR4LeAz6ugWVgRaY8mV/9SluQmtHrzsBtRF/wPY+X0JuYTs+ltgrXAmlk10xQHmTu9VSIAk1+vcvU4ml2oNzrNhEtQ3CysNP8UeR35wqpKUBdGdZMSjX4WVi8nJpdpHnbhzEIdx7mwf6W1FKAiucMXrWUWVjyRf23chNtR9mIzDoT/6ZLYailAjhFlZuvPtSeZ+2oREubDoWmT3TguY+JHPdRVSLKxfKH3vgNqJ/9emeEYikGXDFNzaLjvTeGAL61mogOoeG3y6oU4rW55ydoj0lUTSR/mmRhPmF86uwIfzp3FtiufQCmppaHDlGE0r2iTzXIw3zBq5hvaTldjG4CPb9wdxAme0SyedVKczJ9AtYbgPOzYKJvZZImsN7ecrxWZg5dR6ZLj/j4qpWsIA+vYwE+Tca9ounMIsrXMB4Stiib2SPQtZv+FVIpfEbzv8ncZoLBXc3YBqTG1HsskTTotZOYTG+oVUjLk6zhP8bg4RhMUNtfZdO7FdpBuXzhJ5Fh8IKlJG7wtD9ik8rWOJxy6iQ3NwzBpQ219mlyv+FLicYs2iJGSE0u2txzed++D61ZWCiHD/cZdQVCqkO2gJpdpNaObhnDfAPrT89RxdWFZ5hO3MseBSIlANppdZNIV/Rwe5eLTDvkfWKzFnH+QJ7m9QWV1KdwnuIwTNtZdJMoXBf74OhRnh2t+OTGL+AVUnIkyYY+QG7g9itHXyF3OIygG2s2kud679ZWKqSFa9n3IHD6MeLv1lZ0XyduRhiDRtrNnKoyiFVLcBm0ba5Yy3fQkDh4XsFE34isVpOzpa9nR8iCpS4HoxG2rJpnRhf3YboVa1PcRouh5LIJv/uQcPNd095ickTaiGBnWLKVWRc0OnYTSyex/n2FofEPnDG8y3PztHrzOLK1xo6RAml2k9owKajOC0Wr4D5x+3nA0UEhK2m198wuBHF3zlWWVKWLN1CHzLClUfuoYBcx4b1llpeBKmbayaR58njtE9onD66lUcsg0Spm2snsb+8HaJRn4dYcLbCuBuYwziB8/5U1C1DOOz2gZjSZtrLJk6vrLF3hwY4Io9xuT/ruUFRSBkNtUzTOWhjh26irLEPx4jPZL3Fo3QrReoGTTM21xYTT9oFdhTUIvjqTkfkvt0bzgVUjq/hOYY8j60IaO/0AzRBtqkTS6R5ellZd5uKdzzhb8BFlDdAcrwkE0rbXTOPB+7Y0FlZO96qFL4Ykg21StJs8qIW7h16H5hGiv8V2Cflau7QVDepTAHa6Lgt6feiEvJDM21StJsmOH/hynURrKxvUpQ8BH0JF7BiyG2qZpnL/7AOU66gt+reLEXY8pVOCQvSsBtqZTNM8bk9ohRcwD18o/WVkbvrceVKRb9I59IEKysjBeTMmmbA21xu/6iHadLRxuIzkLpi8wZYmmbbWi32RVAUjruxWlJ//iFxE38FI9hNKOoCdhwf5fDe4xZ81lgREhK2m1j78vW1CqkuMu/AjBNK210kzRUX/B+69cMMUG5bYrIeZxVSEZISmkzbXOi9yxwIfPgdsov7R71xuJ7rFcACjG/9PzApqFq7wEgzNJm2suWESPuwrQvejj7cbnQxMkxpm21lUYJL0fKmogPPqywn7e3FvB/FCNxPJ85iVUkCE9/tLKx31G4CgNtWTTPFhMvlu8G4/TrgaZttTChljfNJGgOT2X6EqpETy2tYd9cCBI4lIXJ1/3uVUllZEJz4baqGF64yxaZ+zPLYwde8Uqn1oKANtUrSaTOPHkhvuQP3bBlEJ/LFe4pqQOHUI8T8q7AXx3fLVBgSCVpMba55YxN3rv8U1Dv51bAPSOLlZWebkL8vSMGI21lJmmeVxPRwFlZF1CpqCN8uLwymaZyjbXHCRytogPN3o/n74CNykfT+qqRv5AQlHcRxYrC5KvGmbbUwmZY/29BvF6C1/93x4WVglXDLFpmbapmF89HKTogRwqqSlGbu+oiAkcWFbklC6Zhf+NtTLFpn8oWz+HsNRVSgIxZWON+yVyJlE5tq/+GWLTMutYX9ekTySEQPLVNQQ3OfycwJBM0zNtZcse7CvcKI0V/zh16Dr9OSA21MpmmcrHC+6pTAPHPwoit3LHHqs7jhFNRD6W8+EBGoSEoaZttTCZljfduH/fFisn+dRBGAZYtMzbVMwvul/T/crK1NQh8gN0SRRa9cOux6clC0/mDLFpmbarmF8/e6CopeOLCNW6S/IUUg3jJIYiAcDoMcGeRbOvuTPjXR/tyo79LK3kqqkbxkkMRAOB0GODPItnX3Jnxro/25Ud+llbyVVSN4ySGIgHA6DHBnkWzr7kz410f7cqO/Syt5KqpFVJwn6gBEvBM0zNtZcpGOEPiysW8vvRd2R0f7gtjhqUvXL+gWVwHm4XJDBiMpmmZtrLfPwd/IugP5+fKVSysH1EXreFAcEhelGmbbUmZY4Xdo1vQWVnK19P4RuEnbf0gQnR+lDCZlivNM22t1ESmopPIgfT0duOfQrsjgG4tPxli0zJmF5trdL1JDUIUT1ZXSqQDeR4B8mX3TrRro/2McGeUvLtwo6jIEKMkCUXWsLyZROd9P/rFYNtXPBli0z398iVUlVKAjFlY437JXImUTm2r/4ZYtMy61hf16RPJIU9nZ1MABAwAAAAAAAAAZpwgEwIAAABhp658BScAAAAAAADnUFBQXIDGXLhwtttNHDhw5OcpQRMETBEwRPduylKVB0HRdF0A'; //eslint-disable-line max-len
	var Mp4Video = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFA8SJZYAQAGaOvjyyLAAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsUAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU2LjQwLjEwMQ=='; //eslint-disable-line max-len
	
	exports.OggVideo = OggVideo;
	exports.Mp4Video = Mp4Video;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.initializeVimeoPlayer = exports.initializeVimeoAPI = undefined;
	
	var _utils = __webpack_require__(18);
	
	var _instance = __webpack_require__(19);
	
	var playerIframe = void 0;
	var playerOrigin = '*';
	var playerPromiseTimer = null;
	
	/**
	 * Call the Vimeo API per their guidelines.
	 */
	var initializeVimeoAPI = function initializeVimeoAPI() {
	  // No external API call is necessary, preserved for parity with YouTube and
	  // potential additional integrations.
	  return new Promise(function (resolve, reject) {
	    resolve('no api needed');
	  });
	};
	
	/**
	 * Creates cross frame postMessage handlers, gets proper dimensions of player,
	 * and sets ready state for the player and container.
	 *
	 */
	var postMessageManager = function postMessageManager(action, value) {
	  var data = {
	    method: action
	  };
	
	  if (value) {
	    data.value = value;
	  }
	
	  var message = JSON.stringify(data);
	  playerIframe.ownerDocument.defaultView.eval('(function(playerIframe){ playerIframe.contentWindow.postMessage(' + message + ', ' + JSON.stringify(playerOrigin) + ') })')(playerIframe);
	};
	
	/**
	 * Initialize the player and bind player events with a postMessage handler.
	 */
	var initializeVimeoPlayer = function initializeVimeoPlayer(_ref) {
	  var win = _ref.win,
	      instance = _ref.instance,
	      container = _ref.container,
	      videoId = _ref.videoId,
	      startTime = _ref.startTime,
	      readyCallback = _ref.readyCallback,
	      stateChangeCallback = _ref.stateChangeCallback;
	
	  return new Promise(function (resolve, reject) {
	    var logger = instance.logger || function () {};
	    playerIframe = win.document.createElement('iframe');
	    playerIframe.id = 'vimeoplayer';
	    var playerConfig = '&background=1';
	    playerIframe.src = '//player.vimeo.com/video/' + videoId + '?api=1' + playerConfig;
	    var wrapper = (0, _utils.getPlayerElement)(container);
	    wrapper.appendChild(playerIframe);
	
	    var player = {
	      iframe: playerIframe,
	      setPlaybackRate: function setPlaybackRate() {}
	    };
	    resolve(player);
	
	    var getVideoDetails = function getVideoDetails() {
	      postMessageManager('getDuration');
	      postMessageManager('getVideoHeight');
	      postMessageManager('getVideoWidth');
	    };
	
	    var retryTimer = null;
	    var syncAndStartPlayback = function syncAndStartPlayback() {
	      var isRetrying = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	
	      if (!isRetrying && (!player.dimensions.width || !player.dimensions.height || !player.duration)) {
	        return;
	      }
	
	      if (isRetrying) {
	        getVideoDetails();
	      }
	
	      player.dimensions.width = player.dimensions.width || player.iframe.parentNode.offsetWidth;
	      player.dimensions.height = player.dimensions.height || player.iframe.parentNode.offsetHeight;
	      player.duration = player.duration || 10;
	
	      // Only required for Vimeo Basic videos, or video URLs with a start time hash.
	      // Plus and Pro utilize `background=1` URL parameter.
	      // See https://vimeo.com/forums/topic:278001
	      postMessageManager('setVolume', '0');
	      postMessageManager('setLoop', 'true');
	      postMessageManager('seekTo', startTime); // `seekTo` handles playback as well
	      postMessageManager('addEventListener', 'playProgress');
	
	      readyCallback(player);
	    };
	
	    var onReady = function onReady() {
	      if (playerPromiseTimer) {
	        clearTimeout(playerPromiseTimer);
	        playerPromiseTimer = null;
	      }
	
	      if (!player.dimensions) {
	        player.dimensions = {};
	        getVideoDetails();
	
	        stateChangeCallback('buffering');
	        retryTimer = setTimeout(function () {
	          logger.call(instance, 'retrying');
	          syncAndStartPlayback(true);
	        }, _instance.TIMEOUT * 0.75);
	      }
	    };
	
	    var onMessageReceived = function onMessageReceived(event) {
	      if (!/^https?:\/\/player.vimeo.com/.test(event.origin)) {
	        return false;
	      }
	
	      playerOrigin = event.origin;
	
	      var data = event.data;
	      if (typeof data === 'string') {
	        data = JSON.parse(data);
	      }
	
	      switch (data.event) {
	        case 'ready':
	          onReady(playerOrigin);
	          break;
	
	        case 'playProgress':
	        case 'timeupdate':
	          if (retryTimer) {
	            clearTimeout(retryTimer);
	            retryTimer = null;
	          }
	          stateChangeCallback('playing', data);
	          postMessageManager('setVolume', '0');
	
	          if (data.data.percent >= 0.98 && startTime > 0) {
	            postMessageManager('seekTo', startTime);
	          }
	          break;
	      }
	
	      switch (data.method) {
	        case 'getVideoHeight':
	          logger.call(instance, data.method);
	          player.dimensions.height = data.value;
	          syncAndStartPlayback();
	          break;
	        case 'getVideoWidth':
	          logger.call(instance, data.method);
	          player.dimensions.width = data.value;
	          syncAndStartPlayback();
	          break;
	        case 'getDuration':
	          logger.call(instance, data.method);
	          player.duration = data.value;
	          if (startTime >= player.duration) {
	            startTime = 0;
	          }
	          syncAndStartPlayback();
	          break;
	      }
	    };
	
	    var messageHandler = function messageHandler(e) {
	      onMessageReceived(e);
	    };
	
	    win.addEventListener('message', messageHandler, false);
	
	    player.destroy = function () {
	      win.removeEventListener('message', messageHandler);
	      // If the iframe node has already been removed from the DOM by the
	      // implementer, parentElement.removeChild will error out unless we do
	      // this check here first.
	      if (player.iframe.parentElement) {
	        player.iframe.parentElement.removeChild(player.iframe);
	      }
	    };
	
	    playerPromiseTimer = setTimeout(function () {
	      reject('Ran out of time');
	    }, _instance.TIMEOUT);
	  });
	};
	
	exports.initializeVimeoAPI = initializeVimeoAPI;
	exports.initializeVimeoPlayer = initializeVimeoPlayer;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.validatedImage = exports.getVideoSource = exports.getVideoID = exports.getStartTime = exports.getPlayerElement = exports.findPlayerAspectRatio = undefined;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _instance = __webpack_require__(19);
	
	var _urlParse = __webpack_require__(20);
	
	var _urlParse2 = _interopRequireDefault(_urlParse);
	
	var _lodash = __webpack_require__(23);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * The YouTube API seemingly does not expose the actual width and height dimensions
	 * of the video itself. The video's dimensions and ratio may be completely different
	 * than the IFRAME's. This hack finds those values inside some private objects.
	 * Since this is not part of the public API, the dimensions will fall back to the
	 * container width and height in case YouTube changes the internals unexpectedly.
	 *
	 * @method getYouTubeDimensions Get the dimensions of the video itself
	 * @param {Object} Player
	 * @return {Object} The width and height as integers or undefined
	 */
	var getYouTubeDimensions = function getYouTubeDimensions(player) {
	  var w = void 0;
	  var h = void 0;
	  for (var p in player) {
	    var prop = player[p];
	    if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'object' && prop.width && prop.height) {
	      w = prop.width;
	      h = prop.height;
	      break;
	    }
	  }
	  return { w: w, h: h };
	};
	
	/**
	 * @method getVimeoDimensions Get the dimensions of the video itself
	 * @param {Object} Player
	 * @return {Object} The width and height as integers or undefined
	 */
	var getVimeoDimensions = function getVimeoDimensions(player) {
	  var w = void 0;
	  var h = void 0;
	  if (player.dimensions) {
	    w = player.dimensions.width;
	    h = player.dimensions.height;
	  } else if (player.iframe) {
	    w = player.iframe.clientWidth;
	    h = player.iframe.clientHeight;
	  }
	  return { w: w, h: h };
	};
	
	var providerUtils = {
	  youtube: {
	    parsePath: 'query.t',
	    timeRegex: /[hms]/,
	    idRegex: _instance.YOUTUBE_REGEX,
	    getDimensions: getYouTubeDimensions
	  },
	  vimeo: {
	    parsePath: null,
	    timeRegex: /[#t=s]/,
	    idRegex: _instance.VIMEO_REGEX,
	    getDimensions: getVimeoDimensions
	  }
	
	  /**
	   * @method getTimeParameter YouTube and Vimeo have optional URL formats to allow
	   *    playback to begin from a certain point in the video.
	   * @return {String or false} The appropriate time parameter or false.
	   */
	};var getTimeParameter = function getTimeParameter(parsedUrl, source) {
	  return providerUtils[source].parsePath ? (0, _lodash2.default)(parsedUrl, providerUtils[source].parsePath) : null;
	};
	
	/**
	 * @method getStartTime Parse the start time base on the URL formats of YouTube and Vimeo.
	 * @param {String} [url] The URL for the video, including any time code parameters.
	 * @return {Number} Time in seconds
	 */
	var getStartTime = function getStartTime(url, source) {
	  var parsedUrl = new _urlParse2.default(url, true);
	  var timeParam = getTimeParameter(parsedUrl, source);
	  if (!timeParam) {
	    return;
	  }
	
	  var match = timeParam.split(providerUtils[source].timeRegex).filter(Boolean);
	  var s = parseInt(match.pop(), 10) || 0;
	  var m = parseInt(match.pop(), 10) * 60 || 0;
	  var h = parseInt(match.pop(), 10) * 3600 || 0;
	  return h + m + s;
	};
	
	/**
	 * @method getVideoSource Determine the video source from the URL via regex.
	 * @param {String} [url] The URL for the video
	 * @return {String} Video provider name
	 */
	var getVideoSource = function getVideoSource() {
	  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _instance.DEFAULT_PROPERTY_VALUES.url;
	
	  var match = url.match(_instance.YOUTUBE_REGEX);
	  if (match && match[2].length) {
	    return 'youtube';
	  }
	
	  match = url.match(_instance.VIMEO_REGEX);
	  if (match && match[2].length) {
	    return 'vimeo';
	  }
	
	  console.error('Video source ' + url + ' does not match supported types');
	};
	
	/**
	 * @method getVideoId Get the video ID for use in the provider APIs.
	 * @param {String} [url] The URL for the video
	 * @param {String} [source] Video provider name
	 * @return {String} Video ID
	 */
	var getVideoID = function getVideoID() {
	  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _instance.DEFAULT_PROPERTY_VALUES.url;
	  var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	
	  var match = url.match(providerUtils[source].idRegex);
	  if (match && match[2].length) {
	    return match[2];
	  }
	
	  console.error('Video id at ' + url + ' is not valid');
	};
	
	/**
	 * @method validatedImage Ensure the element is an image
	 * @param {Node} [img] Image element
	 * @return {Node or false}
	 */
	var validatedImage = function validatedImage(img) {
	  if (!img) {
	    return false;
	  }
	  var isValid = img.nodeName === 'IMG' ? img : false;
	  if (!isValid) {
	    console.warn('Element is not a valid image element.');
	  }
	
	  return isValid;
	};
	
	/**
	 * @method findPlayerAspectRatio Determine the aspect ratio of the actual video itself,
	 *    which may be different than the IFRAME returned by the video provider.
	 * @return {Number} A ratio of width divided by height.
	 */
	var findPlayerAspectRatio = function findPlayerAspectRatio(container, player, videoSource) {
	  var w = void 0;
	  var h = void 0;
	  if (player) {
	    var dimensions = providerUtils[videoSource].getDimensions(player);
	    w = dimensions.w;
	    h = dimensions.h;
	  }
	  if (!w || !h) {
	    w = container.clientWidth;
	    h = container.clientHeight;
	    console.warn('No width and height found in ' + videoSource + ' player ' + player + '. Using container dimensions.');
	  }
	  return parseInt(w, 10) / parseInt(h, 10);
	};
	
	var getPlayerElement = function getPlayerElement(container) {
	  var playerElement = container.querySelector('#player');
	  if (!playerElement) {
	    playerElement = container.ownerDocument.createElement('div');
	    playerElement.id = 'player';
	    container.appendChild(playerElement);
	  }
	
	  playerElement.setAttribute('style', 'position: absolute; top: 0; bottom: 0; left: 0; right: 0;');
	
	  return playerElement;
	};
	
	exports.findPlayerAspectRatio = findPlayerAspectRatio;
	exports.getPlayerElement = getPlayerElement;
	exports.getStartTime = getStartTime;
	exports.getVideoID = getVideoID;
	exports.getVideoSource = getVideoSource;
	exports.validatedImage = validatedImage;

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var DEBUG = {
	  enabled: true, // Adds the Class instance to the window for easier debugging
	  verbose: false // Allows logging in detail
	};
	
	var DEFAULT_PROPERTY_VALUES = {
	  container: 'body',
	  url: 'https://youtu.be/xkEmYQvJ_68',
	  source: 'youtube',
	  fitMode: 'fill',
	  scaleFactor: 1,
	  playbackSpeed: 1,
	  filter: 1,
	  filterStrength: 50,
	  timeCode: { start: 0, end: null },
	  DEBUG: DEBUG
	};
	
	var TIMEOUT = 2500;
	
	// eslint-disable-next-line no-useless-escape
	var YOUTUBE_REGEX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
	// eslint-disable-next-line no-useless-escape
	var VIMEO_REGEX = /^.*(vimeo\.com\/)([0-9]{7,}(#t\=.*s)?)/;
	
	exports.DEBUG = DEBUG;
	exports.DEFAULT_PROPERTY_VALUES = DEFAULT_PROPERTY_VALUES;
	exports.TIMEOUT = TIMEOUT;
	exports.YOUTUBE_REGEX = YOUTUBE_REGEX;
	exports.VIMEO_REGEX = VIMEO_REGEX;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	var required = __webpack_require__(21)
	  , qs = __webpack_require__(22)
	  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
	  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
	  , whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]'
	  , left = new RegExp('^'+ whitespace +'+');
	
	/**
	 * Trim a given string.
	 *
	 * @param {String} str String to trim.
	 * @public
	 */
	function trimLeft(str) {
	  return (str ? str : '').toString().replace(left, '');
	}
	
	/**
	 * These are the parse rules for the URL parser, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var rules = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  function sanitize(address) {          // Sanitize what is left of the address
	    return address.replace('\\', '/');
	  },
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];
	
	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 };
	
	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object|String} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @public
	 */
	function lolcation(loc) {
	  var globalVar;
	
	  if (typeof window !== 'undefined') globalVar = window;
	  else if (typeof global !== 'undefined') globalVar = global;
	  else if (typeof self !== 'undefined') globalVar = self;
	  else globalVar = {};
	
	  var location = globalVar.location || {};
	  loc = loc || location;
	
	  var finaldestination = {}
	    , type = typeof loc
	    , key;
	
	  if ('blob:' === loc.protocol) {
	    finaldestination = new Url(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new Url(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) {
	    for (key in loc) {
	      if (key in ignore) continue;
	      finaldestination[key] = loc[key];
	    }
	
	    if (finaldestination.slashes === undefined) {
	      finaldestination.slashes = slashes.test(loc.href);
	    }
	  }
	
	  return finaldestination;
	}
	
	/**
	 * @typedef ProtocolExtract
	 * @type Object
	 * @property {String} protocol Protocol matched in the URL, in lowercase.
	 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
	 * @property {String} rest Rest of the URL that is not part of the protocol.
	 */
	
	/**
	 * Extract protocol information from a URL with/without double slash ("//").
	 *
	 * @param {String} address URL we want to extract from.
	 * @return {ProtocolExtract} Extracted information.
	 * @private
	 */
	function extractProtocol(address) {
	  address = trimLeft(address);
	  var match = protocolre.exec(address);
	
	  return {
	    protocol: match[1] ? match[1].toLowerCase() : '',
	    slashes: !!match[2],
	    rest: match[3]
	  };
	}
	
	/**
	 * Resolve a relative URL pathname against a base URL pathname.
	 *
	 * @param {String} relative Pathname of the relative URL.
	 * @param {String} base Pathname of the base URL.
	 * @return {String} Resolved pathname.
	 * @private
	 */
	function resolve(relative, base) {
	  if (relative === '') return base;
	
	  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
	    , i = path.length
	    , last = path[i - 1]
	    , unshift = false
	    , up = 0;
	
	  while (i--) {
	    if (path[i] === '.') {
	      path.splice(i, 1);
	    } else if (path[i] === '..') {
	      path.splice(i, 1);
	      up++;
	    } else if (up) {
	      if (i === 0) unshift = true;
	      path.splice(i, 1);
	      up--;
	    }
	  }
	
	  if (unshift) path.unshift('');
	  if (last === '.' || last === '..') path.push('');
	
	  return path.join('/');
	}
	
	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my OCD.
	 *
	 * It is worth noting that we should not use `URL` as class name to prevent
	 * clashes with the global URL instance that got introduced in browsers.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Object|String} [location] Location defaults for relative paths.
	 * @param {Boolean|Function} [parser] Parser for the query string.
	 * @private
	 */
	function Url(address, location, parser) {
	  address = trimLeft(address);
	
	  if (!(this instanceof Url)) {
	    return new Url(address, location, parser);
	  }
	
	  var relative, extracted, parse, instruction, index, key
	    , instructions = rules.slice()
	    , type = typeof location
	    , url = this
	    , i = 0;
	
	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }
	
	  if (parser && 'function' !== typeof parser) parser = qs.parse;
	
	  location = lolcation(location);
	
	  //
	  // Extract protocol information before running the instructions.
	  //
	  extracted = extractProtocol(address || '');
	  relative = !extracted.protocol && !extracted.slashes;
	  url.slashes = extracted.slashes || relative && location.slashes;
	  url.protocol = extracted.protocol || location.protocol || '';
	  address = extracted.rest;
	
	  //
	  // When the authority component is absent the URL starts with a path
	  // component.
	  //
	  if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];
	
	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];
	
	    if (typeof instruction === 'function') {
	      address = instruction(address);
	      continue;
	    }
	
	    parse = instruction[0];
	    key = instruction[1];
	
	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      if (~(index = address.indexOf(parse))) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if ((index = parse.exec(address))) {
	      url[key] = index[1];
	      address = address.slice(0, index.index);
	    }
	
	    url[key] = url[key] || (
	      relative && instruction[3] ? location[key] || '' : ''
	    );
	
	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) url[key] = url[key].toLowerCase();
	  }
	
	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);
	
	  //
	  // If the URL is relative, resolve the pathname against the base URL.
	  //
	  if (
	      relative
	    && location.slashes
	    && url.pathname.charAt(0) !== '/'
	    && (url.pathname !== '' || location.pathname !== '')
	  ) {
	    url.pathname = resolve(url.pathname, location.pathname);
	  }
	
	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!required(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }
	
	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';
	  if (url.auth) {
	    instruction = url.auth.split(':');
	    url.username = instruction[0] || '';
	    url.password = instruction[1] || '';
	  }
	
	  url.origin = url.protocol && url.host && url.protocol !== 'file:'
	    ? url.protocol +'//'+ url.host
	    : 'null';
	
	  //
	  // The href is just the compiled result.
	  //
	  url.href = url.toString();
	}
	
	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} part          Property we need to adjust.
	 * @param {Mixed} value          The newly assigned value.
	 * @param {Boolean|Function} fn  When setting the query, it will be the function
	 *                               used to parse the query.
	 *                               When setting the protocol, double slash will be
	 *                               removed from the final url if it is true.
	 * @returns {URL} URL instance for chaining.
	 * @public
	 */
	function set(part, value, fn) {
	  var url = this;
	
	  switch (part) {
	    case 'query':
	      if ('string' === typeof value && value.length) {
	        value = (fn || qs.parse)(value);
	      }
	
	      url[part] = value;
	      break;
	
	    case 'port':
	      url[part] = value;
	
	      if (!required(value, url.protocol)) {
	        url.host = url.hostname;
	        url[part] = '';
	      } else if (value) {
	        url.host = url.hostname +':'+ value;
	      }
	
	      break;
	
	    case 'hostname':
	      url[part] = value;
	
	      if (url.port) value += ':'+ url.port;
	      url.host = value;
	      break;
	
	    case 'host':
	      url[part] = value;
	
	      if (/:\d+$/.test(value)) {
	        value = value.split(':');
	        url.port = value.pop();
	        url.hostname = value.join(':');
	      } else {
	        url.hostname = value;
	        url.port = '';
	      }
	
	      break;
	
	    case 'protocol':
	      url.protocol = value.toLowerCase();
	      url.slashes = !fn;
	      break;
	
	    case 'pathname':
	    case 'hash':
	      if (value) {
	        var char = part === 'pathname' ? '/' : '#';
	        url[part] = value.charAt(0) !== char ? char + value : value;
	      } else {
	        url[part] = value;
	      }
	      break;
	
	    default:
	      url[part] = value;
	  }
	
	  for (var i = 0; i < rules.length; i++) {
	    var ins = rules[i];
	
	    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
	  }
	
	  url.origin = url.protocol && url.host && url.protocol !== 'file:'
	    ? url.protocol +'//'+ url.host
	    : 'null';
	
	  url.href = url.toString();
	
	  return url;
	}
	
	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String} Compiled version of the URL.
	 * @public
	 */
	function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;
	
	  var query
	    , url = this
	    , protocol = url.protocol;
	
	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';
	
	  var result = protocol + (url.slashes ? '//' : '');
	
	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  }
	
	  result += url.host + url.pathname;
	
	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;
	
	  if (url.hash) result += url.hash;
	
	  return result;
	}
	
	Url.prototype = { set: set, toString: toString };
	
	//
	// Expose the URL parser and some additional properties that might be useful for
	// others or testing.
	//
	Url.extractProtocol = extractProtocol;
	Url.location = lolcation;
	Url.trimLeft = trimLeft;
	Url.qs = qs;
	
	module.exports = Url;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	module.exports = function required(port, protocol) {
	  protocol = protocol.split(':')[0];
	  port = +port;
	
	  if (!port) return false;
	
	  switch (protocol) {
	    case 'http':
	    case 'ws':
	    return port !== 80;
	
	    case 'https':
	    case 'wss':
	    return port !== 443;
	
	    case 'ftp':
	    return port !== 21;
	
	    case 'gopher':
	    return port !== 70;
	
	    case 'file':
	    return false;
	  }
	
	  return port !== 0;
	};


/***/ }),
/* 22 */
/***/ (function(module, exports) {

	'use strict';
	
	var has = Object.prototype.hasOwnProperty
	  , undef;
	
	/**
	 * Decode a URI encoded string.
	 *
	 * @param {String} input The URI encoded string.
	 * @returns {String|Null} The decoded string.
	 * @api private
	 */
	function decode(input) {
	  try {
	    return decodeURIComponent(input.replace(/\+/g, ' '));
	  } catch (e) {
	    return null;
	  }
	}
	
	/**
	 * Attempts to encode a given input.
	 *
	 * @param {String} input The string that needs to be encoded.
	 * @returns {String|Null} The encoded string.
	 * @api private
	 */
	function encode(input) {
	  try {
	    return encodeURIComponent(input);
	  } catch (e) {
	    return null;
	  }
	}
	
	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
	  var parser = /([^=?&]+)=?([^&]*)/g
	    , result = {}
	    , part;
	
	  while (part = parser.exec(query)) {
	    var key = decode(part[1])
	      , value = decode(part[2]);
	
	    //
	    // Prevent overriding of existing properties. This ensures that build-in
	    // methods like `toString` or __proto__ are not overriden by malicious
	    // querystrings.
	    //
	    // In the case if failed decoding, we want to omit the key/value pairs
	    // from the result.
	    //
	    if (key === null || value === null || key in result) continue;
	    result[key] = value;
	  }
	
	  return result;
	}
	
	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify(obj, prefix) {
	  prefix = prefix || '';
	
	  var pairs = []
	    , value
	    , key;
	
	  //
	  // Optionally prefix with a '?' if needed
	  //
	  if ('string' !== typeof prefix) prefix = '?';
	
	  for (key in obj) {
	    if (has.call(obj, key)) {
	      value = obj[key];
	
	      //
	      // Edge cases where we actually want to encode the value to an empty
	      // string instead of the stringified value.
	      //
	      if (!value && (value === null || value === undef || isNaN(value))) {
	        value = '';
	      }
	
	      key = encodeURIComponent(key);
	      value = encodeURIComponent(value);
	
	      //
	      // If we failed to encode the strings, we should bail out as we don't
	      // want to add invalid strings to the query.
	      //
	      if (key === null || value === null) continue;
	      pairs.push(key +'='+ value);
	    }
	  }
	
	  return pairs.length ? prefix + pairs.join('&') : '';
	}
	
	//
	// Expose the module.
	//
	exports.stringify = querystringify;
	exports.parse = querystring;


/***/ }),
/* 23 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */
	
	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    symbolTag = '[object Symbol]';
	
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/,
	    reLeadingDot = /^\./,
	    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
	
	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
	
	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}
	
	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}
	
	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];
	
	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/** Built-in value references. */
	var Symbol = root.Symbol,
	    splice = arrayProto.splice;
	
	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map'),
	    nativeCreate = getNative(Object, 'create');
	
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;
	
	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}
	
	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}
	
	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}
	
	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}
	
	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}
	
	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;
	
	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}
	
	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}
	
	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  return index < 0 ? undefined : data[index][1];
	}
	
	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}
	
	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);
	
	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}
	
	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;
	
	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;
	
	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}
	
	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}
	
	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}
	
	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}
	
	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}
	
	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}
	
	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;
	
	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}
	
	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = isKey(path, object) ? [path] : castPath(path);
	
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}
	
	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}
	
	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value) {
	  return isArray(value) ? value : stringToPath(value);
	}
	
	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}
	
	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}
	
	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}
	
	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}
	
	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoize(function(string) {
	  string = toString(string);
	
	  var result = [];
	  if (reLeadingDot.test(string)) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});
	
	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}
	
	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}
	
	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;
	
	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result);
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}
	
	// Assign cache to `_.memoize`.
	memoize.Cache = MapCache;
	
	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}
	
	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}
	
	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}
	
	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}
	
	module.exports = get;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.initializeYouTubePlayer = exports.initializeYouTubeAPI = undefined;
	
	var _utils = __webpack_require__(18);
	
	/**
	 * Set up the YouTube script include if it's not present
	 */
	var initializeYouTubeAPI = function initializeYouTubeAPI(win) {
	  return new Promise(function (resolve, reject) {
	    if (win.document.documentElement.querySelector('script[src*="www.youtube.com/iframe_api"].loaded')) {
	      resolve('already loaded');
	      return;
	    }
	
	    var tag = win.document.createElement('script');
	    tag.src = 'https://www.youtube.com/iframe_api';
	    var firstScriptTag = win.document.getElementsByTagName('script')[0];
	    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	    tag.addEventListener('load', function (evt) {
	      evt.currentTarget.classList.add('loaded');
	      resolve('api script tag created and loaded');
	    }, true);
	    tag.addEventListener('error', function (evt) {
	      reject('Failed to load YouTube script: ', evt);
	    });
	  });
	};
	
	/**
	 * YouTube event handler. Add the proper class to the player element, and set
	 * player properties. All player methods via YouTube API.
	 */
	var onYouTubePlayerReady = function onYouTubePlayerReady(event, startTime) {
	  var player = event.target;
	  player.iframe = player.getIframe();
	  player.mute();
	  player.ready = true;
	  player.seekTo(startTime < player.getDuration() ? startTime : 0);
	  player.playVideo();
	};
	
	/**
	 * YouTube event handler. Determine whether or not to loop the video.
	 */
	var onYouTubePlayerStateChange = function onYouTubePlayerStateChange(event, startTime, win) {
	  var speed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
	
	  var player = event.target;
	  var duration = (player.getDuration() - startTime) / speed;
	
	  var doLoop = function doLoop() {
	    if (player.getCurrentTime() + 0.1 >= player.getDuration()) {
	      player.pauseVideo();
	      player.seekTo(startTime);
	      player.playVideo();
	    }
	    requestAnimationFrame(doLoop);
	  };
	
	  if (event.data === win.YT.PlayerState.BUFFERING && player.getVideoLoadedFraction() !== 1 && (player.getCurrentTime() === 0 || player.getCurrentTime() > duration - -0.1)) {
	    return 'buffering';
	  } else if (event.data === win.YT.PlayerState.PLAYING) {
	    requestAnimationFrame(doLoop);
	    return 'playing';
	  } else if (event.data === win.YT.PlayerState.ENDED) {
	    player.playVideo();
	  }
	};
	
	/**
	 * Initialize the player and bind player events.
	 */
	var initializeYouTubePlayer = function initializeYouTubePlayer(_ref) {
	  var container = _ref.container,
	      win = _ref.win,
	      videoId = _ref.videoId,
	      startTime = _ref.startTime,
	      speed = _ref.speed,
	      readyCallback = _ref.readyCallback,
	      stateChangeCallback = _ref.stateChangeCallback;
	
	  var playerElement = (0, _utils.getPlayerElement)(container);
	
	  var makePlayer = function makePlayer() {
	    return new win.YT.Player(playerElement, {
	      videoId: videoId,
	      playerVars: {
	        'autohide': 1,
	        'autoplay': 0,
	        'controls': 0,
	        'enablejsapi': 1,
	        'iv_load_policy': 3,
	        'loop': 0,
	        'modestbranding': 1,
	        'playsinline': 1,
	        'rel': 0,
	        'showinfo': 0,
	        'wmode': 'opaque'
	      },
	      events: {
	        onReady: function onReady(event) {
	          onYouTubePlayerReady(event, startTime);
	          readyCallback(event.target);
	        },
	        onStateChange: function onStateChange(event) {
	          var state = onYouTubePlayerStateChange(event, startTime, win, speed);
	          stateChangeCallback(state, state);
	        }
	      }
	    });
	  };
	
	  return new Promise(function (resolve, reject) {
	    var checkAPILoaded = function checkAPILoaded() {
	      if (win.YT.loaded === 1) {
	        resolve(makePlayer());
	      } else {
	        setTimeout(checkAPILoaded, 100);
	      }
	    };
	
	    checkAPILoaded();
	  });
	};
	
	exports.initializeYouTubeAPI = initializeYouTubeAPI;
	exports.initializeYouTubePlayer = initializeYouTubePlayer;

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var filterOptions = ['none', 'blur', 'brightness', 'contrast', 'invert', 'opacity', 'saturate', 'sepia', 'drop-shadow', 'grayscale', 'hue-rotate'];
	
	/**
	 * Each filter style needs to adjust the strength value (1 - 100) by a `modifier`
	 * function and a unit, as appropriate. The `modifier` is purely subjective.
	 */
	var filterProperties = {
	  blur: {
	    modifier: function modifier(value) {
	      return value * 0.3;
	    },
	    unit: 'px'
	  },
	  brightness: {
	    modifier: function modifier(value) {
	      return value * 0.009 + 0.1;
	    },
	    unit: ''
	  },
	  contrast: {
	    modifier: function modifier(value) {
	      return value * 0.4 + 80;
	    },
	    unit: '%'
	  },
	  grayscale: {
	    modifier: function modifier(value) {
	      return value;
	    },
	    unit: '%'
	  },
	  'hue-rotate': {
	    modifier: function modifier(value) {
	      return value * 3.6;
	    },
	    unit: 'deg'
	  },
	  invert: {
	    modifier: function modifier(value) {
	      return 1;
	    },
	    unit: ''
	  },
	  opacity: {
	    modifier: function modifier(value) {
	      return value;
	    },
	    unit: '%'
	  },
	  saturate: {
	    modifier: function modifier(value) {
	      return value * 2;
	    },
	    unit: '%'
	  },
	  sepia: {
	    modifier: function modifier(value) {
	      return value;
	    },
	    unit: '%'
	  }
	};
	
	exports.filterOptions = filterOptions;
	exports.filterProperties = filterProperties;

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	var getPropsFromNode = function(node) {
	  var props = {
	    'container': node
	  };
	
	  if (node.getAttribute('data-config-url')) {
	    props.url = node.getAttribute('data-config-url');
	  }
	
	  if (node.getAttribute('data-config-playback-speed')) {
	    props.playbackSpeed = node.getAttribute('data-config-playback-speed');
	  }
	
	  if (node.getAttribute('data-config-filter')) {
	    props.filter = node.getAttribute('data-config-filter');
	  }
	
	  if (node.getAttribute('data-config-filter-strength')) {
	    props.filterStrength = node.getAttribute('data-config-filter-strength');
	  }
	
	  return props;
	};
	
	module.exports = getPropsFromNode;


/***/ })
/******/ ]);