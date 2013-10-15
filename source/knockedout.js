define(["knockout"],function ( ko ){

	/**
	 * KnockoutJS API Improvement
	 */
	ko.observable.fn.toJS = function (){
		return ko.toJS( this )
	}

	ko.observable.fn.populate = function ( fromObject ){
		var value;
		var self = this()
		for ( var attrName in self ){
			value = self[attrName]
			if ( attrName == "toJS"
			||   attrName == "populate" )
				continue;
			if ( value && isFunction( value ) && !isFunction( value() ) )
				value( fromObject[attrName] )
		}
	}

	ko.observableArray.fn.removeAt = function ( index ){
		if ( index >= 0 )
			return this.splice( index, 1 )
	}

	ko.observableArray.fn.set = function ( index, newValue ) {
		this()[index] = newValue
		this.valueHasMutated()
	}

	ko.observableArray.fn.get = function ( index ) {
		return this()[index]
	}

	ko.observableArray.fn.clear = function ( index, newValue ) {
		this.foreach(function(){
			this.pop()
		})
	}

	ko.observableArray.fn.append = function ( newValue ) {
		this.push( makeObservable( newValue ) )
	}
	
	ko.observableArray.fn.foreach = function ( callback, target ) {
		target = target || this
		var array = this()
		for ( var i=0; i<array.length; i++ )
			callback.call( target, array[i], i )
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
		self[methodName] = function(){
			return method.apply( self, arguments )
		}
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
	 * Grant that all array elements are 
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
	 * Create a KnockedOut plugin if jquery will be resolved as a dependency.
	 */
	if (require.specified('jquery')) {
	    require( [ 'jquery' ], function (jquery) {

	    	jquery.fn.observe = function ( object ) {
	    		return this.each(function(){
	    			makeObservableAndApplyBinding( object, this )
	    		})
	    	}

	    });
	}

	/**
	 * Exposing public methods that will be used when the
	 * module is called through AMD module.
	 */
	return {
		observe: function ( node, model ) {
			makeObservableAndApplyBinding( model, node )
		}
	}
})
