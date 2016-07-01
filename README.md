# KnockedOut
An easy-to-use KnockoutJS experiense:
 * Avoid repetitive boilerplate code
 * Auto observable controllers
 * Grant that methods belongs to controller, not to the caller.
 * Auto-bind controllers to element nodes through JQuery (if jQuery available)

## Sample usage
Let's compare both (original KnockOut and KnockedOut) usage and see the diffence in action.
```javascript
  <!-- This sample code was copied from the KnockedOut documentation about click binding.
       http://knockoutjs.com/documentation/click-binding.html -->
  <ul data-bind="foreach: places">
      <li>
          <span data-bind="text: $data"></span>
          <button data-bind="click: $parent.removePlace">Remove</button>
      </li>
  </ul>
 
 <script type="text/javascript">
     function MyViewModel() {
         var self = this;
         self.places = ko.observableArray(['London', 'Paris', 'Tokyo']);
 
         // The current item will be passed as the first parameter, so we know which place to remove
         self.removePlace = function(place) {
             self.places.remove(place)
         }
     }
     ko.applyBindings(new MyViewModel());
</script>
```

```javascript
  <ul data-bind="foreach: places">
      <li>
          <span data-bind="text: $data"></span>
          <button data-bind="click: $parent.removePlace">Remove</button>
      </li>
  </ul>
 
 <script type="text/javascript">
     K.observe({
         // it just inffers which kind of observable through the object native type.
         // if is an array/[] it uses ko.observableArray
         // any other value will use ko.observable
         places: ['London', 'Paris', 'Tokyo'],
 
         // The current item will be passed as the first parameter, so we know which place to remove
         removePlace: function(place) {
             this.places.remove(place)
         }
     })
</script>
```

## Dependencies
 * KnockoutJS (3.x)
