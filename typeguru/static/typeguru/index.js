// Model
let totalKeypressed = 0;
let totalCorrectKeypressed = 0;
let config = localStorage.getItem('config');

// If the configuration is not found in local storage, initialize it with default values.
if (config === null) {
  const defaultConfig = [
    { mode: 'easy' },
    { duration: 15 },
    { difficulty: 'normal' },
  ];
  localStorage.setItem('config', JSON.stringify(defaultConfig));
  config = JSON.stringify(defaultConfig); // Update the config variable
}

// Function to retrieve a specific item from the configuration object
const getConfigItem = (itemName) => {
  let configObject = JSON.parse(config);

  const object = configObject.find((item) => item.hasOwnProperty(itemName));

  if (object && object[itemName] !== undefined) {
    return object[itemName];
  } else {
    return null;
  }
};

// Function to update a specific item in the configuration object
const setConfigItem = (itemName, value) => {
  let configObject = JSON.parse(config);

  configObject.find((item) => item.hasOwnProperty(itemName))[itemName] = value;

  localStorage.setItem('config', JSON.stringify(configObject));
};

const csrfToken = document.getElementById('result_csrf_token').value;

// View
// When the 'Tab' key is pressed, clear the text container and fetch new words.
const handleTabKey = (e) => {
  const modalButton = document.querySelector(
    '[data-modal-hide="leaderboardModal"]'
  );

  if (e.key === 'Tab') {
    e.preventDefault();
    modalButton.click();
    document.querySelector('#text-container').innerHTML = '';
    fetchWords(getConfigItem('mode'));
    displaySection('content-section');
    e.target.blur();
  }
};

// Listen for keydown events to trigger the 'Tab' key handling.
document.addEventListener('keydown', handleTabKey);

// Function to toggle the visibility of sections
const displaySection = (sectionId) => {
  const sections = ['content-section', 'result-section', 'settings-section'];

  sections.forEach((section) => {
    document.getElementById(section).style.display =
      section === sectionId ? 'block' : 'none';
  });
};

// Function to update the UI elements with typing statistics
const updateUI = (wpm, accuracy, time) => {
  document.querySelector('#wpm').innerHTML = `WPM: ${wpm}`;
  document.querySelector('#accuracy').innerHTML = `Accuracy: ${accuracy}%`;
  document.querySelector('#time').innerHTML = `Time: ${time} secs`;
};

// Function to split a text into letter elements
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

// Function to display words in the text container
const displayWord = (words) => {
  let element = document.querySelector('#text-container');
  element.innerHTML = '';

  words.forEach((word) => {
    element.appendChild(splitLetter(word + ' '));
  });
};

// Add a click event listener to the 'settings-button' element
document.getElementById('settings-button').addEventListener('click', () => {
  displaySection('settings-section');
});

// Controller
// Function to fetch words based on the selected mode
const fetchWords = async (mode) => {
  try {
    const response = await fetch('api/generate-words', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ mode }),
    });
    const { words } = await response.json();
    displayWord(words);
    startTyping();
  } catch (error) {
    console.log(error);
  }
};

