// Model
let totalKeypressed = 0;
let totalCorrectKeypressed = 0;
let timer = localStorage.getItem('duration');
let mode = localStorage.getItem('mode');

if (timer === null) {
  timer = 15;
  localStorage.setItem('duration', 15);
}

if (mode === null) {
  mode = 'easy';
  localStorage.setItem('mode', 'easy');
}

const csrfToken = document.getElementById('result_csrf_token').value;

// View
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      fetchWords();
      displayContent();
    }
  });
});

const displayContent = () => {
  document.querySelector('#content-section').style.display = 'block';
  document.querySelector('#result-section').style.display = 'none';
  document.querySelector('#settings-section').style.display = 'none';
};

const displayResult = () => {
  document.querySelector('#content-section').style.display = 'none';
  document.querySelector('#result-section').style.display = 'block';
  document.querySelector('#settings-section').style.display = 'none';
};

const displaySetings = () => {
  document.querySelector('#content-section').style.display = 'none';
  document.querySelector('#result-section').style.display = 'none';
  document.querySelector('#settings-section').style.display = 'block';
};

const updateUI = (wpm, accuracy, time) => {
  document.querySelector('#wpm').innerHTML = `WPM: ${wpm}`;
  document.querySelector('#accuracy').innerHTML = `Accuracy: ${accuracy}%`;
  document.querySelector('#time').innerHTML = `Time: ${time} secs`;
};

const splitLetter = (text) => {
  const container = document.createElement('div');

  text.split('').forEach((letter) => {
    let element = document.createElement('span');
    element.classList.add('letter');
    element.setAttribute('data-char', letter);
    element.innerHTML = letter;
    container.appendChild(element);
  });

  return container;
};

// Function to display all words
const displayWord = (words) => {
  let element = document.querySelector('#text-container');
  element.innerHTML = '';

  words.forEach((word) => {
    element.appendChild(splitLetter(word + ' '));
  });
};

document.getElementById('settings-button').addEventListener('click', () => {
  displaySetings();
});

// Controller
const fetchWords = async () => {
  try {
    const response = await fetch('/generate-words', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({
        mode: mode,
      }),
    });
    const test = await response.json();
    // const test = await words.words.toLowerCase();
    displayWord(test.words);
    startTyping();
  } catch (error) {
    console.log(error);
  }
};

const startTyping = () => {
  let moveCount = 0;
  let timerStarted = false;

  const allText = document.querySelectorAll('.letter');
  allText[0].classList.add('current');

  allText.forEach((space) => {
    if (space.textContent === ' ') {
      space.classList.add('space');
    }
  });

  const durationButtons = document.querySelectorAll('.time');

  const container = document.querySelector('#text-container');
  const lineCount = 3;
  let lastScrollTop = 0;

  container.addEventListener('scroll', () => {
    const currentLine = Math.floor(container.scrollTop / 45) + 1;

    if (currentLine >= lineCount && container.scrollTop > lastScrollTop) {
      container.scrollTop += 45;
    }

    lastScrollTop = container.scrollTop;
  });

  // console.log(container.scrollTop);
  // console.log(container.scrollHeight / 45);
  // console.log(container.offsetHeight);

  const startTimer = (time) => {
    const counter = setInterval(() => {
      durationButtons.forEach((button) => {
        button.setAttribute('disabled', true);
      });
      document.querySelector('#timer').innerHTML = `${time--}`;

      if (time === 0) {
        clearInterval(counter);
        calculateResult();
        displayResult();
        durationButtons.forEach((button) => {
          button.removeAttribute('disabled');
        });
      }
    }, 1000);
  };

  const handleDurationClick = (e) => {
    durationButtons.forEach((button) => {
      button.classList.remove('selected-time');
    });

    e.target.classList.add('selected-time');
    let time = parseInt(e.target.dataset['time']);
    localStorage.setItem('duration', time);
    e.target.blur();
  };

  durationButtons.forEach((time) => {
    time.addEventListener('click', handleDurationClick);
    if (timer == time.dataset['time']) {
      time.classList.add('selected-time');
    }
  });

  const handleKeyDown = (e) => {
    if (
      (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) ||
      ['Backspace', 'Shift'].includes(e.key) ||
      e.code === 'Space'
    ) {
      if (!timerStarted) {
        let time = parseInt(localStorage.getItem('duration'));
        startTimer(time);
        timerStarted = true;
      }

      let currentText = allText[moveCount];

      if (e.key !== 'Backspace') {
        if (e.key === currentText.dataset['char']) {
          currentText.classList.add('correct');
          allText[moveCount].classList.remove('current');
          moveCount++;
          totalCorrectKeypressed++;
          totalKeypressed++;
          allText[moveCount].classList.add('current');
        } else {
          currentText.classList.add('incorrect');
          allText[moveCount].classList.remove('current');
          moveCount++;
          totalKeypressed++;
          allText[moveCount].classList.add('current');
        }
      }

      if (e.key === 'Backspace') {
        allText[moveCount].classList.remove('current');
        moveCount--;
        allText[moveCount].classList.add('current');

        allText[moveCount].classList.contains('correct')
          ? allText[moveCount].classList.remove('correct')
          : allText[moveCount].classList.remove('incorrect');
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
};

const calculateResult = () => {
  let time = parseInt(localStorage.getItem('duration'));

  let wpm = Math.round(totalCorrectKeypressed / 5 / (time / 60));
  let accuracy =
    100 -
    Math.round(
      ((totalKeypressed - totalCorrectKeypressed) / totalKeypressed) * 100
    );

  updateUI(wpm, accuracy, time);

  try {
    fetch('/results', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({
        wpm,
        accuracy,
        mode: time,
        difficulty: 'expert',
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
      });
  } catch (error) {
    console.log(error);
  }
};

let modeButtons = document.querySelectorAll('.difficulty');

const selectMode = (e) => {
  modeButtons.forEach((button) => {
    button.classList.remove('selected-time');
  });

  e.target.classList.add('selected-time');
  let newMode = e.target.dataset['mode'];
  localStorage.setItem('mode', newMode);
  e.target.blur();
};

modeButtons.forEach((time) => {
  time.addEventListener('click', selectMode);
  if (mode == time.dataset['mode']) {
    time.classList.add('selected-time');
  }
});

// Initialize the typing after fetching words
fetchWords();

// Initial UI setup
displayContent();
