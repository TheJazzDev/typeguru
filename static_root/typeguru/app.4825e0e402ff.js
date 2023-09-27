// Model
let totalKeypressed = 0;
let totalCorrectKeypressed = 0;
let config = localStorage.getItem('config');
let difficulty = localStorage.getItem('difficulty');

if (config === null) {
  const config = [{ mode: 'easy' }, { duration: 15 }];
  localStorage.setItem('config', JSON.stringify(config));
}

if (difficulty === null) {
  difficulty = 'normal';
  localStorage.setItem('difficulty', 'normal');
}

const getConfigItem = (itemName) => {
  let configObject = JSON.parse(config);

  const object = configObject.find((item) => item.hasOwnProperty(itemName));

  if (object && object[itemName] !== undefined) {
    return object[itemName];
  } else {
    return null;
  }
};

const setConfigItem = (itemName, value) => {
  let configObject = JSON.parse(config);

  configObject.find((item) => item.hasOwnProperty(itemName))[itemName] = value;

  localStorage.setItem('config', JSON.stringify(configObject));
};

const csrfToken = document.getElementById('result_csrf_token').value;

// View
function handleTabKey(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    document.querySelector('#text-container').innerHTML = '';
    fetchWords(getConfigItem('mode'));
    displayContent();
  }
}

document.addEventListener('keydown', handleTabKey);

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
const fetchWords = async (mode) => {
  try {
    const response = await fetch('/generate-words', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({
        mode,
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

      if (time === -1) {
        clearInterval(counter);
        calculateResult();
        displayResult();
        document.querySelector('#timer').innerHTML = '';
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
    setConfigItem('duration', time);
    e.target.blur();
  };

  durationButtons.forEach((time) => {
    time.addEventListener('click', handleDurationClick);
    if (parseInt(getConfigItem('duration')) == time.dataset['time']) {
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
        let time = parseInt(getConfigItem('duration'));
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
  let duration = parseInt(getConfigItem('duration'));
  let difficulty = localStorage.getItem('difficulty');

  let wpm = Math.round(totalCorrectKeypressed / 5 / (duration / 60));
  let accuracy =
    100 -
    Math.round(
      ((totalKeypressed - totalCorrectKeypressed) / totalKeypressed) * 100
    );

  updateUI(wpm, accuracy, duration);

  try {
    fetch('/results', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({
        wpm,
        accuracy,
        duration,
        difficulty,
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

let modeButtons = document.querySelectorAll('.mode');

const selectMode = (e) => {
  modeButtons.forEach((button) => {
    button.classList.remove('text-slate-300');
  });

  e.target.classList.add('text-slate-300');
  let mode = e.target.dataset['mode'];
  setConfigItem('mode', mode);
  fetchWords(mode);
  e.target.blur();
};

modeButtons.forEach((time) => {
  let mode = getConfigItem('mode');
  time.addEventListener('click', selectMode);
  if (mode == time.dataset['mode']) {
    time.classList.add('text-slate-300');
  }
});

let difficultyButtons = document.querySelectorAll('.difficulty');

const selectDifficult = (e) => {
  difficultyButtons.forEach((button) => {
    button.classList.remove('selected-setting');
  });

  e.target.classList.add('selected-setting');
  let difficulty = e.target.dataset['difficulty'];
  localStorage.setItem('difficulty', difficulty);
  e.target.blur();
};

difficultyButtons.forEach((diff) => {
  diff.addEventListener('click', selectDifficult);
  if (difficulty == diff.dataset['difficulty']) {
    diff.classList.add('selected-setting');
  }
});

// Initialize the typing after fetching words
fetchWords(getConfigItem('mode'));

// Initial UI setup
displayContent();
