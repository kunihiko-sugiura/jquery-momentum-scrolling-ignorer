(function($){
    var mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';

    var scrollEvents = {};
    var isPlusDirection = true;
    var scrollResetTimeoutId = null;
    var setting = null;

    var methods = {
        /**
         * @param options
         * @returns {*}
         */
        init : function( options ) {
            $(document).bind( mousewheelevent, wheelEvent);

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
        destroy : function( ) {
            $(document).unbind( mousewheelevent );
        },
        getSetting() {
            return setting;
        },
    };

    //region Private Methods

    var scrollEventTimeout = function(eventTime){
        if( scrollEvents[eventTime] ) {
            delete scrollEvents[eventTime];
            if( Object.keys(scrollEvents).length == 0 && scrollResetTimeoutId != null ) {
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

    var wheelEvent = function(e){
        e.preventDefault();

        var deltaY = e.originalEvent.deltaY ? -(e.originalEvent.deltaY) : e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -(e.originalEvent.detail);
        scrollEventFilter(deltaY, e.originalEvent.deltaX);
    };

    var scrollEventFilter = function(deltaY, deltaX) {
        var opt = methods.getSetting.apply(this);

        // TODO:横スクロールした時に上下も拾ってしまう。もう少し丁寧に拾った方がいいけど
        if( Math.abs(deltaX) >= 2 ) {
            return false;
        }
        if( Math.abs( deltaY ) <= 3 ){
            return false;
        }
        var currentIsPlusDirection = (deltaY > 0 );
        if( Object.keys(scrollEvents).length == 0 || currentIsPlusDirection != isPlusDirection ) {
            isPlusDirection = currentIsPlusDirection;

            scrollResetTimeout();
            scrollResetTimeoutId = setTimeout( scrollResetTimeout, opt.resetMiliSec);

            if(typeof opt.callbackScroll == "function") {
                opt.callbackScroll(isPlusDirection);
            }
        }
        var eventTime = + new Date();
        scrollEvents[eventTime] = eventTime;
        setTimeout( scrollEventTimeout, opt.eventClearTime, eventTime);
    };

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
        resetMiliSec: 1500,
        eventClearTime: 100
    };

    //endregion

})(jQuery);