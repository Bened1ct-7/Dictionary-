const searchIcon = document.querySelector('.search-icon'),
  menuBar = document.querySelector('.menu-bar'),
  bookIcon = document.querySelector('.book'),
  searchDiv = document.querySelector('.search'),
  backIcon = document.querySelector('.back-icon'),
  btn = searchDiv.querySelector('button'),
  searchInput = searchDiv.querySelector('input'),
  menu = document.querySelector('.menu'),
  loader = document.querySelector('.loader'),
  content = document.querySelector('.content .container-md'),
  historyUl = document.querySelector('.history ul'),
  backHistory = document.querySelector('.history-back'),
  historyBtn = document.querySelectorAll('.menu-item.show-history'),
  historyPage = document.querySelector('.history'),
  nav = document.querySelector('.navigation'),
  bookmarkBack = document.querySelector('.bookmark-back'),
  bookmarkBtn = document.querySelectorAll('.menu-item.show-bookmark'),
  bookmarkPage = document.querySelector('.bookmark'),
  bookmarkUl = document.querySelector('.bookmark ul');

let date = new Date;

// Functionality Classes

class Word {
  word;
  date;
  constructor(word, date) {
    this.word = word;
    this.date = date;
  }
}

class UI {
  static displaySearch() {
    menuBar.classList.add('d-none');
    bookIcon.classList.replace('d-flex', 'd-none');
    searchIcon.classList.add('d-none');
    searchDiv.classList.remove('d-none');
  }

  static removeSearch() {
    menuBar.classList.remove('d-none');
    bookIcon.classList.replace('d-none', 'd-flex');
    searchIcon.classList.remove('d-none');
    searchDiv.classList.add('d-none');
  }

  static displayError() {
    menu.classList.add('d-none');
    loader.classList.add('d-none');
    content.innerHTML = `<div class="mt-5 text-center">An error occured. Try again later</div>`
  }

  static createHeader(word, obj) {
    let className = "text-light";
    const bookmarks = Storage.getBookmarks();

    if (bookmarks.length > 0) {
      for (let i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].word == word) {
          className = "text-warning";
          break;
        }
      }
    }

    content.innerHTML += `<header class="d-flex dark-blue py-2 px-2 align-items-center justify-content-between">
            <div class="d-flex align-items-center; justify-content-between;">
              <i onclick="playAudio()" class="fa-solid fa-microphone voice fs-4 me-1"></i>
              <span class="text-capitalize ms-1 fs-5">${word}</span>
            </div>
            <div>
              <i onclick="Bookmark.create(this, '${word}')" class="fa-solid fa-star fs-4 ${className}"></i>
            </div>
          </header>`;
    const header = document.querySelector('header');
    let audioElement;
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].audio && obj[i].audio !== "") {
        audioElement = document.createElement('audio');
        audioElement.controls = "controls";
        audioElement.src = obj[i].audio;
        audioElement.type = "audio/mpeg";
        audioElement.className = "d-none";
        header.appendChild(audioElement);
        break;
      }
    }
  }

  static createPronunciationDiv(data) {
    content.innerHTML += `<div class="my-3 px-1">
            <h2>Pronunciation</h2>
            <ul></ul>
          </div>`;
    const ul = document.querySelector('ul');
    for (const item of data) {
      if (item.text) {
        ul.innerHTML += `<li>${item.text}</li>`;
      }
    }
  }

  static createMeaningDiv(data) {
    data.forEach(word => {
      content.innerHTML += `<div class="separator"></div>
          <div class="px-2">
           <div class="text-capitalize mb-2 fs-5 fw-normal italic">${word.partOfSpeech}</div>
          </div>`;
      UI.createDefinitionsDiv(word.definitions);
      UI.createSynonymsDiv(word.synonyms, 'Synonym(s)');
      UI.createAntonymnsDiv(word.antonyms, 'Antonyms(s)');
    })
  }

  static createDefinitionsDiv(data) {
    const list = document.createElement('ol');

    data.forEach(word => {
      const example = word.example ?? '';
      list.innerHTML += `<li class="definition px-2 mb-3">
            <div class="my-1">${word.definition}</div>
            <div class="italic text-muted mb-2">${example}</div>
          </li>`;
    })
    content.appendChild(list);
  }

  static createSynonymsDiv(data, title) {
    if (data.length > 0) {
      const list = document.createElement('ul');
      list.innerHTML += `<div class="mb-1 italic">${title}</div>`
      data.forEach(word => {
        list.innerHTML += `<li>${word}</li>`;
      })
      content.appendChild(list);
    }
  }

  static createAntonymnsDiv(data, title) {
    if (data.length > 0) {
      const list = document.createElement('ul');
      list.innerHTML += `<div class="mb-1 italic">${title}</div>`
      data.forEach(word => {
        list.innerHTML += `<li>${word}</li>`;
      })
      content.appendChild(list);
    }
  }

  static createSourceUrlDiv(url) {
    content.innerHTML += `<div class="separator"></div><div class="text-center my-4">
            <a class="text-dark" href="${url}">learn more about this word</a>
          </div>`;
  }
}

class Dictionary {
  static createWord(data, date) {
    const word = new Word(data, date);
    return word;
  }

  static displayData(data) {
    const items = data[0];
    UI.createHeader(items.word, items.phonetics);
    UI.createPronunciationDiv(items.phonetics);
    UI.createMeaningDiv(items.meanings);
    UI.createSourceUrlDiv(items.sourceUrls[0])
  }

