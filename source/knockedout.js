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

	function makeObservableAndApplyBinding( object, node ) {
		makeObservable( object, node )
		ko.applyBindings( object, node )
	}

	function makeObservable( object, node ) {
		for ( var attrName in object )
			if ( isFunction(object[attrName]) )
				makeFunctionARealMethod( object, attrName )
			else
				makeAttributeObservable( object, attrName )
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
			method.apply( self, arguments )
		}
	}

	function makeAttributeObservable( object, attrName ) {
		var value = object[attrName]
		if ( value instanceof Array )
			object[attrName] = ko.observableArray( value )
		else if ( !value || typeof value != "object" )
			object[attrName] = ko.observable( value )
		else
			object[attrName] = ko.observable( makeObservable( value ) )
	}

	/**
	 * Create a knockedout plugin if jquery will be resolved as a dependency.
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

	return {
		observe: function ( node, model ) {
			makeObservableAndApplyBinding( model, node )
		}
	}
})
