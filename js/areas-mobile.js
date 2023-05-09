$("#get-free-website").click(function() {
  $('html,body').animate({
      scrollTop: $("#home-request-form").offset().top-40},
     800);
});
$("#sign-up-footer").click(function() {
  $('html,body').animate({
      scrollTop: $("#home-request-form").offset().top-40},
      800);
});


// Sets interval...what is transition slide speed?



(function(){

  var windowIsLarge = window.matchMedia("(min-width:768px)").matches;

  if (windowIsLarge) {
      //carousel disabled
      $('.carousel').carousel({
          interval: false
      });
  };
});
(function(){

  var windowIsLarge = window.matchMedia("(max-width:767px)").matches;

  if (windowIsLarge) {
      //carousel enabled
      $('.carousel').carousel({
          interval: 500
      });
  };
});

(function(){
$('.carousel-showmanymoveone .item').each(function(){
  var itemToClone = $(this);

  for (var i=1;i<4;i++) {
    itemToClone = itemToClone.next();

    // wrap around if at end of item collection
    if (!itemToClone.length) {
      itemToClone = $(this).siblings(':first');
    }

    // grab item, clone, add marker class, add to collection
    itemToClone.children(':first-child').clone()
      .addClass("cloneditem-"+(i))
      .appendTo($(this));
  }
});
}());
