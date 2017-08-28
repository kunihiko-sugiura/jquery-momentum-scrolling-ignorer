(function($){
    var mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';

    var scrollEvents = {};
    var isPlusDirection = true;
    var scrollResetTimeoutId = null;
    var setting = null;
    var touchStartXY = {};

    var methods = {
        /**
         * @param options
         * @returns {*}
         */
        init : function( options ) {
            $(document).bind( mousewheelevent, onWheel);

            console.log( "SupportTouch:" + (isSupportTouch() ? "Yes" : "no") );

            if( isSupportTouch() ) {
                $(document).on('touchstart', onTouchStart);
                $(document).on('touchend', onTouchEnd);
            }
            // 対象要素のdata属性
            var data = $(this).data( 'msi' );
            // ** data属性が無い場合、未初期化と判断
            if ( ! data ) {
                var opt = $.extend( $.fn.msi.defaults, options);
                setting = opt;
                $(this).data( 'msi', {
                    target          : $(document),
                    setting         : opt
                });
            }
        },
        destroy : function() {
            $(document).unbind( mousewheelevent );
        },
        getSetting: function() {
            return setting;
        }
    };

    //region Private Methods

    var isSupportTouch = function() {
        return window.ontouchstart === null;
    };

    //region Wheel Events

    var hasNotScrollEvents = function() {
        return Object.keys(scrollEvents).length === 0;
    };
    var scrollEventTimeout = function(eventTime){
        if( scrollEvents[eventTime] ) {
            delete scrollEvents[eventTime];
            if( Object.keys(scrollEvents).length === 0 && scrollResetTimeoutId !== null ) {
                clearTimeout(scrollResetTimeoutId);
            }
        }
    };

    var scrollResetTimeout = function(){
        if( scrollResetTimeoutId ) {
            clearTimeout(scrollResetTimeoutId);
            scrollEvents = {};
            scrollResetTimeoutId = null;
        }
    };

    var onWheel = function(e){
        e.preventDefault();

        var deltaY = e.originalEvent.deltaY ? -(e.originalEvent.deltaY) : e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -(e.originalEvent.detail);
        scrollEventFilter(deltaY, e.originalEvent.deltaX);
    };

    var scrollEventFilter = function(deltaY, deltaX) {
        // TODO:横スクロールした時に上下も拾ってしまう。もう少し丁寧に拾った方がいいけど
        if( Math.abs(deltaX) >= 2 ) {
            return false;
        }
        if( Math.abs( deltaY ) <= 3 ){
            return false;
        }
        var currentIsPlusDirection = (deltaY > 0 );

        if( hasNotScrollEvents() || currentIsPlusDirection !== isPlusDirection ) {
            isPlusDirection = currentIsPlusDirection;

            scrollResetTimeout();
            scrollResetTimeoutId = setTimeout( scrollResetTimeout, setting.resetMiliSec);

            onCallFunc();
        }
        var eventTime = + new Date();
        scrollEvents[eventTime] = eventTime;
        setTimeout( scrollEventTimeout, setting.eventClearTime, eventTime);
    };

    var onCallFunc = function() {
        if(typeof setting.callbackScroll === "function") {
            setting.callbackScroll(isPlusDirection);
        } else {
            console.log( 'Please check. "callbackScroll" parameter is not function!!!' );
        }
    };

    //endregion

    //region Touch Events

    var getTouchXY = function(event) {
        var original = event.originalEvent;
        var xy = {
            x:0,
            y:0
        };
        if(original.changedTouches) {
            xy.x = original.changedTouches[0].pageX;
            xy.y = original.changedTouches[0].pageY;
        } else {
            xy.x = event.pageX;
            xy.y = event.pageY;
        }
        return xy;
    };

    var isTouchDirectUp = function(startXY, endXY) {
        return ( startXY.y - endXY.x ) > 0;
    };

    var isOverSwipeLimitEvent = function(startXY, endXY) {
        return Math.abs( startXY.y - endXY.x ) > setting.touchSwipeMinWidth;
    };

    var onTouchStart = function(event){
        touchStartXY =getTouchXY(event);
    };

    var onTouchEnd = function(event){
        var touchEndXY =getTouchXY(event);
        isPlusDirection = isTouchDirectUp( touchStartXY, touchEndXY );
        if( isOverSwipeLimitEvent( touchStartXY, touchEndXY ) ) {
            onCallFunc();
        }
    };

    //endregion

    //endregion

    //region Main

    /**
     * plugin本体
     * @param method
     * @returns {*}
     */
    $.fn.msi = function( method ) {
        // ここでのthis:   jQueryオブジェクト
        // ここでの$(this):$('#element')
        if ( typeof method === 'object' || ! method ) {
            // ** 初期化
            return methods.init.apply(
                this,
                arguments
            );
        } else if ( methods[method] ) {
            // ** メソッド呼び出し
            // メソッドチェーンのためにthisが帰るように
            return methods[method].apply(
                this,
                Array.prototype.slice.call( arguments, 1 )
            );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.' );
        }
    };

    //endregion

    //region define

    $.fn.msi.defaults = {
        callbackScroll: function(isPlusDirection){ console.log(isPlusDirection ? "Scroll:UP" : "Scroll:DOWN"); },
        resetMiliSec: 1600,
        eventClearTime: 300,
        touchSwipeMinWidth: 30
    };

    //endregion

})(jQuery);