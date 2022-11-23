const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let isLoading = true;
  let done = false;
  const ROUNDS = 6;
  const ANSWER_LENGTH = 5;
  setLoading(isLoading);
  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const resObj = await res.json();
  const word = resObj.word.toLocaleUpperCase();
  const wordParts = word.split("");
  isLoading = false;
  setLoading(isLoading);

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGuess.length < ANSWER_LENGTH) {
      // do nothing
      return;
    }

    isLoading = true;
    setLoading(isLoading);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const resObj = await res.json();
    const { validWord } = resObj;
    isLoading = false;
    setLoading(isLoading);
    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        //  do nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        map[guessParts[i]]--;
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }

    currentRow++;
    // TODO did they win or lose
    if (currentGuess === word) {
      document.querySelector(".brand").classList.add("winner");
      done = true;
      alert("You win");
      return;
    } else if (currentRow === ROUNDS) {
      done = true;
      return;
    }
    currentGuess = "";
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
  }
  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

      setTimeout(function () {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
      }, 10);
    }
  }

  document.addEventListener("keydown", function handleKeyDown(event) {
    if (done || isLoading) {
      // do nothing;
      return;
    }
    const action = event.key;
    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toLocaleUpperCase());
    } else {
      // do nothing
    }
  });
  function setLoading(isLoading) {
    loadingDiv.classList.toggle("show", isLoading);
  }
  function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }
  function makeMap(arr) {
    let map = {};
    for (let i = 0; i < arr.length; i++) {
      let element = arr[i];
      if (map[element]) {
        map[element]++;
      } else {
        map[element] = 1;
      }
    }
    return map;
  }
}

init();
