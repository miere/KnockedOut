K = (function (){

    /**
     * The main function, executed when need to bind a node
     * against a object.
     */
    function makeObservableAndApplyBinding( object, node ) {
        makeObservable( object, node )
        ko.applyBindings( object, node )
    }

    /**
     * Make any non-observable object a real KnockoutJS observable
     * object. Functions are thread as real methods, granting that
     * the 'this' variable points to the object.
     */
    function makeObservable( object, node ) {
        var value = null
        for ( var attrName in object ) {
            value = object[attrName]
            if ( !ko.isObservable( value ) )
                if ( isFunction( value ) )
                    makeFunctionARealMethod( object, attrName )
                else
                    makeAttributeObservable( object, attrName )
        }
        return object
    }

    function isFunction( value ) {
        return typeof value == "function"
    }

    /**
     * Will grant that 'this' will not point to the caller object,
     * but to the Object instance.
     */
    function makeFunctionARealMethod( self, methodName ){
        var method = self[methodName]
        self[methodName] = method.bind( self )
    }

    /**
     * Grant that the specific attribute are observable.
     */
    function makeAttributeObservable( object, attrName ) {
        var value = object[attrName]
        if ( value instanceof Array )
            object[attrName] = makeArrayObservable( value )
        else if ( !value || typeof value != "object" )
            object[attrName] = ko.observable( value )
        else
            object[attrName] = ko.observable( makeObservable( value ) )
    }

    /**
     * Grant that all array elements are observed
     */
    function makeArrayObservable( array ) {
        var observableArray = new Array()
        for ( var i=0; i<array.length; i++ ) {
            observableArray.push (
                makeObservable( array[i] ) )
        }
        return ko.observableArray( observableArray )
    }

    /**
     * Exposing public methods.
     */
    var attached = []
    
    function load_attached_functions(){
        for ( var i=0; i<attached.length; i++ )
            attached[i]( ko )
        attached = []
    }
    
    var public_api = {
        fn: function( f ){
            attached.push( f )
        },

        observe: function ( node, model ) {
            if ( attached.length )
                load_attached_functions()
            makeObservableAndApplyBinding( model, node )
        }
    }
    
    /**
     * Mandatory extensions
     */
    public_api.fn( function(){

        /**
         * Turns an observable object into a plain-JavaScript object
         */
        ko.observable.fn.toJS = function (){
            return ko.toJS( this )
        }

        /**
         * Populates a pre-defined object.
         */
        ko.observable.fn.populate = function ( fromObject ){
            var value;
            var self = this()
            for ( var attrName in self ){
                value = self[attrName]
                if ( attrName == "toJS"
                ||   attrName == "populate" )
                    continue;
                if ( value && ko.isObservable( value ) )
                    value( fromObject[attrName] )
            }
        }

        /**
         * Grant that will memorize all parameters and return a method
         * that could run the original function with memorized parameters.
         * 
         * @returns {Function}
         */
        Function.prototype.withParameters = function (){
            var args = arguments
            var self = this
            return function (){
                return self.apply( self, args )
            }
        }

        Function.prototype.executeDelayed = function( delay ){
            var self = this
            return function(){
                var args = arguments
                setTimeout( function(){
                    self.apply( self, args )
                }, delay)
            }
        }
    })

    return public_api
})()