// Function to start the typing test
// Function to start the typing test
const startTyping = () => {
  let moveCount = 0; // Initialize the index for the current letter being typed.
  let timerStarted = false; // A flag to indicate if the typing timer has started.

  const allText = document.querySelectorAll('.letter'); // Get all letter elements.

  // Set the first letter as 'current' to indicate where typing begins.
  allText[0].classList.add('current');

  // Add 'space' class to spaces within the text.
  allText.forEach((space) => {
    if (space.textContent === ' ') {
      space.classList.add('space');
    }
  });

  const durationButtons = document.querySelectorAll('.time');
  const container = document.querySelector('#text-container');

  const lineCount = 3; // Number of visible lines in the text container.
  let lastScrollTop = 0; // Initialize the last scroll position.

  // Handle scrolling within the text container to keep lines visible.
  container.addEventListener('scroll', () => {
    const currentLine = Math.floor(container.scrollTop / 45) + 1;

    if (currentLine >= lineCount && container.scrollTop > lastScrollTop) {
      container.scrollTop += 45; // Scroll down to show the next line.
    }

    lastScrollTop = container.scrollTop;
  });

  let counter; // Initialize the timer counter.

  // Function to start the typing timer and disable duration buttons.
  const startTimer = (time) => {
    counter = setInterval(() => {
      durationButtons.forEach((button) => {
        button.setAttribute('disabled', true); // Disable duration buttons during the test.
      });
      document.querySelector('#timer').innerHTML = `${time--}`;

      if (time === -1) {
        endTest(); // The timer has reached zero; end the test.
      }
    }, 1000);
  };

  // Function to end the test, calculate results, and reset the timer and UI.
  const endTest = () => {
    clearInterval(counter); // Stop the timer counter.
    calculateResult(); // Calculate and display test results.
    displaySection('result-section'); // Show the results section.
    document.querySelector('#timer').innerHTML = ''; // Clear the timer display.
    durationButtons.forEach((button) => {
      button.removeAttribute('disabled'); // Re-enable duration buttons.
    });
  };

  // Handle clicks on duration buttons to update the selected time.
  const handleDurationClick = (e) => {
    durationButtons.forEach((button) => {
      button.classList.remove('selected-time');
    });

    e.target.classList.add('selected-time'); // Mark the selected duration.
    let time = parseInt(e.target.dataset['time']); // Get the selected duration time.
    setConfigItem('duration', time); // Update the configuration with the selected duration.
    e.target.blur(); // Remove focus from the button.
  };

  // Add click event listeners to duration buttons and highlight the selected duration.
  durationButtons.forEach((time) => {
    time.addEventListener('click', handleDurationClick);
    if (parseInt(getConfigItem('duration')) == time.dataset['time']) {
      time.classList.add('selected-time');
    }
  });

  // Handle keydown events while typing.
  const handleKeyDown = (e) => {
    if (
      (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) || // Allow alphanumeric keypresses.
      ['Backspace', 'Shift'].includes(e.key) || // Allow Backspace and Shift keypresses.
      e.code === 'Space' // Allow Space keypress.
    ) {
      if (!timerStarted) {
        let time = parseInt(getConfigItem('duration'));
        startTimer(time); // Start the timer when the first key is pressed.
        timerStarted = true;
      }

      let currentText = allText[moveCount]; // Get the current letter element being typed.

      if (e.key !== 'Backspace') {
        if (e.key === currentText.dataset['char']) {
          currentText.classList.add('correct'); // Mark the keypress as correct.
          allText[moveCount].classList.remove('current'); // Move to the next letter.
          moveCount++;
          totalCorrectKeypressed++;
          totalKeypressed++;
          allText[moveCount].classList.add('current');
        } else {
          // End the test in expert mode if Space is pressed.
          if (getConfigItem('difficulty') === 'expert' && e.key === ' ') {
            endTest();
          }

          // End the test in master mode if one wrong key is pressed.
          if (getConfigItem('difficulty') === 'master') {
            endTest();
          }
          currentText.classList.add('incorrect'); // Mark the keypress as incorrect.
          allText[moveCount].classList.remove('current'); // Move to the next letter.
          moveCount++;
          totalKeypressed++;
          allText[moveCount].classList.add('current');
        }
      }

      if (e.key === 'Backspace') {
        allText[moveCount].classList.remove('current'); // Move back to the previous letter.
        moveCount--;
        allText[moveCount].classList.add('current');

        // Remove the 'correct' or 'incorrect' class for the current letter.
        allText[moveCount].classList.contains('correct')
          ? allText[moveCount].classList.remove('correct')
          : allText[moveCount].classList.remove('incorrect');
      }
    }
  };

  // Listen for keydown events while typing.
  document.addEventListener('keydown', handleKeyDown);
};

// Function to calculate and display typing test results
const calculateResult = () => {
  let duration = parseInt(getConfigItem('duration'));
  let difficulty = getConfigItem('difficulty');

  // Ensure a minimum time duration of 1 second to prevent division by zero
  let minDuration = Math.max(1, duration);

  let wpm = Math.round(totalCorrectKeypressed / 5 / (duration / 60));

  // Calculate accuracy considering time
  let accuracy =
    100 -
    Math.round(
      ((totalKeypressed - Math.min(totalCorrectKeypressed, totalKeypressed)) /
        totalKeypressed) *
        100
    );

  updateUI(wpm, accuracy, duration);

  const authenticated = document.getElementById('authenticated');
  const authenticatedValue = authenticated.dataset.authenticated;

  if (authenticatedValue === 'True') {
    try {
      fetch('api/save-test-result', {
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
      });
    } catch (error) {
      console.log(error);
    }
  }
};

let modeButtons = document.querySelectorAll('.mode');

// Event handling for mode selection
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

// Event handling for difficulty selection
const selectDifficult = (e) => {
  difficultyButtons.forEach((button) => {
    button.classList.remove('selected-setting');
  });

  e.target.classList.add('selected-setting');
  let difficulty = e.target.dataset['difficulty'];
  setConfigItem('difficulty', difficulty);
  e.target.blur();
};

difficultyButtons.forEach((diff) => {
  let difficulty = getConfigItem('difficulty');
  diff.addEventListener('click', selectDifficult);
  if (difficulty == diff.dataset['difficulty']) {
    diff.classList.add('selected-setting');
  }
});

// Event handling for leaderboard button
document.getElementById('leaderboardButton').addEventListener('click', () => {
  const element = document.getElementById('leaderboard-table');

  fetch('api/leaderboard')
    .then((response) => response.json())
    .then((data) => {
      element.innerHTML = '';
      data.data.forEach((item, index) => {
        element.innerHTML += `
        <div class="flex items-center w-full px-4 ${
          index % 2 === 0 ? '' : 'bg-[#1b1e2c]'
        }">
          <span class="w-8">${index + 1}</span>
          <span class="flex-1">${item.user__username}</span>
          <span class="w-44">${item.wpm}</span>
          <span class="w-44">${item.difficulty}</span>
          <span class="w-32 text-sm">${item.timestamp}</span>
        </div>
      `;
      });
    });
});

// Initialize the typing after fetching words
fetchWords(getConfigItem('mode'));

// Initial UI setup
displaySection('content-section');
