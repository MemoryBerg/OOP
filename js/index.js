function showPass() {
  let input = event.target.parentNode.nextElementSibling;
  input.previousElementSibling.firstElementChild.classList.toggle('show');
  if (input.getAttribute('type') === 'text') {
    input.setAttribute('type', 'password');
    input.previousElementSibling.firstElementChild.innerText = 'show';
  } else {
    input.setAttribute('type', 'text');
    input.previousElementSibling.firstElementChild.innerText = 'Hide';
  }
}

function active() {
  document.getElementById('home').classList = 'header__item active';
}

class Slide {
  /**
   *
   * @param {string} selectorSlides
   * @param {string} selectorParent
   * @param {string} selectorButton
   * @param {object} config
   * @param {number} showSlides
   */

  constructor(
    selectorSlides,
    selectorParent,
    selectorButton,
    config,
    showSlides
  ) {
    this.selectorButton = selectorButton;
    this.sliderList = Array.from(document.querySelectorAll(selectorSlides));
    this.sliderWrapper = document.querySelectorAll(selectorParent)[0];
    this.toolbar = document.querySelectorAll(selectorButton);
    this.buttonPrev = this.toolbar[0];
    this.buttonNext = this.toolbar[this.toolbar.length - 1];
    this.config = {
      direction: 'right',
      interval: 3000,
      isInfinity: false,
      hoverStop: false
    };
    this.showSlides = showSlides;
    this.moveLeft = 0;
    this.move = 0;
    this.totalPercent = 100;
    this.start = 0;
    this.end = 0;
    this.delay = 2000;
    this.sliderArray = [];
    this.pos = 0;
    this.moveTimeout;
    this.slideWidth = this.sliderList[0].clientWidth;
    this.wrapperWidth = this.sliderWrapper.clientWidth;
    this.step = this.wrapperWidth / showSlides / this.wrapperWidth * this.totalPercent;
    this._handleSwipeEndBind = this._handleSwipeEnd.bind(this);
    this._moveSliderBind = this._moveSlider.bind(this, this.config.direction);
    this._moveLaterBind = this._moveLater.bind(this, this.config.direction)

    for (let key in config) {
      if (key in config) {
        this.config[key] = config[key];
      } else {
        this.config.key
      }
    }

    this._onLoad();
  }

  _onLoad() {
    for (let key of this.sliderList) {
      key.style.width = `${this.totalPercent / this.showSlides}%`;
      key.style.flex = `0 0 ${this.totalPercent / this.showSlides}%`;

      let slide = {
        item: key,
        position: this.pos,
        transform: 0
      };

      if (this.sliderArray.length === 0) {
        this.sliderArray.push(slide);
      } else if (!this.sliderArray.some((element, key) => {
        return element.item === key;
      }
      )) {
        this.sliderArray.push(slide);
      }
      this.pos++;
    }
    setTimeout(this._moveSliderBind, this.delay, this.config.direction);
  }

  // identifies index of last or first element in slider

  _firstSlide() {
    let indexSlide = 0;
    let array = this.sliderArray;
    array.forEach(function (item, index) {
      if (item.position < array[indexSlide].position) {
        indexSlide = index;
      }
    });
    return indexSlide;
  }

  _lastSlide() {
    let indexSlide = 0;
    let array = this.sliderArray;
    array.forEach(function (item, index) {
      if (item.position > array[indexSlide].position) {
        indexSlide = index;
      }
    });
    return indexSlide;
  }

  //gets last or first slide

  _getFirst() {
    return this.sliderArray[this._firstSlide()].position;
  }

  _getLast() {
    return this.sliderArray[this._lastSlide()].position;
  }

  _moveSlider(direction) {
    let nextSlide;
    if (direction === 'right') {
      this.moveLeft++;
      if (
        this.moveLeft + this.wrapperWidth / this.slideWidth - 1 >
        this._getLast()
      ) {
        nextSlide = this._firstSlide();
        this.sliderArray[nextSlide].position = this._getLast() + 1;
        this.sliderArray[nextSlide].transform += this.sliderArray.length * this.totalPercent;
        this.sliderArray[
          nextSlide
        ].item.style.transform = `translateX(${this.sliderArray[nextSlide].transform}%`;
      }
      this.move -= this.step;
    }
    if (direction === 'left') {
      this.moveLeft--;
      if (this.moveLeft < this._getFirst()) {
        nextSlide = this._lastSlide();
        this.sliderArray[nextSlide].position = this._getFirst() - 1;
        this.sliderArray[nextSlide].transform -= this.sliderArray.length * this.totalPercent;
        this.sliderArray[
          nextSlide
        ].item.style.transform = `translateX(${this.sliderArray[nextSlide].transform}%`;
      }
      this.move += this.step;
    }
    this.sliderWrapper.style.transform = `translateX(calc(${this.move}%))`;
  }

  _swipeMove() {
    this.start = event.changedTouches[0].pageX;
    this.sliderWrapper.addEventListener('touchend', this._handleSwipeEndBind);
  }

  _handleSwipeEnd(event) {
    this.end = event.changedTouches[event.changedTouches.length - 1].pageX;

    let direction = this.start > this.end ? 'right' : 'left';
    this._moveSlider(direction);
    this.sliderWrapper.removeEventListener(
      'transitionend',
      this._moveSliderBind
    );
    clearTimeout(this.moveTimeout)
    this.sliderWrapper.removeEventListener('mouseup', this._handleSwipeEndBind);
  }

  // sets aside the mooving function

  _moveLater(direction) {
    this.moveTimeout = setTimeout(this._moveSliderBind, this.delay, direction)
  }

  async _controlButtons() {
    if (event.target.classList.contains(this.selectorButton.slice(1))) {
      let direction = event.target.id.includes(this.buttonNext.id)
        ? 'right'
        : 'left';
      await this._moveSlider(direction);
      this.sliderWrapper.removeEventListener(
        'transitionend',
        this._moveLaterBind
      );
      clearTimeout(this.moveTimeout)
      this.infinitySwiping(this.config.direction);
    }
  }

  infinitySwiping(direction) {
    if (!direction) {
      direction = this.config.direction;
    }
    if (!this.config.isInfinity) {
      return;
    }
    this.sliderWrapper.addEventListener('transitionend', this._moveLaterBind);
  }

  controlClick() {
    this.toolbar.forEach((item) => {
      item.addEventListener('click', this._controlButtons.bind(this));
    });
  }

  addListeners() {

    // add listenr to touchstart event

    this.sliderWrapper.addEventListener(
      'touchstart',
      this._swipeMove.bind(this)
    );

    // listener to stop to change slides automatically on hover

    if (this.config.hoverStop && this.config.isInfinity) {
      this.sliderWrapper.addEventListener('mouseenter', () => {
        // clearInterval(this.interval);
        this.sliderWrapper.removeEventListener(
          'transitionend',
          this._moveLaterBind
        );
        clearTimeout(this.moveTimeout)
      });
      this.sliderWrapper.addEventListener('mouseleave', () => {
        this.sliderWrapper.removeEventListener(
          'transitionend',
          this._moveLaterBind
        );
        clearTimeout(this.moveTimeout)
        this._moveSlider(this.config.direction);
        this.infinitySwiping(this.config.direction);
      });
    }
  }
}

const numberOfSlide = 3;

let slider = new Slide(
  '.portfolio__container',
  '#portfolio-list',
  '.portfolio__button-nav',
  {
    isInfinity: true,
    hoverStop: true
  },
  numberOfSlide
);

slider.addListeners();
slider.infinitySwiping();
slider.controlClick();
