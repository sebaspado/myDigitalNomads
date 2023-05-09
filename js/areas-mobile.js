(function ($) {

    $.fn.cardsSlider = function (opt) {
      const requestAnimFrame = requestAnimationFrame;
    
      // options
      if (!opt) {
        opt = {};
      }
      opt = $.extend({
        'clickToNext': true,
        'holderClass': 'slides-holder',
        'lablesSlider': true,
        'lablesHolderClass': 'labels',
        'loop': true,
        'mouseDrug': true,
        'mouseWheel': true,
        'nextClass': 'arrow-right',
        'pagination': true,
        'paginationHolderClass': 'controls',
        'paginationPageClass': 'page',
        'preloaderClass': 'preloader',
        'prevClass': 'arrow-left',
        'scaleFactor': 0.8,
        'sectionClass': 'section',
        'slideClass': 'slide',
        'slidesOnPage': 1,
        'speed': 600,
        'startSlide': 0,
        'swing': 10,
        'touch': true,
        'viewportClass': 'viewport' },
      opt);
    
      var plugin = function (i) {
    
        // privat and cnstants
        var self = this,
        DOM = {
          $slider: $(self) },
    
        state = {
          'touchStart': {},
          'touchEnd': {} },
    
        $window = $(window),
        touchendCleaner = function () {
          DOM.$sliderHolder.removeClass('touched');
          state.touchStart.yPos = 0;
          state.touchStart.xPos = 0;
          state.shiftX = 0;
          state.shiftD = 0;
        },
        cleanMoveState = function () {
          state.deltaX = null;
          state.touchEnd.xPos = null;
          state.touchEnd.yPos = null;
          state.touchStart.xPos = null;
          state.touchStart.yPos = null;
        };
    
        // methods
        var plg = {
          cacheDOM: function () {
            DOM.$section = DOM.$slider;
            DOM.$preloader = DOM.$slider.find('.' + opt.preloaderClass);
            DOM.$viewport = DOM.$slider.find('.' + opt.viewportClass);
            DOM.$sliderHolder = DOM.$viewport.find('.' + opt.holderClass);
            DOM.$slides = DOM.$slidesAndCloned = DOM.$sliderHolder.find('.' + opt.slideClass);
          },
          init: function () {
            this.cacheDOM();
            state.current = state.current || 0;
            state.slides = DOM.$slides.length;
            state.pages = Math.ceil(DOM.$slides.length / opt.slidesOnPage);
            this.createPagination();
    
            if (this.initialized) {
              return false;
            }
    
            this.addIdsToSlides();
    
            if (opt.loop) {
              this.createClones();
            }
    
            DOM.$preloader.fadeOut(150);
    
            this.initialized = true;
          },
    
          addIdsToSlides: function () {
            DOM.$slides.not('.cloned').each(function (i) {
              $(this).attr('data-id', i);
            });
          },
    
          createClones: function () {
            DOM.$slides.each(function (i) {
              $(this).
              clone().
              removeClass('active').
              addClass('cloned').
              insertBefore(DOM.$slides.eq(0)).
              clone().
              appendTo(DOM.$sliderHolder);
            });
    
            DOM.$slidesAndCloned = DOM.$slider.find('.' + opt.slideClass);
          },
    
          calculateMaxHeight: function ($el) {
            var max = 1;
    
            $el.each(function () {
    
              var height = 0,
              $self = $(this);
    
              $self.find('> *').each(function () {
                height += $self.outerHeight();
              });
    
              if (height > max) {
                max = height;
              }
    
            });
    
            return max;
          },
    
          resize: function () {
            state.sliderWidth = DOM.$viewport.width();
    
            if ($window.width() > 300 && opt.slidesOnPage > 1 && $window.width() <= 700) {
    
              opt.slidesOnPage = Math.floor(opt.slidesOnPage / 2);
              // TODO is this needed?
              // plg.init();
            }
    
            state.itemWidth = DOM.$viewport.width() / opt.slidesOnPage;
    
            DOM.$slidesAndCloned.width(state.itemWidth);
    
            if (opt.autoHeight) {
              DOM.$slides.height(this.calculateMaxHeight(DOM.$slides));
            }
    
            state.slideWidth = DOM.$slides.eq(0).outerWidth();
    
            plg.toSlide(state.current);
          },
    
          prevSlide: function () {
            var id = state.current - 1;
    
            if (id < 0) {
    
              id = state.pages - 1;
    
            }
    
            return id;
          },
    
          nextSlide: function () {
            var id = state.current + 1;
    
            if (id >= state.pages) {
              id = 0;
            }
    
            return id;
          },
    
          toSlide: function (id) {
            var $activeSlide;
    
            if (id < 0 || id >= state.pages) {
              console.warn('id is ' + id);
              return;
            }
    
            state.current = id;
    
            DOM.$slidesAndCloned.
            removeClass('active').
            filter('[data-id="' + id + '"]').each(function () {
              $self = $(this);
              if (!$self.hasClass('cloned')) {
                $self.addClass('active');
                $activeSlide = $self;
              }
            });
    
            // TODO ...
            // save active
            try {
              state.$activeSlide = $activeSlide;
              state.$prevSlide = $activeSlide.prev();
              state.$nextSlide = $activeSlide.next();
    
            } catch (e) {
              console.error(e);
              state.$prevSlide = null;
              state.$nextSlide = null;
            }
    
            if (opt.pagination) {
    
              DOM.$pagination.
              find('.' + opt.paginationPageClass).
              eq(id).
              addClass('active').
              siblings().
              removeClass('active');
    
            }
          },
          renderFw: function ($activeSlide, $futureSlide, mult, step, stepChanged) {
            if (step === 1) {
    
              $activeSlide.
              css({
                'will-change': 'left, transform',
                'z-index': 4,
                'transform': 'scale(1)',
                'left': state.itemWidth * mult / 0.7 });
    
    
              $futureSlide.
              css({
                'will-change': 'left, transform',
                'z-index': 3 });
    
    
              if (stepChanged) {
                $activeSlide.addClass('active');
                $futureSlide.removeClass('active');
              }
    
            } else if (step === 2) {
    
              $activeSlide.
              css({
                'z-index': 3,
                'transform': 'scale(' + (1 - (1 - opt.scaleFactor) * (mult - 0.7) / 0.3) + ')',
                'transform-origin': +(30 * mult + 70) + '% 50%',
                'left': state.itemWidth - state.itemWidth * (mult - 0.7) / 0.3 + opt.swing * (mult - 0.7) / 0.3 });
    
    
              $futureSlide.
              css({
                'z-index': 4 });
    
    
              if (stepChanged) {
                $activeSlide.removeClass('active');
                $futureSlide.addClass('active');
              }
    
            }
    
            // Prev Slide
            if (step === 1 || step === 2) {
              $futureSlide.
              css({
                'transform': 'scale(' + (0.2 * mult + opt.scaleFactor) + ')',
                'transform-origin': +(50 * mult) + '% 50%',
                'left': -opt.swing + opt.swing * mult });
    
            }
    
            // end
            if (step === 3) {
    
              if (!stepChanged) return;
    
              $activeSlide.
              css({
                'z-index': 3,
                'transform': 'scale(' + opt.scaleFactor + ')',
                'transform-origin': '100% 50%',
                'left': opt.swing });
    
    
              $futureSlide.
              css({
                'z-index': 4,
                'transform': 'scale(1)',
                'transform-origin': '50% 50%',
                'left': 0 });
    
    
            }
          },
          renderBw: function ($activeSlide, $futureSlide, mult, step, stepChanged) {
            if (step === 1) {
    
              $activeSlide.
              css({
                'will-change': 'left, transform',
                'z-index': 4,
                'transform': 'scale(1)',
                'left': state.itemWidth * mult / 0.7 });
    
    
              $futureSlide.
              css({
                'will-change': 'left, transform',
                'z-index': 3 });
    
    
              if (stepChanged) {
                $activeSlide.addClass('active');
                $futureSlide.removeClass('active');
              }
    
            } else if (step === 2) {
    
              $activeSlide.
              css({
                'z-index': 3,
                'transform': 'scale(' + (1 - (1 - opt.scaleFactor) * (-mult - 0.7) / 0.3) + ')',
                'transform-origin': +(50 - 50 * (-mult - 0.7) / 0.3) + '% 50%',
                'left': state.itemWidth * (-mult - 0.7) / 0.3 - state.itemWidth + opt.swing * (mult + 0.7) / 0.3 });
    
    
              $futureSlide.
              css({
                'z-index': 4 });
    
    
              if (stepChanged) {
                $activeSlide.removeClass('active');
                $futureSlide.addClass('active');
              }
    
            }
    
            // Prev Slide
            if (step === 1 || step === 2) {
              $futureSlide.
              css({
                'transform': 'scale(' + (0.2 * -mult + opt.scaleFactor) + ')',
                'transform-origin': +(100 - 50 * -mult) + '% 50%',
                'left': opt.swing + opt.swing * mult });
    
            }
    
            // end
            if (step === 3) {
    
              if (!stepChanged) return;
    
              $activeSlide.
              css({
                'z-index': 3,
                'transform': 'scale(' + opt.scaleFactor + ')',
                'transform-origin': '0% 50%',
                'left': -opt.swing });
    
    
              $futureSlide.
              css({
                'z-index': 4,
                'transform': 'scale(1)',
                'transform-origin': '50% 50%',
                'left': 0 });
    
    
            }
          },
          renderReset: function (id) {
            // TODO refactor
            var resetStyles = {
              'will-change': '',
              'z-index': '',
              'transform': '',
              'transform-origin': '',
              'left': '' };
    
            state.$activeSlide.
            removeClass('active').
            css(resetStyles);
            state.$prevSlide.
            removeClass('active').
            css(resetStyles);
            state.$nextSlide.
            removeClass('active').
            css(resetStyles);
    
            plg.toSlide(id);
    
          },
          updateState: function (mult) {
            var stepChanged = null,
            $activeSlide,
            $futureSlide,
            step = function (s) {
              var stp = null;
              return {
                get: function (s) {
                  return stp;
                },
                set: function (s) {
                  if (s !== stp) {
                    stp = s;
                    return true;
                  }
                  return false;
                } };
    
            }();
            $activeSlide = state.$activeSlide;
            if (mult > 0) {
              $futureSlide = state.$prevSlide;
            } else {
              $futureSlide = state.$nextSlide;
            }
    
            // move active card
            // TODO test without it
            if (!($activeSlide instanceof jQuery && $futureSlide instanceof jQuery) || isNaN(mult)) return;
    
            if (mult >= -0.7 && mult <= 0.7) {
              stepChanged = step.set(1);
            } else if (mult > 0.7 && mult < 1 || mult < -0.7 && mult > -1) {
              stepChanged = step.set(2);
            } else {
              stepChanged = step.set(3);
            }
    
            if (mult === 0) {
    
              state.direction = 0;
              plg.renderReset(state.current);
    
    
            } else if (mult <= -1) {
    
              state.direction = 0;
              plg.renderReset(plg.nextSlide());
    
    
            } else if (mult >= 1) {
    
              state.direction = 0;
              plg.renderReset(plg.prevSlide());
    
    
            } else if (mult > 0) {
    
              if (state.direction == -1) plg.renderReset(state.current);
              state.direction = 1;
              plg.renderFw($activeSlide, $futureSlide, mult, step.get(), stepChanged);
    
    
            } else if (mult < 0) {
    
              if (state.direction == 1) plg.renderReset(state.current);
              state.direction = -1;
              plg.renderBw($activeSlide, $futureSlide, mult, step.get(), stepChanged);
    
    
            }
    
          },
          animateSlideToFinish: function (status, speed, startTime) {
            var animationTime, endTime, startAnimation;
            animationTime = speed - speed * Math.abs(status);
            endTime = startTime + animationTime;
            startAnimationTime = endTime - speed;
            requestAnimFrame(function loop() {
    
              var time = new Date().getTime(),
              calculatedState = status * (time - startAnimationTime) / (startTime - startAnimationTime);
    
              if (time > endTime || state.touched) {
                if (status > 0) {
                  plg.updateState(1);
                } else {
                  plg.updateState(-1);
                }
                return;
              }
    
              plg.updateState(calculatedState);
              requestAnimFrame(loop);
            });
          },
          animateSlideToStart: function (status, speed, startTime) {
            var animationTime, endTime, startAnimation;
            animationTime = speed * Math.abs(status);
            endTime = startTime + animationTime;
            startAnimationTime = startTime - animationTime;
            requestAnimFrame(function loop() {
    
              var time = new Date().getTime(),
              calculatedState = status * (endTime - time) / (startTime - startAnimationTime);
    
              if (time > endTime) {
                plg.updateState(0);
                return;
              }
    
              plg.updateState(calculatedState);
              requestAnimFrame(loop);
            });
          },
          createPagination: function () {
            var $lablesSlider;
    
            if (DOM.$pagination) {
    
              DOM.$pagination.empty();
    
            } else {
    
              DOM.$pagination = $('<div>').addClass(opt.paginationHolderClass);
    
              if (opt.pagination) {
    
                DOM.$pagination.appendTo(DOM.$slider);
    
              }
    
            }
    
            $('<div>').
            addClass(opt.prevClass).
            appendTo(DOM.$pagination).
            on('click', () => {plg.animateSlideToFinish(0.1, opt.speed, new Date().getTime());});
    
    
            if (opt.lablesSlider) {
    
              //$lablesSlider = $('<ul>')
              //.addClass( opt.lablesHolderClass )
              //.appendTo( DOM.$pagination );
    
              DOM.$slides.each(function (i) {
    
                $('<li>').
                html($(this).data('name') || "&nbsp").
                appendTo($lablesSlider);
    
              });
    
            }
    
            for (var i = 0; i < state.pages / opt.slidesOnPage; i++) {
              var page = $('<div>').data('page', i).addClass(opt.paginationPageClass);
    
              if (!i) {
    
                page.addClass('active');
    
              }
    
              DOM.$pagination.append(page);
            }
    
            $('<div>').
            addClass(opt.nextClass).
            appendTo(DOM.$pagination).
            on('click', () => {plg.animateSlideToFinish(-0.1, opt.speed, new Date().getTime());});
    
          },
          getCurrent: function () {
            return state.current;
          } };
    
    
        // initializing
        plg.init();
        plg.resize();
    
        // resize
        $window.on('resize', function () {
          plg.resize();
        });
    
        // click events
        DOM.$slider.on('click', function (e) {
    
          var $target = $(e.target);
    
          if ($target.hasClass('page')) {
    
            plg.toSlide($(e.target).data('page'));
    
          } else if ($target.hasClass(opt.prevClass)) {
    
            plg.prevSlide();
    
          } else if ($target.hasClass(opt.nextClass)) {
    
            plg.nextSlide();
    
          } else if (opt.clickToNext && $target.parents(opt.slideClass).length) {
    
            // plg.nextSlide();
    
            var $slideTrigger = $target.closest(opt.slideClass);
            var targetId = parseInt($slideTrigger.attr('data-id'));
            if (typeof targetId !== 'number') return;
    
            // TODO not .not('.cloned')
    
            if (!$slideTrigger.hasClass('active')) {
              e.preventDefault();
              e.stopPropagation();
              if (targetId > state.current) {
                plg.nextSlide();
              } else {
                plg.prevSlide();
              }
            }
    
          }
    
        });
    
        if (opt.mouseWheel) {
    
          state.lastScrollTime = new Date().getTime();
    
          DOM.$slider.on('DOMMouseScroll wheel', function (e) {
    
            e.preventDefault();
            e.stopPropagation();
    
            var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail || -e.originalEvent.deltaY;
            if (state.lastScrollTime + opt.speed < new Date().getTime()) {
    
              if (delta > 0) {
    
                plg.animateSlideToFinish(-0.1, opt.speed, new Date().getTime());
    
              } else if (delta < 0) {
    
                plg.animateSlideToFinish(0.1, opt.speed, new Date().getTime());
    
              }
    
              state.lastScrollTime = new Date().getTime();
    
            }
    
          }).on('mousewheel', function (e) {
    
            e.preventDefault();
            e.stopPropagation();
    
            var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail || -e.originalEvent.deltaY;
            if (pagesState.lastScrollTime + opt.speed < new Date().getTime()) {
    
              if (delta > 0) {
    
                plg.animateSlideToFinish(-0.1, opt.speed, new Date().getTime());
    
              } else if (delta < 0) {
    
                plg.animateSlideToFinish(0.1, opt.speed, new Date().getTime());
    
              }
    
              state.lastScrollTime = new Date().getTime();
    
            }
    
          });
    
        }
    
        if (opt.touch) {
    
          // drag events
          DOM.$slider.on('touchstart', function (e) {
            state.touchStart.timeStamp = e.timeStamp;
          }).on('touchmove', function (e) {
            var mult;
            state.touched = true;
    
            state.touchEnd.xPos = e.originalEvent.touches[0].clientX;
            state.touchEnd.yPos = e.originalEvent.touches[0].clientY;
    
            if (!state.touchStart.xPos) {
              state.touchStart.xPos = e.originalEvent.touches[0].clientX;
            }
    
            if (!state.touchStart.yPos) {
              state.touchStart.yPos = e.originalEvent.touches[0].clientY;
            }
    
            state.deltaX = state.touchEnd.xPos - state.touchStart.xPos;
            if (state.deltaX > 10 || state.deltaX < -10) e.preventDefault();
    
            mult = state.deltaX / state.itemWidth;
    
            mult = Math.min(0.9999, mult);
            mult = Math.max(-0.9999, mult);
    
            plg.updateState(mult);
    
          }).on('touchend touchcancel', function (e) {
            // TODO reformat it
            state.touched = false;
            var distance = 70,
            speed = opt.speed || 200,
            currentStatus = state.deltaX / state.itemWidth;
    
            if (currentStatus < 0.3 && currentStatus > -0.3) {
              plg.animateSlideToStart(currentStatus, opt.speed, new Date().getTime());
            } else if (currentStatus < 1 || currentStatus > -1) {
              plg.animateSlideToFinish(currentStatus, opt.speed, new Date().getTime());
            } else {
              // plg.animateSlideToFinish
              // plg.updateState( 1 );
            }
    
            state.touchEnd.xPos = 0;
            state.touchEnd.yPos = 0;
    
            cleanMoveState();
    
          });
        }
    
        if (opt.mouseDrug) {
          DOM.$section.on('mousedown', function (e) {
            state.touchStart.timeStamp = e.timeStamp;
          }).on('mousemove', function (e) {
            if (e.buttons < 1) {
              touchendCleaner();
              return;
            }
    
            var mult;
            state.touched = true;
    
            state.touchEnd.xPos = e.pageX;
            state.touchEnd.yPos = e.pageY;
    
            if (!state.touchStart.xPos) {
              state.touchStart.xPos = state.touchEnd.xPos;
            }
    
            if (!state.touchStart.yPos) {
              state.touchStart.yPos = state.touchEnd.yPos;
            }
    
            state.deltaX = state.touchEnd.xPos - state.touchStart.xPos;
            //if (state.deltaX > 10 || state.deltaX < -10) e.preventDefault();
    
            mult = state.deltaX / state.itemWidth;
    
            mult = Math.min(0.9999, mult);
            mult = Math.max(-0.9999, mult);
    
            plg.updateState(mult);
    
          }).on('mouseup mouseleave', function (e) {
            // TODO reformat it
            state.touched = false;
            var distance = 70,
            speed = opt.speed || 200,
            currentStatus = state.deltaX / state.itemWidth;
    
            if (currentStatus < 0.3 && currentStatus > -0.3) {
              plg.animateSlideToStart(currentStatus, opt.speed, new Date().getTime());
            } else if (currentStatus < 1 || currentStatus > -1) {
              plg.animateSlideToFinish(currentStatus, opt.speed, new Date().getTime());
            } else {
              // plg.animateSlideToFinish
              // plg.updateState( 1 );
            }
    
            state.touchEnd.xPos = 0;
            state.touchEnd.yPos = 0;
    
            cleanMoveState();
          });
        }
    
        $window.on('resize', plg.resize.bind(plg));
    
        return {
          'getCurrent': plg.getCurrent,
          'init': plg.init,
          'nextSlide': () => {plg.animateSlideToFinish(-0.1, opt.speed, new Date().getTime());},
          'prevSlide': () => {plg.animateSlideToFinish(0.1, opt.speed, new Date().getTime());} };
    
      };
    
      if (this.length > 1) {
        return this.each(plugin);
      } else if (this.length === 1) {
        return plugin.call(this[0]);
      }
    };
    
    })(jQuery);
    
    var test = $('.cards-slider').cardsSlider({
    'holderClass': 'cards-holder',
    'pagination': false,
    'mouseWheel': false,
    'mouseDrug': true,
    'viewportClass': 'content-holder',
    'slideClass': 'card' });