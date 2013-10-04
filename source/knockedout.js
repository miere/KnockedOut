define(["knockout"],function ( ko ){

	var commonsMethods = {
		toJS: function (){
			return ko.toJS( this )
		}
	}

	function appendArgsToArray( array, args ) {
		for ( var i=0; i< args.length; i++ )
			array.push( args[i] )
	}

	function extendObjectWithCommonMethods( object ) {
		for ( var attrName in commonsMethods )
			object[attrName] = commonsMethods[attrName]
	}

	function makeObservable( object, node ) {
		makeAttributesObservable( object )
		extendObjectWithCommonMethods( object )
		return object
	}
	
	function makeObservableAndApplyBinding( object, node ) {
		makeObservable( object, node )
		ko.applyBindings( object, node )
	}

	function makeAttributesObservable( object ) {
		for ( var attrName in object )
			if ( typeof object[attrName] == "function" )
				makeFunctionARealMethod( object, attrName )
			else
				makeAttributeObservable( object, attrName )
	}

	function makeFunctionARealMethod( self, methodName ){
		var method = self[methodName]
		self[methodName] = function(){
			var args = new Array()
			if ( this != self )
				args.push ( this )
			appendArgsToArray( args, arguments )
			method.apply( self, args )
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
