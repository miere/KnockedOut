K = (function (){

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
			if ( value && ko.isObservable( value ) )
				value( fromObject[attrName] )
		}
	}

	ko.observableArray.fn.pushIfAbsent = function ( object, matcher, target ){
		if ( !this.contains( object, matcher, target ) )
			this.push( object )
	}

	ko.observableArray.fn.contains = function( object, matcher, target ){
		target = target || this
		matcher = matcher || function ( x ) { return x == object }

		var found = false
		var array = this()
		if ( array )
		for ( var i=0; i<array.length; i++ )
			if ( matcher.call( target, array[i], object ) ){
				found = true
				break
			}

		return found
	}

	ko.observableArray.fn.remove = function( object ){
		var index = this.indexOf( object )
		this.removeAt( index )
	}

	ko.observableArray.fn.removeAt = function ( index ){
		if ( index >= 0 ){
			var v = this.splice( index, 1 )
			this.valueHasMutated()
			return v
		}
	}
	
	ko.observableArray.fn.pushAll = function ( newValues ){
		var array = this()
		for ( var i=0; i<newValues.length; i++ )
			array.push( newValues[i] )
		this.valueHasMutated()
	}

	ko.observableArray.fn.set = function ( index, newValue ) {
		this()[index] = newValue
		this.valueHasMutated()
	}

	ko.observableArray.fn.get = function ( index ) {
		return this()[index]
	}

	ko.observableArray.fn.clear = function ( index ) {
		var i =this().length-1;
		for ( ; i>=0; i-- )
			this.removeAt(i)
	}

	ko.observableArray.fn.append = function ( newValue ) {
		this.push( makeObservable( newValue ) )
	}

	ko.observableArray.fn.foreach = function ( callback, target ) {
		target = target || this
		var array = this()
		if ( array )
		for ( var i=0; i<array.length; i++ )
			callback.call( target, array[i], i )
	}

	ko.observableArray.fn.map = function ( mapper, target ) {
		target = target || this
		var newArray = []
		var array = this()
		if ( array )
		for ( var i=0; i<array.length; i++ )
			newArray.push( mapper.call( target, array[i], i ) )
		return newArray
	}
	
	ko.observableArray.fn.filter = function ( callback, target ) {
		target = target || this
		var newArray = []
		var array = this()
		if ( array )
		for ( var i=0; i<array.length; i++ )
			if ( callback.call( target, array[i] ) )
				newArray.push( array[i] )
		return newArray
	}
	
	ko.observableArray.fn.removeThatMatches = function ( callback, target ) {
		target = target || this
		var array = this()
		if ( array )
		for ( var i=0; i<array.length; i++ )
			if ( callback.call( target, array[i] ) ){
				this.removeAt( i )
				break
			}
		return this
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
	 * Exposing public methods that will be used when the
	 * module is called through AMD module.
	 */
	return {
		observe: function ( node, model ) {
			makeObservableAndApplyBinding( model, node )
		}
	}
})()

/**
 * Create a KnockedOut plugin
 */
try {
	jQuery.observe = function ( object ) {
		return $("body").observe( object )
	}

	jQuery.fn.observe = function ( object ) {
		this.each(function(){
			K.observe( this, object )
		})
		return object
	}
} catch (e){}

