const wordSection = document.querySelector('.main');
const main = document.querySelector('main');
const form = document.forms['searchForm'];
const btn = form.querySelector('button');
const searchInput = form.querySelector('#search');
const preLoader = document.querySelector('.preloader');

let res, data;

window.addEventListener('load', () => {
   preLoader.classList.remove('active');
})


const fetchData = async () => {
  try {
    preLoader.classList.add('active');
    wordSection.innerHTML = '';

    res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchInput.value.toLowerCase().trim()}`);
    data = await res.json();
    wordSection.classList.remove('active');
    console.log(data);
    preLoader.classList.remove('active');
    if (!data.title) {
      displayData(data);
    } else {
      displayError(data);
    }
  } catch (e) {
    console.log(e);
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();

  if (searchInput.value !== '') {
    fetchData();
  }

  searchInput.value = '';
})


function displayData(items) {
  const item = items[0];
  const wordDiv = document.createElement('div');
  wordDiv.className = 'word';
  wordSection.appendChild(wordDiv)
  const title = document.createElement('h2');
  title.textContent = item.word.toUpperCase();
  wordDiv.appendChild(title);

  const phonetics = item.phonetics;

  const phoneticDiv = document.createElement('div');
  phoneticDiv.className = 'audio';
  const phoneticTitle = document.createElement('h2');
  const list = document.createElement('ul');
  phoneticTitle.textContent = 'Pronunciation';
  phoneticDiv.appendChild(phoneticTitle);
  phoneticDiv.appendChild(list);
  wordSection.appendChild(phoneticDiv);

  phonetics.forEach(phonetic => {
    const listItem = document.createElement('li');
    listItem.className = 'audio-list';
    const span = document.createElement('span');
    span.textContent = phonetic.text;
    const sound = document.createElement('audio');
    sound.id = 'audio-player';
    sound.controls = 'controls';
    sound.src = phonetic.audio;
    sound.type = 'audio/mpeg';
    listItem.appendChild(span);
    listItem.appendChild(sound);
    list.appendChild(listItem);
  })

  const meanings = item.meanings;

  const meaningDiv = document.createElement('div');
  meaningDiv.className = 'meaning';
  wordSection.appendChild(meaningDiv);

  meanings.forEach(meaning => {
    const mDiv = document.createElement('div');
    mDiv.className = 'm-div';
    const mTitle = document.createElement('h3');
    const dList = document.createElement('ul');
    dList.className = 'd-list';
    const oList = document.createElement('ul');
    oList.className = 'o-list';
    const sList = document.createElement('ul');
    sList.className = 's-list';

    const definitions = meaning.definitions;

    definitions.forEach(definition => {
      const dListItem = document.createElement('li');
      const dSpan1 = document.createElement('span');
      dSpan1.textContent = definition.definition;
      dListItem.appendChild(dSpan1);
      const dSpan2 = document.createElement('span');
      dSpan2.className = 'example';
      if (!definition.example) {
        dSpan2.textContent = '';
      } else {
        dSpan2.textContent = `Example: ${definition.example}`;
      }
      dListItem.appendChild(dSpan2);
      dList.appendChild(dListItem);
    })

    const opposite = meaning.antonyms;
    const oTitle = document.createElement('h4');
    if (opposite.length > 0) {
      oTitle.textContent = 'Antonymns'
    }
    opposite.forEach(word => {
      if (opposite) {
        const oListItem = document.createElement('li');
        oListItem.textContent = word;
        oListItem.className = 'o-list-item';
        oList.appendChild(oListItem);
      }
    })

    const similar = meaning.synonyms;
    const sTitle = document.createElement('h4');
    if (similar.length > 0) {
      sTitle.textContent = 'Synonyms'
    }
    similar.forEach(word => {
      if (similar) {
        const sListItem = document.createElement('li');
        sListItem.textContent = word;
        sListItem.className = 's-list-item';
        sList.appendChild(sListItem);
      }
    })


    mTitle.textContent = meaning.partOfSpeech.toUpperCase();
    mTitle.className = 'm-title';
    mDiv.appendChild(mTitle);
    mDiv.appendChild(dList);
    mDiv.appendChild(sTitle);
    mDiv.appendChild(sList);
    mDiv.appendChild(oTitle);
    mDiv.appendChild(oList);
    meaningDiv.appendChild(mDiv);

  })

  const source = item.sourceUrls[0];
  const sourceDiv = document.createElement('div');
  sourceDiv.className = 'source-div';
  wordSection.appendChild(sourceDiv);

  const link = document.createElement('a');
  link.className = 'link';
  link.href = source;
  link.target = '_blank'
  link.textContent = 'Learn more about this word';
  sourceDiv.appendChild(link);

}


function displayError(item) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  const para = document.createElement('p');
  const para1 = document.createElement('p');
  const para2 = document.createElement('p');
  para.textContent = item.title;
  para1.textContent = item.message;
  para2.textContent = item.resolution;
  
  
  errorDiv.appendChild(para);
  errorDiv.appendChild(para1);
  errorDiv.appendChild(para2);
  wordSection.appendChild(errorDiv);
}
