var myOffcanvas = Froffcanvas({
	// String - Panel selector, hook for JS init() method
	selector: '.js-fr-offcanvas',

	// String - Selector for the open button(s)
	openSelector: '.js-fr-offcanvas-open',

	// String - Selector for the close button
	closeSelector: '.js-fr-offcanvas-close',

	// Boolean - Prevent click events outside panel from triggering close
	preventClickOutside: false,

	// String - Class name that will be added to the selector when the component has been initialised
	readyClass: 'fr-offcanvas--is-ready',


	// String - Class name that will be added to the selector when the panel is visible
	activeClass: 'fr-offcanvas--is-active',
});

myOffcanvas.init();