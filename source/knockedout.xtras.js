/**
 * Extra KnockoutJS API extensions.
 */
K.fn( function( ko ){

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

})