  static async fetchData(word) {
    History.showDictionary();
    Bookmark.showDictionary();
    const value = word.toLowerCase().trim();
    menu.classList.add('d-none');
    loader.classList.remove('d-none');
    date = new Date;
    const time = date.toLocaleTimeString();
    const obj = Dictionary.createWord(word, time);
    Storage.storeWord(obj);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${value}`);
      const data = await response.json();
      content.innerHTML = ``;
      Dictionary.displayData(data);
      loader.classList.add('d-none');
    } catch (e) {
      UI.displayError();
    }
  }
}

class Storage {
  static getWords() {
    const words = JSON.parse(localStorage.getItem('history')) || [];
    return words;
  }

  static storeWord(word) {
    const words = Storage.getWords();
    words.push(word);
    localStorage.setItem('history', JSON.stringify(words));
  }

  static removeWord(selected) {
    const words = Storage.getWords();
    words.splice(selected, 1);
    localStorage.setItem('history', JSON.stringify(words));
    History.showHistory();
  }

  static getBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    return bookmarks;
  }

  static storeBookmark(bookmark) {
    const bookmarks = Storage.getBookmarks();
    bookmarks.push(bookmark);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }

  static removeBookmark(selected) {
    const bookmarks = Storage.getBookmarks();
    bookmarks.splice(selected, 1);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    Bookmark.showBookmark();
  }

  static deleteBookmark(word) {
    const bookmarks = Storage.getBookmarks();
    bookmarks.forEach((book, index) => {
      if (book.word == word) {
        bookmarks.splice(index, 1);
      }
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    })
  }
}

class History {
  static showHistory() {
    historyUl.innerHTML = "";
    const words = Storage.getWords();
    for (let i = words.length - 1; i >= 0; i--) {
      const li = `<li id="${i}">
            <div onclick="Dictionary.fetchData('${words[i].word}')">
              <div>${words[i].word}</div>
              <div class="text-muted">${words[i].date}</div>
            </div>
            <div>
              <i onclick="Storage.removeWord(this.parentNode.parentNode.id)" class="fa-solid fa-x"></i>
            </div>
          </li>`;
      historyUl.innerHTML += li;
    }
  }

  static showHistoryPage() {
    History.showHistory();
    historyPage.classList.remove('hide');

  }

  static showDictionary() {
    historyPage.classList.add('hide');
  }

}

class Bookmark {

  constructor(word) {
    this.word = word;
  }

  static create(el, word) {
    if (el.classList.contains('text-light')) {
      el.classList.replace('text-light', 'text-warning');
      const bookmark = new Bookmark(word);
      Storage.storeBookmark(bookmark);
    } else {
      el.classList.replace('text-warning', 'text-light');
      Storage.deleteBookmark(word);
    }
  }

  static showBookmark() {
    bookmarkUl.innerHTML = "";
    const bookmarks = Storage.getBookmarks();
    for (let i = bookmarks.length - 1; i >= 0; i--) {
      const li = `<li id="${i}">
                <div onclick="Dictionary.fetchData('${bookmarks[i].word}')">
                  <div>${bookmarks[i].word}</div>
                </div>
                <div>
                  <i onclick="Storage.removeBookmark(this.parentNode.parentNode.id)" class="fa-solid fa-x"></i>
                </div>
              </li>`;
      bookmarkUl.innerHTML += li;
    }
  }
  
  static showBookmarkPage() {
    Bookmark.showBookmark();
    bookmarkPage.classList.remove('hide');

  }
  
  static showDictionary() {
    bookmarkPage.classList.add('hide');
  }
}

// Event Listeners

btn.addEventListener('click', () => Dictionary.fetchData(searchInput.value));

searchIcon.addEventListener('click', () => {
  UI.displaySearch();
})

backIcon.addEventListener('click', () => {
  UI.removeSearch();
})

searchInput.addEventListener('input', () => {
  let btnClass = (searchInput.value === '') ? 'visibility' : '';

  btn.className = btnClass;
})

searchInput.addEventListener('keydown', (e) => {
  if (e.key == "Enter" && searchInput.value !== "") {
    Dictionary.fetchData(searchInput.value);
  }
})

backHistory.addEventListener('click', () => {
  History.showDictionary();
})

bookmarkBack.addEventListener('click', () => {
  Bookmark.showDictionary();
})


historyBtn.forEach(btn => {
  btn.addEventListener('click', () => {
    History.showHistoryPage();
  })
})

bookmarkBtn.forEach(btn => {
  btn.addEventListener('click', () => {
    Bookmark.showBookmarkPage();
  })
})

menuBar.addEventListener('click', () => {
  if (!nav.classList.contains('active')) {
    nav.classList.add('active');
    menuBar.classList.add('active');
    menuBar.classList.replace('fa-bars', 'fa-x');
    menuBar.style.transform = "rotate(360deg)";
  } else {
    nav.classList.remove('active');
    menuBar.classList.remove('active');
    menuBar.classList.replace('fa-x', 'fa-bars');
    menuBar.style.transform = "rotate(-360deg)";
  }
  document.onclick = (e) => {
    if (nav.classList.contains('active') && e.target !== nav && e.target !== menuBar) {
      nav.classList.remove('active');
      menuBar.classList.remove('active');
      menuBar.classList.replace('fa-x', 'fa-bars');
      menuBar.style.transform = "rotate(-360deg)";
    }
  }
})
